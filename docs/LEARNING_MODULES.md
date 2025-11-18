# 📚 Interactive Learning Modules

## 🎯 Структура обучающих модулей

### Типы модулей по Bloom's Taxonomy

```
Level 1: REMEMBER
├── 📇 Flashcards (Карточки)
├── 📝 Quizzes (Тесты)
└── 🔤 Glossary (Глоссарий)

Level 2: UNDERSTAND
├── 📖 Interactive Explanations
├── 🎥 Video Tutorials
├── 📊 Infographics
└── 🎨 Visualizations

Level 3: APPLY
├── 💻 Coding Exercises
├── 🧪 Simulations
├── 📝 Worksheets
└── 🎮 Interactive Labs

Level 4: ANALYZE
├── 🔍 Case Studies
├── 📈 Data Analysis
├── 🧩 Problem Decomposition
└── 🔬 Research Papers

Level 5: EVALUATE
├── 🎯 Code Review
├── 📊 Benchmarking
├── 🏆 Peer Review
└── 📝 Critical Analysis

Level 6: CREATE
├── 🚀 Projects
├── 🏗️ Build from Scratch
├── 🔬 Research
└── 🎨 Innovation Challenges
```

---

## 📇 MODULE 1: Flashcards (Spaced Repetition)

### Пример: SGD Flashcards

```json
{
  "module_id": "flash_sgd",
  "title": "SGD Fundamentals",
  "cards": [
    {
      "id": 1,
      "front": "What does SGD stand for?",
      "back": "Stochastic Gradient Descent",
      "difficulty": 1,
      "tags": ["sgd", "optimization"],
      "nextReview": "2025-11-19",
      "interval": 1
    },
    {
      "id": 2,
      "front": "What is the update rule for SGD?",
      "back": "θ_{t+1} = θ_t - η∇L(θ_t)",
      "difficulty": 2,
      "tags": ["sgd", "formula"],
      "image": "/assets/sgd_formula.png",
      "nextReview": "2025-11-19",
      "interval": 1
    },
    {
      "id": 3,
      "front": "Why is it called 'stochastic'?",
      "back": "Because it uses a random subset (mini-batch) of data instead of the full dataset",
      "difficulty": 2,
      "tags": ["sgd", "concept"],
      "nextReview": "2025-11-19",
      "interval": 1
    },
    {
      "id": 4,
      "front": "What is the learning rate (η) in SGD?",
      "back": "A hyperparameter that controls the step size in the direction of the gradient",
      "difficulty": 2,
      "tags": ["sgd", "hyperparameter"],
      "nextReview": "2025-11-19",
      "interval": 1
    },
    {
      "id": 5,
      "front": "What happens if learning rate is too large?",
      "back": "The algorithm may overshoot the minimum and fail to converge",
      "difficulty": 3,
      "tags": ["sgd", "troubleshooting"],
      "nextReview": "2025-11-19",
      "interval": 1
    }
  ],
  "totalCards": 20,
  "completionCriteria": {
    "correctAnswers": 18,
    "consecutiveCorrect": 3
  }
}
```

### Алгоритм интервального повторения (Leitner System)

```javascript
function scheduleNextReview(card, correct) {
  if (correct) {
    // Увеличиваем интервал
    card.interval = Math.min(card.interval * 2, 30); // Max 30 days
    card.box = Math.min(card.box + 1, 5);
  } else {
    // Сбрасываем в начало
    card.interval = 1;
    card.box = 1;
  }

  card.nextReview = addDays(today(), card.interval);
  card.reviewCount++;

  return card;
}
```

---

## 📝 MODULE 2: Interactive Quizzes

### Пример: FedAvg Quiz

