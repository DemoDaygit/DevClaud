import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Flashcard System with Spaced Repetition (Leitner)
 * Система карточек с интервальным повторением
 */
export default function FlashcardSystem({ userId, onComplete }) {
  const [dueCards, setDueCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ reviewed: 0, correct: 0, wrong: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDueCards();
  }, [userId]);

  async function loadDueCards() {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/learning/flashcards/${userId}/due`);
      setDueCards(response.data);
      if (response.data.length > 0) {
        setCurrentCard(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading due cards:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(correct) {
    try {
      const startTime = Date.now();

      await axios.post(`${API_URL}/api/learning/flashcards/${userId}/review`, {
        cardId: currentCard.id,
        correct,
        timeSpent: Date.now() - startTime
      });

      // Update stats
      setStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (correct ? 1 : 0),
        wrong: prev.wrong + (correct ? 0 : 1)
      }));

      // Move to next card
      const nextIndex = currentIndex + 1;
      if (nextIndex < dueCards.length) {
        setCurrentIndex(nextIndex);
        setCurrentCard(dueCards[nextIndex]);
        setShowAnswer(false);
      } else {
        // All cards reviewed
        onComplete?.('flashcard_session', Math.round((stats.correct / stats.reviewed) * 100), 0);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  }

  if (loading) {
    return <div className="flashcard-loading">Loading flashcards...</div>;
  }

  if (dueCards.length === 0) {
    return (
      <div className="flashcard-empty">
        <div className="empty-icon">✅</div>
        <h2>All Caught Up!</h2>
        <p>No flashcards due for review right now.</p>
        <p>Come back later or explore new content.</p>
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    );
  }

  if (currentIndex >= dueCards.length) {
    return (
      <div className="flashcard-complete">
        <div className="complete-icon">🎉</div>
        <h2>Session Complete!</h2>
        <div className="session-stats">
          <div className="stat">
            <span className="stat-label">Reviewed</span>
            <span className="stat-value">{stats.reviewed}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Correct</span>
            <span className="stat-value correct">{stats.correct}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Wrong</span>
            <span className="stat-value wrong">{stats.wrong}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">
              {Math.round((stats.correct / stats.reviewed) * 100)}%
            </span>
          </div>
        </div>
        <button onClick={loadDueCards}>Start New Session</button>
      </div>
    );
  }

  return (
    <div className="flashcard-system">
      {/* Progress indicator */}
      <div className="flashcard-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(currentIndex / dueCards.length) * 100}%` }}
          ></div>
        </div>
        <span className="progress-text">
          {currentIndex + 1} / {dueCards.length}
        </span>
      </div>

      {/* Session stats */}
      <div className="session-stats-compact">
        <span className="stat-item">✅ {stats.correct}</span>
        <span className="stat-item">❌ {stats.wrong}</span>
        <span className="stat-item">Box {currentCard?.box || 1}</span>
      </div>

      {/* Card display */}
      <div className={`flashcard ${showAnswer ? 'flipped' : ''}`}>
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <div className="card-label">Question</div>
            <div className="card-content">
              <h2>{currentCard?.front || currentCard?.question}</h2>
            </div>
            <button
              className="btn-reveal"
              onClick={() => setShowAnswer(true)}
            >
              Show Answer
            </button>
          </div>

          <div className="flashcard-back">
            <div className="card-label">Answer</div>
            <div className="card-content">
              <h2>{currentCard?.back || currentCard?.answer}</h2>
              {currentCard?.explanation && (
                <p className="explanation">{currentCard.explanation}</p>
              )}
            </div>

            <div className="review-buttons">
              <button
                className="btn-wrong"
                onClick={() => handleReview(false)}
              >
                ❌ Wrong<br />
                <small>Back to Box 1</small>
              </button>
              <button
                className="btn-hard"
                onClick={() => handleReview(false)}
              >
                😰 Hard<br />
                <small>Same box</small>
              </button>
              <button
                className="btn-good"
                onClick={() => handleReview(true)}
              >
                ✅ Good<br />
                <small>Next box</small>
              </button>
              <button
                className="btn-easy"
                onClick={() => handleReview(true)}
              >
                😎 Easy<br />
                <small>Skip 2 boxes</small>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card metadata */}
      <div className="card-metadata">
        {currentCard?.tags && (
          <div className="card-tags">
            {currentCard.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
        {currentCard?.nextReview && (
          <div className="next-review">
            Next review: {new Date(currentCard.nextReview).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="keyboard-hint">
        <strong>Keyboard:</strong> Space = Reveal, 1-4 = Rate
      </div>
    </div>
  );
}
