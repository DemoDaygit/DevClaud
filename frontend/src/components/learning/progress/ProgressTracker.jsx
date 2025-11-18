import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Progress Tracker Component
 * Визуализация прогресса обучения
 */
export default function ProgressTracker({ userId, progress }) {
  const [detailedStats, setDetailedStats] = useState(null);
  const [timeframe, setTimeframe] = useState('week'); // week, month, all
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadDetailedStats();
    }
  }, [userId, timeframe]);

  async function loadDetailedStats() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/learning/progress/${userId}/stats?timeframe=${timeframe}`
      );
      setDetailedStats(response.data);
    } catch (error) {
      console.error('Error loading detailed stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!progress) {
    return <div className="progress-tracker">Loading progress...</div>;
  }

  // Calculate level progress
  const currentLevel = progress.level || 1;
  const currentXP = progress.xp || 0;
  const xpForCurrentLevel = calculateXPForLevel(currentLevel);
  const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const levelProgress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return (
    <div className="progress-tracker">
      {/* Level Progress */}
      <section className="progress-section">
        <h3>📈 Level Progress</h3>
        <div className="level-display">
          <div className="level-badge">
            <span className="level-number">{currentLevel}</span>
            <span className="level-label">Level</span>
          </div>
          <div className="level-info">
            <div className="level-bar-container">
              <div className="level-bar">
                <div
                  className="level-bar-fill"
                  style={{ width: `${levelProgress}%` }}
                ></div>
              </div>
              <span className="level-text">
                {xpInCurrentLevel} / {xpNeededForNextLevel} XP
              </span>
            </div>
            <p className="next-level">
              {xpNeededForNextLevel - xpInCurrentLevel} XP to Level {currentLevel + 1}
            </p>
          </div>
        </div>
      </section>

      {/* Activity Stats */}
      <section className="progress-section">
        <div className="section-header">
          <h3>📊 Activity Stats</h3>
          <div className="timeframe-selector">
            <button
              className={timeframe === 'week' ? 'active' : ''}
              onClick={() => setTimeframe('week')}
            >
              Week
            </button>
            <button
              className={timeframe === 'month' ? 'active' : ''}
              onClick={() => setTimeframe('month')}
            >
              Month
            </button>
            <button
              className={timeframe === 'all' ? 'active' : ''}
              onClick={() => setTimeframe('all')}
            >
              All Time
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <span className="stat-value">{progress.streak || 0}</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-value">
                {progress.completedModules?.length || 0}
              </span>
              <span className="stat-label">Modules Completed</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <span className="stat-value">
                {formatTime(progress.totalTimeSpent || 0)}
              </span>
              <span className="stat-label">Time Spent</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <span className="stat-value">
                {Math.round(progress.averageScore || 0)}%
              </span>
              <span className="stat-label">Avg Score</span>
            </div>
          </div>
        </div>
      </section>

      {/* Module Breakdown */}
      <section className="progress-section">
        <h3>📚 Module Breakdown</h3>
        <div className="module-stats">
          <ModuleTypeProgress
            type="Flashcards"
            icon="📇"
            completed={progress.flashcardsCompleted || 0}
            total={progress.totalFlashcards || 100}
            color="#3b82f6"
          />
          <ModuleTypeProgress
            type="Quizzes"
            icon="📝"
            completed={progress.quizzesCompleted || 0}
            total={progress.totalQuizzes || 20}
            color="#8b5cf6"
          />
          <ModuleTypeProgress
            type="Exercises"
            icon="💻"
            completed={progress.exercisesCompleted || 0}
            total={progress.totalExercises || 15}
            color="#10b981"
          />
          <ModuleTypeProgress
            type="Projects"
            icon="🚀"
            completed={progress.projectsCompleted || 0}
            total={progress.totalProjects || 5}
            color="#f59e0b"
          />
        </div>
      </section>

      {/* Learning Paths */}
      {progress.learningPaths && progress.learningPaths.length > 0 && (
        <section className="progress-section">
          <h3>🎯 Learning Path Progress</h3>
          <div className="learning-paths">
            {progress.learningPaths.map((path, index) => (
              <LearningPathProgress key={index} path={path} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section className="progress-section">
        <h3>🕒 Recent Activity</h3>
        <div className="activity-timeline">
          {progress.recentActivity?.slice(0, 10).map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          )) || (
            <p className="no-activity">No recent activity</p>
          )}
        </div>
      </section>

      {/* Bloom's Taxonomy Coverage */}
      <section className="progress-section">
        <h3>🧠 Bloom's Taxonomy Coverage</h3>
        <div className="bloom-coverage">
          {[1, 2, 3, 4, 5, 6].map(level => {
            const levelData = getBloomLevelData(level);
            const completed = progress.bloomProgress?.[level] || 0;
            const total = 10; // Assuming 10 modules per level
            const percentage = (completed / total) * 100;

            return (
              <div key={level} className="bloom-level">
                <div className="bloom-header">
                  <span className="bloom-name">{levelData.name}</span>
                  <span className="bloom-count">{completed}/{total}</span>
                </div>
                <div className="bloom-bar">
                  <div
                    className="bloom-bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: levelData.color
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// Helper Components

function ModuleTypeProgress({ type, icon, completed, total, color }) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="module-type-progress">
      <div className="module-header">
        <span className="module-icon">{icon}</span>
        <span className="module-name">{type}</span>
      </div>
      <div className="module-progress-bar">
        <div
          className="module-progress-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
      <div className="module-stats-text">
        <span>{completed} / {total}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

function LearningPathProgress({ path }) {
  const percentage = (path.completed / path.total) * 100;

  return (
    <div className="learning-path-item">
      <div className="path-header">
        <h4>{path.name}</h4>
        <span className="path-percentage">{Math.round(percentage)}%</span>
      </div>
      <div className="path-progress-bar">
        <div
          className="path-progress-fill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="path-description">{path.description}</p>
      <div className="path-stats">
        <span>{path.completed} / {path.total} modules</span>
        <span className={`path-status ${path.completed === path.total ? 'completed' : 'in-progress'}`}>
          {path.completed === path.total ? '✅ Completed' : '🔄 In Progress'}
        </span>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const icons = {
    flashcard_session: '📇',
    quiz_completed: '📝',
    exercise_completed: '💻',
    level_up: '⬆️',
    badge_earned: '🏆',
    module_completed: '✅'
  };

  const timeAgo = getTimeAgo(activity.timestamp);

  return (
    <div className="activity-item">
      <div className="activity-icon">{icons[activity.type] || '📚'}</div>
      <div className="activity-content">
        <p className="activity-description">{activity.description}</p>
        <span className="activity-time">{timeAgo}</span>
      </div>
      {activity.xpEarned && (
        <div className="activity-xp">+{activity.xpEarned} XP</div>
      )}
    </div>
  );
}

// Helper Functions

function calculateXPForLevel(level) {
  // Progressive XP requirement: 100 * level^1.5
  return Math.floor(100 * Math.pow(level, 1.5));
}

function formatTime(minutes) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function getBloomLevelData(level) {
  const levels = {
    1: { name: 'Remember', color: '#3b82f6' },
    2: { name: 'Understand', color: '#8b5cf6' },
    3: { name: 'Apply', color: '#10b981' },
    4: { name: 'Analyze', color: '#f59e0b' },
    5: { name: 'Evaluate', color: '#ef4444' },
    6: { name: 'Create', color: '#ec4899' }
  };
  return levels[level] || { name: 'Unknown', color: '#6b7280' };
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
}