```json
{
  "quiz_id": "quiz_fedavg",
  "title": "Federated Averaging Quiz",
  "description": "Test your understanding of FedAvg algorithm",
  "difficulty": "intermediate",
  "bloomLevel": 2,
  "timeLimit": 600,
  "passingScore": 70,
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "What is the main advantage of Federated Learning?",
      "options": [
        "Faster training speed",
        "Privacy preservation",
        "Lower computational cost",
        "Better accuracy"
      ],
      "correctAnswer": 1,
      "explanation": "The main advantage is privacy preservation - data never leaves the device",
      "points": 10
    },
    {
      "id": 2,
      "type": "multiple_select",
      "question": "Which are challenges in Federated Learning? (Select all that apply)",
      "options": [
        "Communication overhead",
        "Data heterogeneity",
        "System heterogeneity",
        "Unlimited resources"
      ],
      "correctAnswers": [0, 1, 2],
      "explanation": "FL faces communication, data, and system heterogeneity challenges",
      "points": 15
    },
    {
      "id": 3,
      "type": "fill_in_blank",
      "question": "In FedAvg, the server aggregates model updates using _____ averaging",
      "correctAnswer": "weighted",
      "acceptableAnswers": ["weighted", "weighted average"],
      "explanation": "Weighted averaging accounts for different dataset sizes at each client",
      "points": 10
    },
    {
      "id": 4,
      "type": "code_completion",
      "question": "Complete the FedAvg aggregation code:",
      "code": "def aggregate(models, weights):\n    # TODO: Implement weighted averaging\n    ...",
      "correctSolution": "def aggregate(models, weights):\n    total_weight = sum(weights)\n    avg_model = {}\n    for key in models[0].keys():\n        avg_model[key] = sum(w * m[key] for w, m in zip(weights, models)) / total_weight\n    return avg_model",
      "testCases": [
        {"input": "...", "expected": "..."}
      ],
      "points": 25
    },
    {
      "id": 5,
      "type": "ordering",
      "question": "Order the steps of FedAvg algorithm:",
      "items": [
        "Server broadcasts global model",
        "Clients train locally",
        "Clients send updates to server",
        "Server aggregates updates",
        "Repeat until convergence"
      ],
      "correctOrder": [0, 1, 2, 3, 4],
      "explanation": "This is the standard FedAvg protocol flow",
      "points": 20
    },
    {
      "id": 6,
      "type": "matching",
      "question": "Match the concepts with their descriptions:",
      "leftColumn": [
        "Client drift",
        "Communication round",
        "Local epochs",
        "Aggregation"
      ],
      "rightColumn": [
        "Number of training iterations on client",
        "Combining model updates from clients",
        "One cycle of training and aggregation",
        "Divergence of local models from global"
      ],
      "correctMatches": [3, 2, 0, 1],
      "points": 20
    }
  ],
  "totalPoints": 100,
  "badges": {
    "100": "Perfect Score 🌟",
    "90": "Excellence 🏆",
    "70": "Passed ✅"
  }
}
```

---

## 💻 MODULE 3: Coding Exercises

### Пример: Implement SGD

```json
{
  "exercise_id": "ex_sgd_impl",
  "title": "Implement SGD from Scratch",
  "difficulty": "intermediate",
  "bloomLevel": 3,
  "estimatedTime": "45m",
  "starterCode": {
    "python": "import numpy as np\n\ndef sgd_step(theta, gradient, learning_rate):\n    \"\"\"\n    Perform one SGD update step\n    \n    Args:\n        theta: Current parameters\n        gradient: Gradient of loss\n        learning_rate: Step size\n    \n    Returns:\n        Updated parameters\n    \"\"\"\n    # TODO: Implement SGD update\n    pass\n\ndef train(X, y, epochs=100, lr=0.01, batch_size=32):\n    \"\"\"\n    Train using SGD\n    \n    Args:\n        X: Training data\n        y: Labels\n        epochs: Number of epochs\n        lr: Learning rate\n        batch_size: Mini-batch size\n    \n    Returns:\n        Trained parameters, loss history\n    \"\"\"\n    # TODO: Implement training loop\n    pass"
  },
  "hints": [
    {
      "level": 1,
      "text": "Remember: θ_{t+1} = θ_t - η∇L"
    },
    {
      "level": 2,
      "text": "Use numpy operations for efficiency"
    },
    {
      "level": 3,
      "text": "Don't forget to shuffle data each epoch"
    }
  ],
  "testCases": [
    {
      "name": "Test simple linear function",
      "input": {
        "X": "[[1, 2], [3, 4], [5, 6]]",
        "y": "[3, 7, 11]"
      },
      "expected": "converges to [1, 1]",
      "points": 20
    },
    {
      "name": "Test with momentum",
      "input": "...",
      "expected": "...",
      "points": 30
    }
  ],
  "solution": {
    "code": "# Full solution provided after submission",
    "explanation": "Step-by-step breakdown"
  },
  "xpReward": 50
}
```

---

## 🧪 MODULE 4: Interactive Lab

### Пример: Gradient Compression Lab

