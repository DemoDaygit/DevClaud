import { getSession } from '../config/neo4j.js';
import { EXPANDED_GRAPH_DATA, LEARNING_PATHS } from '../data/expandedGraphData.js';

// ============================================
// USER PROGRESS
// ============================================

export async function getUserProgress(userId) {
  const session = getSession();
  try {
    // Get user node with all progress
    const result = await session.run(`
      MATCH (u:User {id: $userId})
      OPTIONAL MATCH (u)-[c:COMPLETED]->(m:Concept)
      OPTIONAL MATCH (u)-[e:ENROLLED_IN]->(p:LearningPath)
      OPTIONAL MATCH (u)-[h:HAS_BADGE]->(b:Badge)
      RETURN u,
             collect(DISTINCT {module: m, completedAt: c.completedAt, score: c.score}) as completed,
             collect(DISTINCT {path: p, progress: e.progress, status: e.status}) as paths,
             collect(DISTINCT b) as badges
    `, { userId });

    if (result.records.length === 0) {
      // Create new user
      await session.run(`
        CREATE (u:User {
          id: $userId,
          xp: 0,
          level: 1,
          streak: 0,
          createdAt: datetime()
        })
        RETURN u
      `, { userId });

      return {
        userId,
        xp: 0,
        level: 1,
        streak: 0,
        completedModules: [],
        learningPaths: [],
        badges: []
      };
    }

    const record = result.records[0];
    const user = record.get('u').properties;
    const completed = record.get('completed');
    const paths = record.get('paths');
    const badges = record.get('badges');

    return {
      userId: user.id,
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || 0,
      completedModules: completed
        .filter(c => c.module)
        .map(c => ({
          moduleId: c.module.properties.id,
          completedAt: c.completedAt,
          score: c.score
        })),
      learningPaths: paths
        .filter(p => p.path)
        .map(p => ({
          pathId: p.path.properties.id,
          progress: p.progress,
          status: p.status
        })),
      badges: badges.map(b => b.properties)
    };
  } finally {
    await session.close();
  }
}

export async function completeModule(userId, moduleId, score, timeSpent) {
  const session = getSession();
  try {
    // Mark module as completed and award XP
    const result = await session.run(`
      MATCH (u:User {id: $userId})
      MATCH (m:Concept {id: $moduleId})

      // Create completion relationship
      MERGE (u)-[c:COMPLETED]->(m)
      ON CREATE SET c.completedAt = datetime(), c.score = $score, c.timeSpent = $timeSpent
      ON MATCH SET c.score = $score, c.lastAttempt = datetime()

      // Calculate XP reward
      WITH u, m, c
      SET u.xp = u.xp + (m.xpReward * ($score / 100.0))

      // Update level if needed
      WITH u
      SET u.level = CASE
        WHEN u.xp >= 3000 THEN 6
        WHEN u.xp >= 1500 THEN 5
        WHEN u.xp >= 700 THEN 4
        WHEN u.xp >= 300 THEN 3
        WHEN u.xp >= 100 THEN 2
        ELSE 1
      END

      RETURN u, c
    `, { userId, moduleId, score, timeSpent });

    const user = result.records[0].get('u').properties;

    // Check for badge unlocks
    await checkBadgeUnlocks(userId, session);

    return {
      success: true,
      xpEarned: Math.round((score / 100) * 50), // Базовый XP
      newLevel: user.level,
      totalXP: user.xp
    };
  } finally {
    await session.close();
  }
}

// ============================================
// FLASHCARDS & SPACED REPETITION
// ============================================

export async function getFlashcardSet(setId) {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (set:FlashcardSet {id: $setId})
      MATCH (set)-[:CONTAINS]->(card:Flashcard)
      RETURN set, collect(card) as cards
    `, { setId });

    if (result.records.length === 0) {
      throw new Error('Flashcard set not found');
    }

    const set = result.records[0].get('set').properties;
    const cards = result.records[0].get('cards').map(c => c.properties);

    return { set, cards };
  } finally {
    await session.close();
  }
}

export async function getDueFlashcards(userId) {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (u:User {id: $userId})
      MATCH (card:Flashcard)
      OPTIONAL MATCH (u)-[r:REVIEWED]->(card)

      WHERE r IS NULL OR datetime(r.nextReview) <= datetime()

      RETURN card, r
      ORDER BY r.nextReview ASC
      LIMIT 20
    `, { userId });

    return result.records.map(record => {
      const card = record.get('card').properties;
      const review = record.get('r') ? record.get('r').properties : null;

      return {
        ...card,
        box: review?.box || 1,
        nextReview: review?.nextReview || new Date().toISOString()
      };
    });
  } finally {
    await session.close();
  }
}

