import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Quiz Module with Multiple Question Types
 * Модуль квизов с различными типами вопросов
 */
export default function QuizModule({ userId, onComplete }) {
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    loadAvailableQuizzes();
  }, [userId]);

  // Timer countdown
  useEffect(() => {
    if (currentQuiz && timeRemaining > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !showResults) {
      handleSubmitQuiz();
    }
  }, [timeRemaining, currentQuiz, showResults]);

  async function loadAvailableQuizzes() {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from an API
      // For now, we'll use sample data
      const sampleQuizzes = [
        {
          id: 'quiz_fedavg_basics',
          title: 'FedAvg Algorithm Basics',
          description: 'Test your understanding of the Federated Averaging algorithm',
          difficulty: 'intermediate',
          estimatedTime: '10 minutes',
          bloomLevel: 2,
          questionCount: 5,
          xpReward: 50
        },
        {
          id: 'quiz_gradient_compression',
          title: 'Gradient Compression Techniques',
          description: 'Explore various methods for compressing gradients',
          difficulty: 'advanced',
          estimatedTime: '15 minutes',
          bloomLevel: 3,
          questionCount: 8,
          xpReward: 75
        }
      ];
      setAvailableQuizzes(sampleQuizzes);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startQuiz(quizId) {
    try {
      setLoading(true);

      // Get quiz data
      const quizRes = await axios.get(`${API_URL}/api/learning/quiz/${quizId}`);
      const quiz = quizRes.data;

      // Start attempt
      const attemptRes = await axios.post(`${API_URL}/api/learning/quiz/${quizId}/start`, {
        userId
      });

      setCurrentQuiz(quiz);
      setAttemptId(attemptRes.data.attemptId);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowResults(false);

      // Set timer if quiz has time limit
      if (quiz.timeLimit) {
        setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitQuiz() {
    try {
      const response = await axios.post(
        `${API_URL}/api/learning/quiz/${currentQuiz.id}/submit`,
        {
          userId,
          attemptId,
          answers: userAnswers
        }
      );

      setResults(response.data);
      setShowResults(true);

      // Call completion callback
      if (onComplete) {
        onComplete(
          currentQuiz.id,
          response.data.scorePercentage,
          response.data.timeSpent
        );
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  }

  function handleAnswerChange(questionId, answer) {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }

  function handleNext() {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }

  function handlePrevious() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return <div className="quiz-loading">Loading quizzes...</div>;
  }

  // Quiz selection screen
  if (!currentQuiz) {
    return (
      <div className="quiz-selection">
        <h2>📝 Available Quizzes</h2>
        <div className="quiz-list">
          {availableQuizzes.map(quiz => (
            <div key={quiz.id} className="quiz-card">
              <div className="quiz-header">
                <h3>{quiz.title}</h3>
                <span className={`difficulty ${quiz.difficulty}`}>
                  {quiz.difficulty}
                </span>
              </div>
              <p className="quiz-description">{quiz.description}</p>
              <div className="quiz-meta">
                <span>⏱️ {quiz.estimatedTime}</span>
                <span>❓ {quiz.questionCount} questions</span>
                <span>⭐ +{quiz.xpReward} XP</span>
                <span>📊 Bloom Level {quiz.bloomLevel}</span>
              </div>
              <button
                className="btn-start-quiz"
                onClick={() => startQuiz(quiz.id)}
              >
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    return (
      <div className="quiz-results">
        <div className="results-header">
          <div className="results-icon">
            {results.scorePercentage >= 80 ? '🎉' : results.scorePercentage >= 60 ? '👍' : '📚'}
          </div>
          <h2>Quiz Complete!</h2>
        </div>

        <div className="results-stats">
          <div className="stat-large">
            <span className="stat-label">Score</span>
            <span className="stat-value">{results.scorePercentage}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">Correct</span>
            <span className="stat-value correct">{results.correctAnswers}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Incorrect</span>
            <span className="stat-value wrong">{results.incorrectAnswers}</span>
          </div>
          <div className="stat">
            <span className="stat-label">XP Earned</span>
            <span className="stat-value">+{results.xpEarned}</span>
          </div>
        </div>

        <div className="results-review">
          <h3>Review Your Answers</h3>
          {currentQuiz.questions.map((question, index) => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = results.details?.[question.id]?.correct;

            return (
              <div key={question.id} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="review-header">
                  <span className="question-number">Question {index + 1}</span>
                  <span className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                </div>
                <p className="question-text">{question.question}</p>

                {question.type === 'multiple_choice' && (
                  <div className="answer-review">
                    <p className="your-answer">
                      Your answer: {question.options[userAnswer] || 'Not answered'}
                    </p>
                    {!isCorrect && (
                      <p className="correct-answer">
                        Correct answer: {question.options[question.correctAnswer]}
                      </p>
                    )}
                  </div>
                )}

                {question.explanation && (
                  <div className="explanation">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="results-actions">
          <button onClick={() => setCurrentQuiz(null)}>
            Back to Quizzes
          </button>
          <button onClick={() => startQuiz(currentQuiz.id)}>
            Retry Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz taking screen
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

  return (
    <div className="quiz-module">
      {/* Header with progress and timer */}
      <div className="quiz-header">
        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">
            Question {currentQuestionIndex + 1} / {currentQuiz.questions.length}
          </span>
        </div>

        {timeRemaining !== null && (
          <div className={`quiz-timer ${timeRemaining < 60 ? 'warning' : ''}`}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Question */}
      <div className="quiz-question">
        <h3>{currentQuestion.question}</h3>

        {currentQuestion.code && (
          <pre className="question-code">
            <code>{currentQuestion.code}</code>
          </pre>
        )}

        {/* Answer input based on question type */}
        <div className="answer-section">
          {currentQuestion.type === 'multiple_choice' && (
            <div className="multiple-choice">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="option">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={index}
                    checked={userAnswers[currentQuestion.id] === index}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'multiple_select' && (
            <div className="multiple-select">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="option">
                  <input
                    type="checkbox"
                    value={index}
                    checked={(userAnswers[currentQuestion.id] || []).includes(index)}
                    onChange={(e) => {
                      const current = userAnswers[currentQuestion.id] || [];
                      const value = parseInt(e.target.value);
                      const updated = e.target.checked
                        ? [...current, value]
                        : current.filter(v => v !== value);
                      handleAnswerChange(currentQuestion.id, updated);
                    }}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'fill_in_blank' && (
            <div className="fill-in-blank">
              <input
                type="text"
                className="text-input"
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
              />
            </div>
          )}

          {currentQuestion.type === 'true_false' && (
            <div className="true-false">
              <label className="option">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value="true"
                  checked={userAnswers[currentQuestion.id] === true}
                  onChange={() => handleAnswerChange(currentQuestion.id, true)}
                />
                <span className="option-text">True</span>
              </label>
              <label className="option">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value="false"
                  checked={userAnswers[currentQuestion.id] === false}
                  onChange={() => handleAnswerChange(currentQuestion.id, false)}
                />
                <span className="option-text">False</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-navigation">
        <button
          className="btn-nav"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          ← Previous
        </button>

        <div className="question-dots">
          {currentQuiz.questions.map((q, index) => (
            <span
              key={q.id}
              className={`dot ${index === currentQuestionIndex ? 'active' : ''} ${
                userAnswers[q.id] !== undefined ? 'answered' : ''
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
            ></span>
          ))}
        </div>

        {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
          <button
            className="btn-nav"
            onClick={handleNext}
          >
            Next →
          </button>
        ) : (
          <button
            className="btn-submit"
            onClick={handleSubmitQuiz}
          >
            Submit Quiz
          </button>
        )}
      </div>

      {/* Answer progress indicator */}
      <div className="answer-progress">
        Answered: {Object.keys(userAnswers).length} / {currentQuiz.questions.length}
      </div>
    </div>
  );
}
