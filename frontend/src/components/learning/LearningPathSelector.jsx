import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Learning Path Selector Component
 * Выбор и отслеживание траекторий обучения
 */
export default function LearningPathSelector({ userId, currentPath }) {
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [pathDetails, setPathDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadLearningPaths();
  }, []);

  useEffect(() => {
    if (selectedPath) {
      loadPathDetails(selectedPath);
    }
  }, [selectedPath]);

  async function loadLearningPaths() {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/learning/paths`);
      setPaths(response.data);

      // If user has a current path, select it by default
      if (currentPath && currentPath.length > 0) {
        setSelectedPath(currentPath[0].id);
      }
    } catch (error) {
      console.error('Error loading learning paths:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPathDetails(pathId) {
    try {
      const response = await axios.get(`${API_URL}/api/learning/paths/${pathId}?userId=${userId}`);
      setPathDetails(response.data);
    } catch (error) {
      console.error('Error loading path details:', error);
    }
  }

  async function handleEnroll(pathId) {
    try {
      setEnrolling(true);
      await axios.post(`${API_URL}/api/learning/paths/${pathId}/enroll`, { userId });
      setSelectedPath(pathId);
      await loadPathDetails(pathId);
    } catch (error) {
      console.error('Error enrolling in path:', error);
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return <div className="path-selector-loading">Loading learning paths...</div>;
  }

  return (
    <div className="learning-path-selector">
      {/* Path Overview */}
      <section className="paths-overview">
        <h2>🎯 Choose Your Learning Path</h2>
        <p className="overview-description">
          Structured learning journeys to master Swarm AI and Federated Learning
        </p>

        <div className="paths-grid">
          {paths.map(path => (
            <PathCard
              key={path.id}
              path={path}
              isSelected={selectedPath === path.id}
              isEnrolled={currentPath?.some(p => p.id === path.id)}
              onSelect={() => setSelectedPath(path.id)}
              onEnroll={() => handleEnroll(path.id)}
              enrolling={enrolling}
            />
          ))}
        </div>
      </section>

      {/* Path Details */}
      {pathDetails && (
        <section className="path-details">
          <PathDetails details={pathDetails} userId={userId} />
        </section>
      )}
    </div>
  );
}

// Path Card Component
function PathCard({ path, isSelected, isEnrolled, onSelect, onEnroll, enrolling }) {
  const difficultyColors = {
    beginner: '#10b981',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
    expert: '#8b5cf6'
  };

  return (
    <div
      className={`path-card ${isSelected ? 'selected' : ''} ${isEnrolled ? 'enrolled' : ''}`}
      onClick={onSelect}
    >
      <div className="path-header">
        <div className="path-icon">{path.icon || '🎓'}</div>
        <div className="path-title">
          <h3>{path.name}</h3>
          <span
            className="difficulty-badge"
            style={{ backgroundColor: difficultyColors[path.difficulty] }}
          >
            {path.difficulty}
          </span>
        </div>
      </div>

      <p className="path-description">{path.description}</p>

      <div className="path-stats">
        <div className="stat">
          <span className="stat-icon">📚</span>
          <span className="stat-text">{path.moduleCount} modules</span>
        </div>
        <div className="stat">
          <span className="stat-icon">⏱️</span>
          <span className="stat-text">{path.duration}</span>
        </div>
        <div className="stat">
          <span className="stat-icon">⭐</span>
          <span className="stat-text">{path.xpReward} XP</span>
        </div>
      </div>

      {path.prerequisites && path.prerequisites.length > 0 && (
        <div className="path-prerequisites">
          <strong>Prerequisites:</strong>
          <ul>
            {path.prerequisites.map((prereq, index) => (
              <li key={index}>{prereq}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="path-actions">
        {isEnrolled ? (
          <button className="btn-enrolled" disabled>
            ✓ Enrolled
          </button>
        ) : (
          <button
            className="btn-enroll"
            onClick={(e) => {
              e.stopPropagation();
              onEnroll();
            }}
            disabled={enrolling}
          >
            {enrolling ? 'Enrolling...' : 'Enroll Now'}
          </button>
        )}
        <button className="btn-details">View Details →</button>
      </div>

      {isEnrolled && path.progress !== undefined && (
        <div className="path-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${path.progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{path.progress}% complete</span>
        </div>
      )}
    </div>
  );
}

// Path Details Component
function PathDetails({ details, userId }) {
  const [expandedModule, setExpandedModule] = useState(null);

  return (
    <div className="path-details-content">
      <div className="details-header">
        <div className="header-left">
          <div className="path-icon-large">{details.icon || '🎓'}</div>
          <div>
            <h2>{details.name}</h2>
            <p className="details-description">{details.description}</p>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-large">
            <span className="stat-value">{details.progress || 0}%</span>
            <span className="stat-label">Complete</span>
          </div>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="details-section">
        <h3>🎯 Learning Objectives</h3>
        <ul className="objectives-list">
          {details.objectives?.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      </div>

      {/* Module Curriculum */}
      <div className="details-section">
        <h3>📚 Curriculum</h3>
        <div className="curriculum">
          {details.modules?.map((module, index) => (
            <ModuleItem
              key={module.id}
              module={module}
              index={index}
              isExpanded={expandedModule === module.id}
              onToggle={() => setExpandedModule(
                expandedModule === module.id ? null : module.id
              )}
              userId={userId}
            />
          ))}
        </div>
      </div>

      {/* Skills You'll Gain */}
      <div className="details-section">
        <h3>💡 Skills You'll Gain</h3>
        <div className="skills-tags">
          {details.skills?.map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
        </div>
      </div>

      {/* Certificate */}
      {details.certificate && (
        <div className="details-section">
          <h3>🏆 Certificate</h3>
          <div className="certificate-info">
            <p>{details.certificate.description}</p>
            <p className="certificate-requirement">
              <strong>Requirement:</strong> {details.certificate.requirement}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Module Item Component
function ModuleItem({ module, index, isExpanded, onToggle, userId }) {
  const statusIcons = {
    completed: '✅',
    in_progress: '🔄',
    locked: '🔒',
    available: '⭕'
  };

  const status = module.completed ? 'completed' :
                 module.inProgress ? 'in_progress' :
                 module.locked ? 'locked' : 'available';

  return (
    <div className={`module-item ${status}`}>
      <div className="module-header" onClick={onToggle}>
        <div className="module-left">
          <span className="module-number">{index + 1}</span>
          <div className="module-info">
            <h4>{module.title}</h4>
            <div className="module-meta">
              <span>⏱️ {module.estimatedTime}</span>
              <span>📊 {module.type}</span>
              {module.bloomLevel && (
                <span>🧠 Bloom L{module.bloomLevel}</span>
              )}
            </div>
          </div>
        </div>
        <div className="module-right">
          <span className="module-status">{statusIcons[status]}</span>
          <span className="module-xp">+{module.xpReward} XP</span>
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="module-content">
          <p className="module-description">{module.description}</p>

          {module.learningOutcomes && (
            <div className="module-section">
              <strong>Learning Outcomes:</strong>
              <ul>
                {module.learningOutcomes.map((outcome, i) => (
                  <li key={i}>{outcome}</li>
                ))}
              </ul>
            </div>
          )}

          {module.topics && (
            <div className="module-section">
              <strong>Topics Covered:</strong>
              <ul className="topics-list">
                {module.topics.map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
              </ul>
            </div>
          )}

          {module.activities && (
            <div className="module-section">
              <strong>Activities:</strong>
              <div className="activities-list">
                {module.activities.map((activity, i) => (
                  <div key={i} className="activity-item">
                    <span className="activity-type">{activity.type}</span>
                    <span className="activity-name">{activity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="module-actions">
            {status === 'locked' ? (
              <button className="btn-locked" disabled>
                🔒 Complete previous modules first
              </button>
            ) : status === 'completed' ? (
              <button className="btn-review">
                🔄 Review Module
              </button>
            ) : (
              <button className="btn-start">
                ▶️ Start Module
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