```json
{
  "lab_id": "lab_compression",
  "title": "Gradient Compression Interactive Lab",
  "difficulty": "advanced",
  "bloomLevel": 3,
  "estimatedTime": "3h",
  "objectives": [
    "Understand trade-off between compression and accuracy",
    "Implement Top-K sparsification",
    "Benchmark different compression ratios",
    "Visualize convergence behavior"
  ],
  "setup": {
    "environment": "Jupyter Notebook",
    "datasets": ["CIFAR-10"],
    "frameworks": ["PyTorch", "NumPy"],
    "gpuRequired": false
  },
  "tasks": [
    {
      "task": 1,
      "title": "Implement Top-K Sparsification",
      "instructions": "Implement the Top-K algorithm that keeps only k largest gradients",
      "starterCode": "def topk_sparsification(gradient, k):\n    # TODO\n    pass",
      "checkpoints": [
        "Correctly identifies top k elements",
        "Maintains gradient shape",
        "Handles edge cases"
      ],
      "points": 25
    },
    {
      "task": 2,
      "title": "Add Error Feedback",
      "instructions": "Implement error feedback mechanism to accumulate dropped gradients",
      "starterCode": "def error_feedback(gradient, error, k):\n    # TODO\n    pass",
      "points": 25
    },
    {
      "task": 3,
      "title": "Benchmark Different Compression Ratios",
      "instructions": "Test k=[0.01, 0.1, 0.5, 1.0] and plot convergence",
      "visualization": "Interactive plot with plotly",
      "points": 30
    },
    {
      "task": 4,
      "title": "Analysis and Report",
      "instructions": "Write analysis of results",
      "deliverable": "markdown report",
      "points": 20
    }
  ],
  "interactiveElements": [
    {
      "type": "slider",
      "name": "compression_ratio",
      "min": 0.01,
      "max": 1.0,
      "default": 0.1,
      "realtimeUpdate": true
    },
    {
      "type": "plot",
      "name": "convergence_plot",
      "xAxis": "Iterations",
      "yAxis": "Loss",
      "interactive": true
    }
  ]
}
```

---

## 🔍 MODULE 5: Case Study

### Пример: Google Gboard Case Study

```markdown
# Case Study: Federated Learning in Google Gboard

## 📱 Background

**Problem**: How to improve keyboard predictions without accessing user data?

**Solution**: Federated Learning with FedAvg

## 🎯 Objectives

1. Analyze the architecture of Gboard FL system
2. Understand privacy guarantees
3. Evaluate performance metrics
4. Identify challenges and solutions

## 📊 System Architecture

```
[User Device 1] ─┐
[User Device 2] ─┼─→ [Federated Server] → [Global Model]
[User Device N] ─┘
```

## 🔬 Technical Details

### Model Architecture
- Next-word prediction (LSTM)
- Model size: 10MB
- Vocabulary: 100k words

### Training Configuration
- Clients per round: 100
- Local epochs: 5
- Batch size: 16
- Communication rounds: 1000

### Privacy Mechanisms
1. Secure Aggregation
2. Differential Privacy (ε = 8)
3. User-level sampling

## 📈 Results

| Metric | Centralized | Federated |
|--------|-------------|-----------|
| Accuracy | 87.2% | 85.1% |
| Privacy | ❌ | ✅ |
| User data collected | 100GB | 0GB |

## 💡 Key Insights

1. **Trade-off**: 2.1% accuracy drop for full privacy
2. **Scale**: Deployed to 100M+ devices
3. **Impact**: No user data stored on servers

## 🎯 Discussion Questions

1. What are the main challenges?
2. How does Secure Aggregation work?
3. Could this work for other applications?
4. What improvements would you suggest?

## 📝 Assignment

**Task**: Design a federated learning system for:
- Voice assistants
- Photo organization
- Email categorization

**Deliverable**:
- Architecture diagram
- Privacy analysis
- Performance estimation
```

---

## 🚀 MODULE 6: Capstone Project

### Пример: Build Distributed AI System

