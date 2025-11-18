import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Gamification Panel Component
 * Панель геймификации с достижениями и таблицей лидеров
 */
export default function GamificationPanel({ userId, progress }) {
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('badges'); // badges, leaderboard, challenges
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('weekly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadGamificationData();
    }
  }, [userId, leaderboardPeriod]);

  async function loadGamificationData() {
    try {
      setLoading(true);

      // Load badges
      const badgesRes = await axios.get(`${API_URL}/api/learning/badges/${userId}`);
      setBadges(badgesRes.data);

      // Load leaderboard
      const leaderboardRes = await axios.get(
        `${API_URL}/api/learning/leaderboard?period=${leaderboardPeriod}&limit=10`
      );
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gamification-panel">
      {/* Tab Navigation */}
      <div className="panel-tabs">
        <button
          className={`tab ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          🏆 Badges
        </button>
        <button
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          📊 Leaderboard
        </button>
        <button
          className={`tab ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          🎯 Challenges
        </button>
      </div>

      {/* Tab Content */}
      <div className="panel-content">
        {activeTab === 'badges' && (
          <BadgesView badges={badges} progress={progress} />
        )}
        {activeTab === 'leaderboard' && (
          <LeaderboardView
            leaderboard={leaderboard}
            userId={userId}
            period={leaderboardPeriod}
            onPeriodChange={setLeaderboardPeriod}
          />
        )}
        {activeTab === 'challenges' && (
          <ChallengesView userId={userId} />
        )}
      </div>
    </div>
  );
}

// Badges View Component
function BadgesView({ badges, progress }) {
  // All available badges with unlock criteria
  const allBadges = [
    {
      id: 'first_steps',
      name: 'First Steps',
      icon: '🎯',
      description: 'Complete your first module',
      requirement: 1,
      category: 'progress',
      unlocked: (progress?.completedModules?.length || 0) >= 1
    },
    {
      id: 'bookworm',
      name: 'Bookworm',
      icon: '📚',
      description: 'Read 10 learning modules',
      requirement: 10,
      category: 'reading',
      unlocked: (progress?.modulesRead || 0) >= 10
    },
    {
      id: 'code_warrior',
      name: 'Code Warrior',
      icon: '💻',
      description: 'Complete 20 coding exercises',
      requirement: 20,
      category: 'coding',
      unlocked: (progress?.exercisesCompleted || 0) >= 20
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      icon: '🔥',
      description: 'Maintain a 7-day learning streak',
      requirement: 7,
      category: 'consistency',
      unlocked: (progress?.streak || 0) >= 7
    },
    {
      id: 'quiz_champion',
      name: 'Quiz Champion',
      icon: '🏅',
      description: 'Pass 10 quizzes in a row',
      requirement: 10,
      category: 'quizzes',
      unlocked: (progress?.quizStreak || 0) >= 10
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      icon: '🌟',
      description: 'Score 100% on 5 different quizzes',
      requirement: 5,
      category: 'excellence',
      unlocked: (progress?.perfectScores || 0) >= 5
    },
    {
      id: 'project_builder',
      name: 'Project Builder',
      icon: '🚀',
      description: 'Complete a capstone project',
      requirement: 1,
      category: 'projects',
      unlocked: (progress?.projectsCompleted || 0) >= 1
    },
    {
      id: 'domain_expert',
      name: 'Domain Expert',
      icon: '🎓',
      description: 'Achieve 100% in a category',
      requirement: 100,
      category: 'mastery',
      unlocked: false // Calculated based on category completion
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      icon: '🌅',
      description: 'Study before 8 AM on 5 days',
      requirement: 5,
      category: 'habits',
      unlocked: (progress?.earlyStudySessions || 0) >= 5
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      icon: '🦉',
      description: 'Study after 10 PM on 5 days',
      requirement: 5,
      category: 'habits',
      unlocked: (progress?.lateStudySessions || 0) >= 5
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      icon: '⚡',
      description: 'Complete 10 modules in one day',
      requirement: 10,
      category: 'speed',
      unlocked: (progress?.maxModulesPerDay || 0) >= 10
    },
    {
      id: 'social_learner',
      name: 'Social Learner',
      icon: '👥',
      description: 'Help 5 other learners',
      requirement: 5,
      category: 'community',
      unlocked: (progress?.helpedOthers || 0) >= 5
    }
  ];

  const unlockedBadges = allBadges.filter(b => b.unlocked);
  const lockedBadges = allBadges.filter(b => !b.unlocked);

  return (
    <div className="badges-view">
      <div className="badges-summary">
        <h3>Your Badges</h3>
        <p className="badge-count">
          {unlockedBadges.length} / {allBadges.length} earned
        </p>
        <div className="badge-progress-bar">
          <div
            className="badge-progress-fill"
            style={{ width: `${(unlockedBadges.length / allBadges.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="badges-section">
        <h4>Unlocked ({unlockedBadges.length})</h4>
        <div className="badges-grid">
          {unlockedBadges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} unlocked={true} />
          ))}
        </div>
      </div>

      <div className="badges-section locked">
        <h4>Locked ({lockedBadges.length})</h4>
        <div className="badges-grid">
          {lockedBadges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} unlocked={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BadgeCard({ badge, unlocked }) {
  return (
    <div className={`badge-card ${unlocked ? 'unlocked' : 'locked'}`}>
      <div className="badge-icon">{badge.icon}</div>
      <div className="badge-info">
        <h5 className="badge-name">{badge.name}</h5>
        <p className="badge-description">{badge.description}</p>
        {!unlocked && (
          <p className="badge-requirement">
            Requirement: {badge.requirement}
          </p>
        )}
      </div>
    </div>
  );
}

// Leaderboard View Component
function LeaderboardView({ leaderboard, userId, period, onPeriodChange }) {
  const userRank = leaderboard.findIndex(user => user.id === userId) + 1;

  return (
    <div className="leaderboard-view">
      <div className="leaderboard-header">
        <h3>🏆 Top Learners</h3>
        <div className="period-selector">
          <button
            className={period === 'weekly' ? 'active' : ''}
            onClick={() => onPeriodChange('weekly')}
          >
            Week
          </button>
          <button
            className={period === 'monthly' ? 'active' : ''}
            onClick={() => onPeriodChange('monthly')}
          >
            Month
          </button>
          <button
            className={period === 'alltime' ? 'active' : ''}
            onClick={() => onPeriodChange('alltime')}
          >
            All Time
          </button>
        </div>
      </div>

      {userRank > 0 && (
        <div className="user-rank-card">
          <span className="rank-label">Your Rank:</span>
          <span className="rank-value">#{userRank}</span>
        </div>
      )}

      <div className="leaderboard-list">
        {leaderboard.map((user, index) => (
          <LeaderboardEntry
            key={user.id}
            user={user}
            rank={index + 1}
            isCurrentUser={user.id === userId}
          />
        ))}
      </div>
    </div>
  );
}

function LeaderboardEntry({ user, rank, isCurrentUser }) {
  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className={`leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
      <div className="entry-rank">{getRankIcon(rank)}</div>
      <div className="entry-user">
        <div className="user-avatar">
          {user.avatar || user.name?.charAt(0) || '?'}
        </div>
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <span className="user-level">Level {user.level}</span>
        </div>
      </div>
      <div className="entry-stats">
        <div className="stat">
          <span className="stat-value">{user.xp}</span>
          <span className="stat-label">XP</span>
        </div>
        <div className="stat">
          <span className="stat-value">{user.streak}🔥</span>
          <span className="stat-label">Streak</span>
        </div>
      </div>
    </div>
  );
}

// Challenges View Component
function ChallengesView({ userId }) {
  const challenges = [
    {
      id: 'daily_flashcards',
      name: 'Daily Flashcard Review',
      icon: '📇',
      description: 'Review 10 flashcards',
      progress: 7,
      target: 10,
      reward: 50,
      timeframe: 'today',
      status: 'active'
    },
    {
      id: 'weekly_quizzes',
      name: 'Quiz Master',
      icon: '📝',
      description: 'Complete 5 quizzes this week',
      progress: 3,
      target: 5,
      reward: 100,
      timeframe: 'this week',
      status: 'active'
    },
    {
      id: 'perfect_score',
      name: 'Perfect Score',
      icon: '🌟',
      description: 'Score 100% on any quiz',
      progress: 0,
      target: 1,
      reward: 200,
      timeframe: 'anytime',
      status: 'active'
    },
    {
      id: 'coding_streak',
      name: 'Coding Streak',
      icon: '💻',
      description: 'Complete a coding exercise for 7 days straight',
      progress: 4,
      target: 7,
      reward: 300,
      timeframe: 'this week',
      status: 'active'
    }
  ];

  return (
    <div className="challenges-view">
      <h3>🎯 Active Challenges</h3>
      <div className="challenges-list">
        {challenges.map(challenge => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge }) {
  const percentage = (challenge.progress / challenge.target) * 100;
  const isComplete = challenge.progress >= challenge.target;

  return (
    <div className={`challenge-card ${isComplete ? 'complete' : ''}`}>
      <div className="challenge-icon">{challenge.icon}</div>
      <div className="challenge-content">
        <div className="challenge-header">
          <h4>{challenge.name}</h4>
          {isComplete && <span className="complete-badge">✓ Complete</span>}
        </div>
        <p className="challenge-description">{challenge.description}</p>

        <div className="challenge-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {challenge.progress} / {challenge.target}
          </span>
        </div>

        <div className="challenge-footer">
          <span className="challenge-timeframe">⏱️ {challenge.timeframe}</span>
          <span className="challenge-reward">🎁 +{challenge.reward} XP</span>
        </div>
      </div>
    </div>
  );
}
