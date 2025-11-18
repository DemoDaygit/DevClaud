import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FlashcardSystem from './flashcards/FlashcardSystem';
import QuizModule from './quiz/QuizModule';
import ExerciseModule from './exercise/ExerciseModule';
import ProgressTracker from './progress/ProgressTracker';
import GamificationPanel from './progress/GamificationPanel';
import LearningPathSelector from './LearningPathSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Main Learning Dashboard Component
 * Центральный компонент образовательной системы
 */
export default function LearningDashboard({ userId }) {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [userProgress, setUserProgress] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  async function loadUserData() {
    try {
      setLoading(true);

      // Load user progress
      const progressRes = await axios.get(`${API_URL}/api/learning/progress/${userId}`);
      setUserProgress(progressRes.data);

      // Load recommendations
      const recRes = await axios.get(`${API_URL}/api/learning/recommendations/${userId}`);
      setRecommendations(recRes.data);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleModuleComplete(moduleId, score, timeSpent) {
    try {
      await axios.post(
        `${API_URL}/api/learning/progress/${userId}/module/${moduleId}`,
        { score, timeSpent }
      );

      // Reload progress
      await loadUserData();

      // Show success notification
      alert(`Module completed! Score: ${score}%, XP earned!`);
    } catch (error) {
      console.error('Error completing module:', error);
    }
  }

  if (loading) {
    return (
      <div className="learning-dashboard loading">
        <div className="spinner"></div>
        <p>Loading your learning journey...</p>
      </div>
    );
  }

  return (
    <div className="learning-dashboard">
      {/* Header with user stats */}
      <header className="dashboard-header">
        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-label">Level</span>
            <span className="stat-value">{userProgress?.level || 1}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">XP</span>
            <span className="stat-value">{userProgress?.xp || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Streak</span>
            <span className="stat-value">🔥 {userProgress?.streak || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{userProgress?.completedModules?.length || 0}</span>
          </div>
        </div>

        <GamificationPanel userId={userId} progress={userProgress} />
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <button
          className={activeModule === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveModule('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={activeModule === 'flashcards' ? 'active' : ''}
          onClick={() => setActiveModule('flashcards')}
        >
          📇 Flashcards
        </button>
        <button
          className={activeModule === 'quizzes' ? 'active' : ''}
          onClick={() => setActiveModule('quizzes')}
        >
          📝 Quizzes
        </button>
        <button
          className={activeModule === 'exercises' ? 'active' : ''}
          onClick={() => setActiveModule('exercises')}
        >
          💻 Exercises
        </button>
        <button
          className={activeModule === 'paths' ? 'active' : ''}
          onClick={() => setActiveModule('paths')}
        >
          🎯 Learning Paths
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {activeModule === 'dashboard' && (
          <div className="dashboard-overview">
            <section className="section">
              <h2>Welcome Back!</h2>
              <ProgressTracker userId={userId} progress={userProgress} />
            </section>

            <section className="section">
              <h2>📚 Recommended for You</h2>
              <div className="recommendations">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="recommendation-card">
                    <h3>{rec.label}</h3>
                    <p>{rec.description}</p>
                    <div className="card-meta">
                      <span className="difficulty">{rec.difficulty}</span>
                      <span className="time">⏱️ {rec.estimatedTime}</span>
                      <span className="bloom">Level {rec.bloomLevel}</span>
                    </div>
                    <button onClick={() => handleStartModule(rec.id)}>
                      Start Learning
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="section">
              <h2>🔥 Daily Challenge</h2>
              <DailyChallengeCard userId={userId} />
            </section>
          </div>
        )}

        {activeModule === 'flashcards' && (
          <FlashcardSystem
            userId={userId}
            onComplete={handleModuleComplete}
          />
        )}

        {activeModule === 'quizzes' && (
          <QuizModule
            userId={userId}
            onComplete={handleModuleComplete}
          />
        )}

        {activeModule === 'exercises' && (
          <ExerciseModule
            userId={userId}
            onComplete={handleModuleComplete}
          />
        )}

        {activeModule === 'paths' && (
          <LearningPathSelector
            userId={userId}
            currentPath={userProgress?.learningPaths}
          />
        )}
      </main>
    </div>
  );
}

function DailyChallengeCard({ userId }) {
  return (
    <div className="daily-challenge">
      <div className="challenge-icon">🎯</div>
      <div className="challenge-content">
        <h3>Complete 3 flashcard reviews</h3>
        <div className="challenge-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '66%' }}></div>
          </div>
          <span>2 / 3</span>
        </div>
        <p className="challenge-reward">Reward: +50 XP</p>
      </div>
    </div>
  );
}

function handleStartModule(moduleId) {
  console.log('Starting module:', moduleId);
  // Implementation for starting a module
}