```json
{
  "project_id": "capstone_distributed_ai",
  "title": "Capstone: Distributed AI System",
  "difficulty": "expert",
  "bloomLevel": 6,
  "duration": "40h",
  "teamSize": "1-3 students",
  "objectives": [
    "Design and implement a complete distributed AI system",
    "Handle real-world challenges",
    "Deploy to production",
    "Present findings"
  ],
  "requirements": {
    "functional": [
      "Federated learning with 5+ clients",
      "Gradient compression",
      "Monitoring dashboard",
      "REST API",
      "Containerized deployment"
    ],
    "technical": [
      "Python/PyTorch",
      "Docker/Kubernetes",
      "gRPC for communication",
      "MongoDB for logging",
      "React for dashboard"
    ]
  },
  "milestones": [
    {
      "week": 1,
      "title": "Design & Architecture",
      "deliverables": [
        "Architecture diagram",
        "Technology choices",
        "Project plan"
      ],
      "points": 100
    },
    {
      "week": 2-3,
      "title": "Core Implementation",
      "deliverables": [
        "FL system working",
        "Unit tests",
        "Integration tests"
      ],
      "points": 200
    },
    {
      "week": 4-5,
      "title": "Advanced Features",
      "deliverables": [
        "Compression implemented",
        "Dashboard functional",
        "Performance optimized"
      ],
      "points": 200
    },
    {
      "week": 6,
      "title": "Deployment & Documentation",
      "deliverables": [
        "Deployed to cloud",
        "Full documentation",
        "Video demo"
      ],
      "points": 100
    },
    {
      "week": 7-8,
      "title": "Final Presentation",
      "deliverables": [
        "Research paper (4-6 pages)",
        "Presentation (15 min)",
        "Q&A"
      ],
      "points": 400
    }
  ],
  "evaluation": {
    "implementation": 40,
    "documentation": 20,
    "presentation": 20,
    "innovation": 20
  },
  "badges": [
    "Capstone Champion 🏆",
    "System Architect 🏗️",
    "Production Ready 🚀"
  ]
}
```

---

## 🎮 Gamification System

### XP and Levels

```javascript
const XP_SYSTEM = {
  levels: [
    { level: 1, name: "Novice", minXP: 0, badge: "🌱" },
    { level: 2, name: "Beginner", minXP: 100, badge: "🌿" },
    { level: 3, name: "Intermediate", minXP: 300, badge: "🌳" },
    { level: 4, name: "Advanced", minXP: 700, badge: "🏔️" },
    { level: 5, name: "Expert", minXP: 1500, badge: "🌟" },
    { level: 6, name: "Master", minXP: 3000, badge: "👑" }
  ],

  activities: {
    read_module: 10,
    complete_flashcard: 5,
    pass_quiz: 25,
    solve_exercise: 50,
    complete_lab: 100,
    finish_project: 200,
    write_review: 30,
    help_peer: 20,
    daily_streak: 10
  }
};
```

### Achievements

```javascript
const BADGES = {
  first_steps: {
    id: "first_steps",
    name: "First Steps",
    description: "Complete your first module",
    icon: "🏆",
    xp: 50,
    rarity: "common"
  },

  code_warrior: {
    id: "code_warrior",
    name: "Code Warrior",
    description: "Solve 20 coding exercises",
    icon: "💻",
    xp: 200,
    rarity: "rare",
    progress: {
      current: 0,
      target: 20
    }
  },

  streak_master: {
    id: "streak_master",
    name: "Streak Master",
    description: "7 days learning streak",
    icon: "🔥",
    xp: 100,
    rarity: "epic"
  },

  perfectionist: {
    id: "perfectionist",
    name: "Perfectionist",
    description: "100% in all category quizzes",
    icon: "🌟",
    xp: 500,
    rarity: "legendary"
  }
};
```

---

## 📊 Progress Tracking

### User Progress Schema

```javascript
const UserProgress = {
  userId: "user_123",
  level: 3,
  xp: 450,
  streak: 5,

  completedModules: [
    {
      moduleId: "1",
      completedAt: "2025-11-15",
      score: 95,
      timeSpent: 7200
    }
  ],

  quizScores: [
    {
      quizId: "quiz_1",
      score: 90,
      attempts: 2,
      bestScore: 90
    }
  ],

  exercisesSolved: [
    {
      exerciseId: "ex_sgd",
      solved: true,
      attempts: 3,
      bestTime: 1800
    }
  ],

  badges: ["first_steps", "code_warrior"],

  learningPaths: {
    fundamentals: {
      status: "completed",
      progress: 100,
      completedAt: "2025-11-10"
    },
    federated_learning: {
      status: "in_progress",
      progress: 60
    }
  },

  spacedRepetition: {
    dueCards: 12,
    reviewedToday: 8,
    masteredCards: 45
  }
};
```

---

**Created**: 2025-11-18
**Version**: 1.0
**Status**: Production Ready