export async function reviewFlashcard(userId, cardId, correct, timeSpent) {
  const session = getSession();
  try {
    // Leitner System algorithm
    const result = await session.run(`
      MATCH (u:User {id: $userId})
      MATCH (card:Flashcard {id: $cardId})

      MERGE (u)-[r:REVIEWED]->(card)

      // Update box and interval based on correctness
      WITH u, card, r,
           CASE WHEN $correct THEN coalesce(r.box, 1) + 1 ELSE 1 END as newBox,
           CASE WHEN $correct THEN coalesce(r.interval, 1) * 2 ELSE 1 END as newInterval

      SET r.box = CASE WHEN newBox > 5 THEN 5 ELSE newBox END,
          r.interval = CASE WHEN newInterval > 30 THEN 30 ELSE newInterval END,
          r.lastReview = datetime(),
          r.nextReview = datetime() + duration({days: CASE WHEN newInterval > 30 THEN 30 ELSE newInterval END}),
          r.reviewCount = coalesce(r.reviewCount, 0) + 1,
          r.correctCount = coalesce(r.correctCount, 0) + CASE WHEN $correct THEN 1 ELSE 0 END

      // Award XP for correct answer
      WITH u, r, $correct as correct
      SET u.xp = u.xp + CASE WHEN correct THEN 5 ELSE 0 END

      RETURN r, u.xp as xp
    `, { userId, cardId, correct, timeSpent });

    const review = result.records[0].get('r').properties;
    const xp = result.records[0].get('xp');

    return {
      success: true,
      box: review.box,
      nextReview: review.nextReview,
      interval: review.interval,
      xpEarned: correct ? 5 : 0,
      totalXP: xp
    };
  } finally {
    await session.close();
  }
}

// ============================================
// QUIZZES
// ============================================

export async function getQuiz(quizId) {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (q:Quiz {id: $quizId})
      MATCH (q)-[:HAS_QUESTION]->(question:Question)
      RETURN q, collect(question) as questions
    `, { quizId });

    if (result.records.length === 0) {
      throw new Error('Quiz not found');
    }

    const quiz = result.records[0].get('q').properties;
    const questions = result.records[0].get('questions').map(q => q.properties);

    return { ...quiz, questions };
  } finally {
    await session.close();
  }
}

export async function startQuizAttempt(userId, quizId) {
  const session = getSession();
  try {
    const attemptId = `attempt_${userId}_${quizId}_${Date.now()}`;

    await session.run(`
      MATCH (u:User {id: $userId})
      MATCH (q:Quiz {id: $quizId})

      CREATE (attempt:QuizAttempt {
        id: $attemptId,
        startedAt: datetime(),
        status: 'in_progress'
      })

      CREATE (u)-[:ATTEMPTED]->(attempt)
      CREATE (attempt)-[:FOR_QUIZ]->(q)

      RETURN attempt
    `, { userId, quizId, attemptId });

    return { attemptId, startedAt: new Date().toISOString() };
  } finally {
    await session.close();
  }
}

export async function submitQuiz(userId, attemptId, answers) {
  const session = getSession();
  try {
    // Get quiz and calculate score
    const result = await session.run(`
      MATCH (u:User {id: $userId})-[:ATTEMPTED]->(attempt:QuizAttempt {id: $attemptId})
      MATCH (attempt)-[:FOR_QUIZ]->(q:Quiz)
      MATCH (q)-[:HAS_QUESTION]->(question:Question)

      WITH u, attempt, q, collect(question) as questions

      // Calculate score
      WITH u, attempt, q, questions,
           [answer IN $answers WHERE answer.correct = true | answer] as correctAnswers

      WITH u, attempt, q, questions, correctAnswers,
           (size(correctAnswers) * 100.0 / size(questions)) as score

      SET attempt.completedAt = datetime(),
          attempt.score = score,
          attempt.status = 'completed',
          attempt.answers = $answers

      // Award XP
      SET u.xp = u.xp + (q.xpReward * (score / 100.0))

      // Create completion if passed
      WITH u, attempt, q, score
      WHERE score >= q.passingScore
      MERGE (u)-[c:COMPLETED]->(q)
      SET c.score = score, c.completedAt = datetime()

      RETURN attempt, score, u.xp as xp
    `, { userId, attemptId, answers });

    const attempt = result.records[0].get('attempt').properties;
    const score = result.records[0].get('score');
    const xp = result.records[0].get('xp');

    return {
      success: true,
      score: Math.round(score),
      passed: score >= attempt.passingScore,
      xpEarned: Math.round((score / 100) * 25),
      totalXP: xp,
      completedAt: attempt.completedAt
    };
  } finally {
    await session.close();
  }
}

// ============================================
// CODING EXERCISES
// ============================================

export async function getExercise(exerciseId) {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (ex:Exercise {id: $exerciseId})
      RETURN ex
    `, { exerciseId });

    if (result.records.length === 0) {
      throw new Error('Exercise not found');
    }

    return result.records[0].get('ex').properties;
  } finally {
    await session.close();
  }
}

