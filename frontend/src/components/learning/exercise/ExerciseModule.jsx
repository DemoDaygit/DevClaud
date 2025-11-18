import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Coding Exercise Module with Interactive Code Editor
 * Модуль упражнений по программированию
 */
export default function ExerciseModule({ userId, onComplete }) {
  const [availableExercises, setAvailableExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [testResults, setTestResults] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [usedHints, setUsedHints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    loadAvailableExercises();
  }, [userId]);

  async function loadAvailableExercises() {
    try {
      setLoading(true);
      // Sample exercises data
      const sampleExercises = [
        {
          id: 'ex_fedavg_impl',
          title: 'Implement FedAvg Algorithm',
          description: 'Implement the Federated Averaging algorithm for client updates',
          difficulty: 'intermediate',
          estimatedTime: '30 minutes',
          bloomLevel: 3,
          language: 'python',
          xpReward: 100
        },
        {
          id: 'ex_gradient_compression',
          title: 'Top-K Gradient Compression',
          description: 'Implement Top-K sparsification for gradient compression',
          difficulty: 'advanced',
          estimatedTime: '45 minutes',
          bloomLevel: 4,
          language: 'python',
          xpReward: 150
        }
      ];
      setAvailableExercises(sampleExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startExercise(exerciseId) {
    try {
      setLoading(true);

      // In a real implementation, this would fetch from API
      const exerciseData = {
        id: exerciseId,
        title: 'Implement FedAvg Algorithm',
        description: 'Implement the Federated Averaging algorithm for aggregating client model updates.',
        language: 'python',
        starterCode: `def federated_averaging(client_updates, num_samples):\n    \"\"\"\n    Aggregate client model updates using FedAvg.\n    \n    Args:\n        client_updates: List of client model updates (gradients or weights)\n        num_samples: List of number of samples per client\n    \n    Returns:\n        Aggregated model update\n    \"\"\"\n    # TODO: Implement FedAvg algorithm\n    pass\n`,
        testCases: [
          {
            input: '[[1, 2, 3], [4, 5, 6]], [10, 20]',
            expected: '[3.0, 4.0, 5.0]',
            description: 'Basic averaging with different client weights'
          },
          {
            input: '[[1, 1], [2, 2], [3, 3]], [5, 5, 5]',
            expected: '[2.0, 2.0]',
            description: 'Equal weights should produce simple average'
          }
        ],
        hints: [
          'FedAvg weighs each client update by the number of samples',
          'The formula is: w = Σ(n_i * w_i) / Σ(n_i)',
          'You need to normalize by the total number of samples'
        ],
        solution: `def federated_averaging(client_updates, num_samples):\n    total_samples = sum(num_samples)\n    aggregated = [0] * len(client_updates[0])\n    \n    for i, update in enumerate(client_updates):\n        weight = num_samples[i] / total_samples\n        for j in range(len(update)):\n            aggregated[j] += weight * update[j]\n    \n    return aggregated\n`
      };

      setCurrentExercise(exerciseData);
      setCode(exerciseData.starterCode);
      setLanguage(exerciseData.language);
      setTestResults(null);
      setUsedHints([]);
      setShowHints(false);
      setShowSolution(false);
    } catch (error) {
      console.error('Error starting exercise:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunTests() {
    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_URL}/api/learning/exercise/${currentExercise.id}/test`,
        {
          userId,
          code,
          language
        }
      );

      setTestResults(response.data);
    } catch (error) {
      console.error('Error running tests:', error);
      setTestResults({
        success: false,
        error: error.response?.data?.message || 'Failed to run tests'
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_URL}/api/learning/exercise/${userId}/submit`,
        {
          exerciseId: currentExercise.id,
          code,
          language
        }
      );

      setTestResults(response.data);

      if (response.data.allPassed && onComplete) {
        // Calculate XP penalty for hints used
        const baseXP = currentExercise.xpReward || 100;
        const xpPenalty = usedHints.length * 10;
        const finalXP = Math.max(baseXP - xpPenalty, baseXP * 0.5);

        onComplete(currentExercise.id, response.data.score, response.data.timeSpent);
      }
    } catch (error) {
      console.error('Error submitting exercise:', error);
      setTestResults({
        success: false,
        error: error.response?.data?.message || 'Failed to submit exercise'
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleUseHint(index) {
    if (!usedHints.includes(index)) {
      setUsedHints([...usedHints, index]);
    }
  }

  if (loading) {
    return <div className="exercise-loading">Loading exercises...</div>;
  }

  // Exercise selection screen
  if (!currentExercise) {
    return (
      <div className="exercise-selection">
        <h2>💻 Coding Exercises</h2>
        <div className="exercise-list">
          {availableExercises.map(exercise => (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-header">
                <h3>{exercise.title}</h3>
                <span className={`difficulty ${exercise.difficulty}`}>
                  {exercise.difficulty}
                </span>
              </div>
              <p className="exercise-description">{exercise.description}</p>
              <div className="exercise-meta">
                <span>⏱️ {exercise.estimatedTime}</span>
                <span>💻 {exercise.language}</span>
                <span>⭐ +{exercise.xpReward} XP</span>
                <span>📊 Bloom Level {exercise.bloomLevel}</span>
              </div>
              <button
                className="btn-start-exercise"
                onClick={() => startExercise(exercise.id)}
              >
                Start Exercise
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Exercise workspace
  return (
    <div className="exercise-module">
      {/* Header */}
      <div className="exercise-header">
        <div className="exercise-info">
          <h2>{currentExercise.title}</h2>
          <p>{currentExercise.description}</p>
        </div>
        <button
          className="btn-back"
          onClick={() => setCurrentExercise(null)}
        >
          ← Back to Exercises
        </button>
      </div>

      <div className="exercise-workspace">
        {/* Instructions Panel */}
        <div className="instructions-panel">
          <div className="panel-section">
            <h3>📝 Instructions</h3>
            <p>{currentExercise.description}</p>
          </div>

          <div className="panel-section">
            <h3>✅ Test Cases</h3>
            {currentExercise.testCases?.map((test, index) => (
              <div key={index} className="test-case">
                <p><strong>Test {index + 1}:</strong> {test.description}</p>
                <div className="test-details">
                  <code>Input: {test.input}</code>
                  <code>Expected: {test.expected}</code>
                </div>
              </div>
            ))}
          </div>

          {/* Hints */}
          <div className="panel-section">
            <div className="hints-header">
              <h3>💡 Hints</h3>
              <button
                className="btn-toggle-hints"
                onClick={() => setShowHints(!showHints)}
              >
                {showHints ? 'Hide' : 'Show'} Hints
              </button>
            </div>
            {showHints && (
              <div className="hints-list">
                {currentExercise.hints?.map((hint, index) => (
                  <div key={index} className="hint-item">
                    {usedHints.includes(index) ? (
                      <p>{hint}</p>
                    ) : (
                      <button
                        className="btn-reveal-hint"
                        onClick={() => handleUseHint(index)}
                      >
                        Reveal Hint {index + 1} (-10 XP)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Solution */}
          {testResults && !testResults.allPassed && (
            <div className="panel-section">
              <button
                className="btn-show-solution"
                onClick={() => setShowSolution(!showSolution)}
              >
                {showSolution ? 'Hide' : 'Show'} Solution
              </button>
              {showSolution && (
                <div className="solution">
                  <pre><code>{currentExercise.solution}</code></pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Code Editor Panel */}
        <div className="editor-panel">
          <div className="editor-header">
            <span className="language-badge">{language}</span>
            <div className="editor-actions">
              <button
                className="btn-run"
                onClick={handleRunTests}
                disabled={submitting}
              >
                {submitting ? '⏳ Running...' : '▶️ Run Tests'}
              </button>
              <button
                className="btn-submit"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '⏳ Submitting...' : '✅ Submit'}
              </button>
            </div>
          </div>

          {/* Simple code editor (in production, use Monaco or CodeMirror) */}
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder="Write your code here..."
          />

          {/* Test Results */}
          {testResults && (
            <div className={`test-results ${testResults.allPassed ? 'success' : 'error'}`}>
              <div className="results-header">
                <h3>
                  {testResults.allPassed ? '✅ All Tests Passed!' : '❌ Some Tests Failed'}
                </h3>
                {testResults.allPassed && (
                  <span className="xp-earned">
                    +{currentExercise.xpReward - (usedHints.length * 10)} XP
                  </span>
                )}
              </div>

              {testResults.testCases?.map((result, index) => (
                <div key={index} className={`test-result ${result.passed ? 'passed' : 'failed'}`}>
                  <div className="result-header">
                    <span>{result.passed ? '✓' : '✗'} Test {index + 1}</span>
                  </div>
                  {!result.passed && (
                    <div className="result-details">
                      <p><strong>Expected:</strong> {result.expected}</p>
                      <p><strong>Got:</strong> {result.actual}</p>
                      {result.error && <p><strong>Error:</strong> {result.error}</p>}
                    </div>
                  )}
                </div>
              ))}

              {testResults.error && (
                <div className="execution-error">
                  <strong>Execution Error:</strong>
                  <pre>{testResults.error}</pre>
                </div>
              )}

              {testResults.allPassed && (
                <div className="success-message">
                  <p>Great job! Your solution passed all test cases.</p>
                  <p>Hints used: {usedHints.length} (-{usedHints.length * 10} XP)</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
