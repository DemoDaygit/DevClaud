import express from 'express';
import * as learningService from '../services/learningService.js';

const router = express.Router();

// ============================================
// USER PROGRESS
// ============================================

/**
 * GET /api/learning/progress/:userId
 * Get user's learning progress
 */
router.get('/progress/:userId', async (req, res, next) => {
  try {
    const progress = await learningService.getUserProgress(req.params.userId);
    res.json(progress);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning/progress/:userId/module/:moduleId
 * Update module completion
 */
router.post('/progress/:userId/module/:moduleId', async (req, res, next) => {
  try {
    const { score, timeSpent } = req.body;
    const result = await learningService.completeModule(
      req.params.userId,
      req.params.moduleId,
      score,
      timeSpent
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================
// FLASHCARDS
// ============================================

/**
 * GET /api/learning/flashcards/:setId
 * Get flashcard set
 */
router.get('/flashcards/:setId', async (req, res, next) => {
  try {
    const cards = await learningService.getFlashcardSet(req.params.setId);
    res.json(cards);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/flashcards/:userId/due
 * Get due flashcards for review (Spaced Repetition)
 */
router.get('/flashcards/:userId/due', async (req, res, next) => {
  try {
    const dueCards = await learningService.getDueFlashcards(req.params.userId);
    res.json(dueCards);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning/flashcards/:userId/review
 * Submit flashcard review
 */
router.post('/flashcards/:userId/review', async (req, res, next) => {
  try {
    const { cardId, correct, timeSpent } = req.body;
    const result = await learningService.reviewFlashcard(
      req.params.userId,
      cardId,
      correct,
      timeSpent
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================
// QUIZZES
// ============================================

/**
 * GET /api/learning/quiz/:quizId
 * Get quiz details
 */
router.get('/quiz/:quizId', async (req, res, next) => {
  try {
    const quiz = await learningService.getQuiz(req.params.quizId);
    res.json(quiz);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning/quiz/:userId/start/:quizId
 * Start quiz attempt
 */
router.post('/quiz/:userId/start/:quizId', async (req, res, next) => {
  try {
    const attempt = await learningService.startQuizAttempt(
      req.params.userId,
      req.params.quizId
    );
    res.json(attempt);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning/quiz/:userId/submit/:attemptId
 * Submit quiz answers
 */
router.post('/quiz/:userId/submit/:attemptId', async (req, res, next) => {
  try {
    const { answers } = req.body;
    const result = await learningService.submitQuiz(
      req.params.userId,
      req.params.attemptId,
      answers
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================
// CODING EXERCISES
// ============================================

/**
 * GET /api/learning/exercise/:exerciseId
 * Get coding exercise
 */
router.get('/exercise/:exerciseId', async (req, res, next) => {
  try {
    const exercise = await learningService.getExercise(req.params.exerciseId);
    res.json(exercise);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning/exercise/:userId/submit
 * Submit code for testing
 */
router.post('/exercise/:userId/submit', async (req, res, next) => {
  try {
    const { exerciseId, code, language } = req.body;
    const result = await learningService.submitExercise(
      req.params.userId,
      exerciseId,
      code,
      language
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning/exercise/:userId/hint
 * Request hint for exercise
 */
router.post('/exercise/:userId/hint', async (req, res, next) => {
  try {
    const { exerciseId, level } = req.body;
    const hint = await learningService.getExerciseHint(
      req.params.userId,
      exerciseId,
      level
    );
    res.json(hint);
  } catch (error) {
    next(error);
  }
});

// ============================================
// LABS
// ============================================

/**
 * GET /api/learning/lab/:labId
 * Get interactive lab
 */
router.get('/lab/:labId', async (req, res, next) => {
  try {
    const lab = await learningService.getLab(req.params.labId);
    res.json(lab);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning/lab/:userId/checkpoint
 * Submit lab checkpoint
 */
router.post('/lab/:userId/checkpoint', async (req, res, next) => {
  try {
    const { labId, checkpointId, data } = req.body;
    const result = await learningService.submitLabCheckpoint(
      req.params.userId,
      labId,
      checkpointId,
      data
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================
// PROJECTS
// ============================================

/**
 * GET /api/learning/project/:projectId
 * Get project details
 */
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const project = await learningService.getProject(req.params.projectId);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning/project/:userId/submit
 * Submit project deliverable
 */
router.post('/project/:userId/submit', async (req, res, next) => {
  try {
    const { projectId, milestone, deliverable, url } = req.body;
    const result = await learningService.submitProjectDeliverable(
      req.params.userId,
      projectId,
      milestone,
      deliverable,
      url
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================
// LEARNING PATHS
// ============================================

/**
 * GET /api/learning/paths
 * Get all learning paths
 */
router.get('/paths', async (req, res, next) => {
  try {
    const paths = await learningService.getLearningPaths();
    res.json(paths);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/paths/:pathId
 * Get specific learning path with progress
 */
router.get('/paths/:pathId', async (req, res, next) => {
  try {
    const { userId } = req.query;
    const path = await learningService.getLearningPath(req.params.pathId, userId);
    res.json(path);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/learning/paths/:userId/enroll/:pathId
 * Enroll user in learning path
 */
router.post('/paths/:userId/enroll/:pathId', async (req, res, next) => {
  try {
    const result = await learningService.enrollInPath(
      req.params.userId,
      req.params.pathId
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================
// GAMIFICATION
// ============================================

/**
 * GET /api/learning/gamification/:userId
 * Get user's gamification stats
 */
router.get('/gamification/:userId', async (req, res, next) => {
  try {
    const stats = await learningService.getGamificationStats(req.params.userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/leaderboard
 * Get leaderboard
 */
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { period = 'weekly', limit = 10 } = req.query;
    const leaderboard = await learningService.getLeaderboard(period, parseInt(limit));
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/badges/:userId
 * Get user's badges
 */
router.get('/badges/:userId', async (req, res, next) => {
  try {
    const badges = await learningService.getUserBadges(req.params.userId);
    res.json(badges);
  } catch (error) {
    next(error);
  }
});

// ============================================
// RECOMMENDATIONS
// ============================================

/**
 * GET /api/learning/recommendations/:userId
 * Get personalized recommendations
 */
router.get('/recommendations/:userId', async (req, res, next) => {
  try {
    const recommendations = await learningService.getRecommendations(req.params.userId);
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/learning/next/:userId
 * Get next recommended module (Adaptive Learning)
 */
router.get('/next/:userId', async (req, res, next) => {
  try {
    const nextModule = await learningService.getNextModule(req.params.userId);
    res.json(nextModule);
  } catch (error) {
    next(error);
  }
});

// ============================================
// ANALYTICS
// ============================================

/**
 * GET /api/learning/analytics/:userId
 * Get learning analytics
 */
router.get('/analytics/:userId', async (req, res, next) => {
  try {
    const analytics = await learningService.getLearningAnalytics(req.params.userId);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

export default router;