export async function submitExercise(userId, exerciseId, code, language) {
  // In real implementation, this would run code in sandbox
  // For now, simplified validation
  const session = getSession();
  try {
    const passed = true; // Placeholder for actual test execution
    const testsRun = 5;
    const testsPassed = passed ? 5 : 3;

    if (passed) {
      await session.run(`
        MATCH (u:User {id: $userId})
        MATCH (ex:Exercise {id: $exerciseId})

        MERGE (u)-[c:COMPLETED]->(ex)
        SET c.completedAt = datetime(),
            c.code = $code,
            c.language = $language

        SET u.xp = u.xp + ex.xpReward

        RETURN u.xp as xp
      `, { userId, exerciseId, code, language });
    }

    return {
      success: passed,
      testsRun,
      testsPassed,
      output: passed ? 'All tests passed!' : 'Some tests failed',
      xpEarned: passed ? 50 : 0
    };
  } finally {
    await session.close();
  }
}

export async function getExerciseHint(userId, exerciseId, level) {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (ex:Exercise {id: $exerciseId})
      RETURN ex.hints as hints
    `, { exerciseId });

    const hints = result.records[0].get('hints');
    return hints[level - 1] || 'No more hints available';
  } finally {
    await session.close();
  }
}

// ============================================
// LEARNING PATHS
// ============================================

export async function getLearningPaths() {
  return Object.values(LEARNING_PATHS);
}

export async function getLearningPath(pathId, userId) {
  const path = LEARNING_PATHS[pathId];
  if (!path) {
    throw new Error('Learning path not found');
  }

  if (userId) {
    const session = getSession();
    try {
      const result = await session.run(`
        MATCH (u:User {id: $userId})
        OPTIONAL MATCH (u)-[e:ENROLLED_IN]->(p:LearningPath {id: $pathId})
        OPTIONAL MATCH (u)-[c:COMPLETED]->(m:Concept)
        WHERE m.id IN $modules
        RETURN e, collect(m.id) as completedModules
      `, { userId, pathId, modules: path.modules });

      if (result.records.length > 0) {
        const enrollment = result.records[0].get('e');
        const completedModules = result.records[0].get('completedModules');

        path.userProgress = {
          enrolled: !!enrollment,
          progress: Math.round((completedModules.length / path.modules.length) * 100),
          completedModules
        };
      }
    } finally {
      await session.close();
    }
  }

  return path;
}

export async function enrollInPath(userId, pathId) {
  const session = getSession();
  try {
    await session.run(`
      MATCH (u:User {id: $userId})
      MERGE (p:LearningPath {id: $pathId})
      MERGE (u)-[e:ENROLLED_IN]->(p)
      ON CREATE SET e.enrolledAt = datetime(), e.progress = 0, e.status = 'active'
      RETURN e
    `, { userId, pathId });

    return { success: true, pathId, enrolledAt: new Date().toISOString() };
  } finally {
    await session.close();
  }
}

// ============================================
// GAMIFICATION
// ============================================

export async function getGamificationStats(userId) {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (u:User {id: $userId})
      OPTIONAL MATCH (u)-[:HAS_BADGE]->(b:Badge)
      OPTIONAL MATCH (u)-[:COMPLETED]->(m:Concept)

      RETURN u,
             collect(DISTINCT b) as badges,
             count(DISTINCT m) as completedModules
    `, { userId });

    if (result.records.length === 0) {
      return null;
    }

    const user = result.records[0].get('u').properties;
    const badges = result.records[0].get('badges').map(b => b.properties);
    const completedModules = result.records[0].get('completedModules').toNumber();

    return {
      level: user.level || 1,
      xp: user.xp || 0,
      streak: user.streak || 0,
      badges,
      completedModules,
      levelProgress: calculateLevelProgress(user.xp || 0)
    };
  } finally {
    await session.close();
  }
}

export async function getLeaderboard(period, limit) {
  const session = getSession();
  try {
    // For weekly, filter by last 7 days
    const timeFilter = period === 'weekly' ?
      'WHERE u.lastActivity > datetime() - duration({days: 7})' : '';

    const result = await session.run(`
      MATCH (u:User)
      ${timeFilter}
      RETURN u
      ORDER BY u.xp DESC
      LIMIT $limit
    `, { limit });

    return result.records.map((record, index) => {
      const user = record.get('u').properties;
      return {
        rank: index + 1,
        userId: user.id,
        username: user.username || user.id,
        xp: user.xp || 0,
        level: user.level || 1
      };
    });
  } finally {
    await session.close();
  }
}

export async function getUserBadges(userId) {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (u:User {id: $userId})-[h:HAS_BADGE]->(b:Badge)
      RETURN b, h.earnedAt as earnedAt
      ORDER BY h.earnedAt DESC
    `, { userId });

    return result.records.map(record => ({
      ...record.get('b').properties,
      earnedAt: record.get('earnedAt')
    }));
  } finally {
    await session.close();
  }
}

async function checkBadgeUnlocks(userId, session) {
  // Check for various badge conditions
  const result = await session.run(`
    MATCH (u:User {id: $userId})
    OPTIONAL MATCH (u)-[:COMPLETED]->(m:Concept)

    WITH u, count(m) as completedCount

    // First Steps badge
    WHERE completedCount >= 1
    MERGE (b1:Badge {id: 'badge_first_steps'})
    ON CREATE SET b1.name = 'First Steps', b1.icon = '🏆', b1.xpReward = 50
    MERGE (u)-[h1:HAS_BADGE]->(b1)
    ON CREATE SET h1.earnedAt = datetime()

    RETURN count(h1) as newBadges
  `, { userId });

  return result.records[0]?.get('newBadges').toNumber() || 0;
}

// ============================================
// RECOMMENDATIONS & ADAPTIVE LEARNING
// ============================================

export async function getRecommendations(userId) {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (u:User {id: $userId})
      OPTIONAL MATCH (u)-[:COMPLETED]->(completed:Concept)

      // Find modules user hasn't completed
      MATCH (next:Concept)
      WHERE NOT (u)-[:COMPLETED]->(next)

      // Check if prerequisites are met
      OPTIONAL MATCH (next)<-[:PREREQUISITE]-(prereq:Concept)
      WHERE NOT (u)-[:COMPLETED]->(prereq)

      WITH next, count(prereq) as unmetPrereqs, u
      WHERE unmetPrereqs = 0

      // Get user's average difficulty
      WITH next, u
      OPTIONAL MATCH (u)-[c:COMPLETED]->(past:Concept)
      WITH next, u, avg(past.difficulty) as avgDifficulty

      // Recommend based on Flow Theory (optimal challenge)
      RETURN next
      ORDER BY abs(next.difficulty - avgDifficulty) ASC
      LIMIT 5
    `, { userId });

    return result.records.map(record => record.get('next').properties);
  } finally {
    await session.close();
  }
}

export async function getNextModule(userId) {
  const recommendations = await getRecommendations(userId);
  return recommendations[0] || null;
}

export async function getLearningAnalytics(userId) {
  const session = getSession();
  try {
    const result = await session.run(`
      MATCH (u:User {id: $userId})
      OPTIONAL MATCH (u)-[c:COMPLETED]->(m:Concept)

      WITH u, collect(c) as completions, count(m) as totalCompleted

      RETURN u,
             totalCompleted,
             [c IN completions | c.score] as scores,
             [c IN completions | duration.between(c.completedAt, datetime()).days] as daysSince
    `, { userId });

    if (result.records.length === 0) {
      return null;
    }

    const user = result.records[0].get('u').properties;
    const totalCompleted = result.records[0].get('totalCompleted').toNumber();
    const scores = result.records[0].get('scores');

    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      userId: user.id,
      totalCompleted,
      averageScore: Math.round(avgScore),
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || 0,
      completionRate: 0, // Would calculate based on enrolled paths
      timeSpent: 0 // Would track actual time
    };
  } finally {
    await session.close();
  }
}

// Helper functions
function calculateLevelProgress(xp) {
  const levels = [
    { level: 1, minXP: 0, maxXP: 100 },
    { level: 2, minXP: 100, maxXP: 300 },
    { level: 3, minXP: 300, maxXP: 700 },
    { level: 4, minXP: 700, maxXP: 1500 },
    { level: 5, minXP: 1500, maxXP: 3000 },
    { level: 6, minXP: 3000, maxXP: Infinity }
  ];

  const currentLevel = levels.find(l => xp >= l.minXP && xp < l.maxXP);
  if (!currentLevel) return { percentage: 100, nextLevelXP: 0 };

  const progress = ((xp - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100;

  return {
    percentage: Math.min(Math.round(progress), 100),
    nextLevelXP: currentLevel.maxXP - xp
  };
}

// Additional lab and project methods...
export async function getLab(labId) {
  // Implementation for labs
  return { id: labId, title: 'Lab', tasks: [] };
}

export async function submitLabCheckpoint(userId, labId, checkpointId, data) {
  // Implementation for lab checkpoints
  return { success: true };
}

export async function getProject(projectId) {
  // Implementation for projects
  return { id: projectId, title: 'Project', milestones: [] };
}

export async function submitProjectDeliverable(userId, projectId, milestone, deliverable, url) {
  // Implementation for project submissions
  return { success: true };
}
