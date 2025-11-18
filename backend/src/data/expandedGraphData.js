/**
 * EXPANDED KNOWLEDGE GRAPH with LEARNING CONTOURS
 *
 * Структура основана на Bloom's Taxonomy и включает:
 * - Теоретические концепции (Theory)
 * - Практические задания (Practice)
 * - Проекты (Projects)
 * - Оценки (Assessments)
 * - Ресурсы (Resources)
 */

export const EXPANDED_GRAPH_DATA = {
  nodes: [
    // ============================================
    // LEVEL 1: FOUNDATIONS (Основы)
    // ============================================

    // Теоретические концепции
    {
      id: '1',
      label: 'Теория Оптимизации',
      group: 'foundation',
      nodeType: 'concept',
      bloomLevel: 1, // Remember
      year: 2018,
      title: 'Теория оптимизации',
      description: 'Математическая основа всех методов обучения. Включает градиентные методы и стохастическую оптимизацию.',
      formula: '\\min_{\\theta} \\mathbb{E}[L(f_{\\theta}(x), y)]',
      triz: 'Системность - базовый уровень иерархии',
      learningPath: 'fundamentals',
      difficulty: 'beginner',
      estimatedTime: '2h',
      prerequisites: []
    },

    {
      id: '2',
      label: 'Game Theory',
      group: 'foundation',
      nodeType: 'concept',
      bloomLevel: 1,
      year: 2018,
      title: 'Теория игр',
      description: 'Математическая теория стратегического взаимодействия между рациональными агентами.',
      formula: 'Nash Equilibrium: \\pi_i^* = \\arg\\max_{\\pi_i} \\mathbb{E}[R_i]',
      triz: 'Согласование - разрешение конфликтов',
      learningPath: 'fundamentals',
      difficulty: 'beginner',
      estimatedTime: '1.5h',
      prerequisites: []
    },

    {
      id: '3',
      label: 'Информационная Теория',
      group: 'foundation',
      nodeType: 'concept',
      bloomLevel: 1,
      year: 2018,
      title: 'Информационная теория',
      description: 'Количественная оценка информации, энтропии и коммуникации.',
      formula: 'H(X) = -\\sum_x p(x)\\log p(x)',
      triz: 'Измеримость - квантификация информации',
      learningPath: 'fundamentals',
      difficulty: 'beginner',
      estimatedTime: '2h',
      prerequisites: []
    },

    // Flashcards для Level 1
    {
      id: 'flash_1',
      label: 'Flashcards: Основы',
      group: 'learning',
      nodeType: 'flashcard',
      bloomLevel: 1,
      title: 'Карточки для запоминания основ',
      description: '20 карточек с ключевыми концепциями оптимизации',
      difficulty: 'beginner',
      estimatedTime: '15m',
      prerequisites: ['1']
    },

    // Quiz для Level 1
    {
      id: 'quiz_1',
      label: 'Quiz: Foundations',
      group: 'learning',
      nodeType: 'quiz',
      bloomLevel: 1,
      title: 'Тест по основам',
      description: '10 вопросов для проверки базовых знаний',
      difficulty: 'beginner',
      estimatedTime: '10m',
      prerequisites: ['1', '2', '3'],
      questions: 10,
      passingScore: 70
    },

    // ============================================
    // LEVEL 2: BASIC ALGORITHMS (Базовые алгоритмы)
    // ============================================

    {
      id: '10',
      label: 'SGD',
      group: 'basic_algo',
      nodeType: 'concept',
      bloomLevel: 2, // Understand
      year: 2018,
      title: 'Stochastic Gradient Descent',
      description: 'Базовый алгоритм оптимизации для нейронных сетей.',
      formula: '\\theta_{t+1} = \\theta_t - \\eta_t \\nabla L',
      triz: 'Дробление - использование мини-батчей',
      learningPath: 'fundamentals',
      difficulty: 'beginner',
      estimatedTime: '1.5h',
      prerequisites: ['1']
    },

    {
      id: '11',
      label: 'Adam',
      group: 'basic_algo',
      nodeType: 'concept',
      bloomLevel: 2,
      year: 2018,
      title: 'Adaptive Moment Estimation',
      description: 'Адаптивный алгоритм оптимизации с momentum.',
      formula: '\\theta_{t+1} = \\theta_t - \\eta\\frac{m_t}{\\sqrt{v_t}+\\epsilon}',
      triz: 'Адаптация - покоординатная настройка',
      learningPath: 'fundamentals',
      difficulty: 'intermediate',
      estimatedTime: '1.5h',
      prerequisites: ['10']
    },

    {
      id: '12',
      label: 'PSO',
      group: 'basic_algo',
      nodeType: 'concept',
      bloomLevel: 2,
      year: 2018,
      title: 'Particle Swarm Optimization',
      description: 'Роевой алгоритм оптимизации, имитирующий поведение птичьих стай.',
      formula: 'v_i^{t+1} = wv_i^t + c_1r_1(p_i-x_i^t) + c_2r_2(g-x_i^t)',
      triz: 'Коллективизм - использование опыта группы',
      learningPath: 'fundamentals',
      difficulty: 'intermediate',
      estimatedTime: '2h',
      prerequisites: ['10']
    },

    // Interactive Tutorial для SGD
    {
      id: 'tutorial_sgd',
      label: 'Tutorial: SGD',
      group: 'learning',
      nodeType: 'tutorial',
      bloomLevel: 2,
      title: 'Интерактивный урок по SGD',
      description: 'Визуализация работы градиентного спуска с анимацией',
      difficulty: 'beginner',
      estimatedTime: '20m',
      prerequisites: ['10']
    },

    // Coding Exercise Level 3 (Apply)
    {
      id: 'exercise_sgd',
      label: 'Exercise: Implement SGD',
      group: 'learning',
      nodeType: 'exercise',
      bloomLevel: 3, // Apply
      title: 'Реализуйте SGD с нуля',
      description: 'Напишите код для SGD и примените его к простой функции',
      difficulty: 'intermediate',
      estimatedTime: '45m',
      prerequisites: ['10', 'tutorial_sgd'],
      language: 'python',
      difficulty_level: 'medium'
    },

    // ============================================
    // LEVEL 3: FEDERATED LEARNING (Федеративное обучение)
    // ============================================

    {
      id: '20',
      label: 'FedAvg',
      group: 'federated',
      nodeType: 'concept',
      bloomLevel: 2,
      year: 2019,
      title: 'Federated Averaging',
      description: 'Базовый алгоритм федеративного обучения. Клиенты обучаются локально, сервер усредняет веса.',
      formula: '\\theta_{t+1} = \\sum_{k=1}^K \\frac{n_k}{n}\\theta_k^{t+1}',
      triz: 'Объединение - агрегация локальных моделей',
      learningPath: 'federated_learning',
      difficulty: 'intermediate',
      estimatedTime: '3h',
      prerequisites: ['10', '11']
    },

    {
      id: '21',
      label: 'FedProx',
      group: 'federated',
      nodeType: 'concept',
      bloomLevel: 3,
      year: 2020,
      title: 'Federated Proximal',
      description: 'Расширение FedAvg с проксимальным членом для гетерогенности.',
      formula: '\\min_\\theta f_k(\\theta) + \\frac{\\mu}{2}\\|\\theta - \\theta^t\\|^2',
      triz: 'Регуляризация - ограничение отклонений',
      learningPath: 'federated_learning',
      difficulty: 'advanced',
      estimatedTime: '2h',
      prerequisites: ['20']
    },

    // Case Study (Level 4: Analyze)
    {
      id: 'case_fedavg',
      label: 'Case Study: Google Gboard',
      group: 'learning',
      nodeType: 'case_study',
      bloomLevel: 4, // Analyze
      title: 'Анализ применения FedAvg в Google Gboard',
      description: 'Реальный кейс: как Google использует федеративное обучение для улучшения клавиатуры',
      difficulty: 'advanced',
      estimatedTime: '1h',
      prerequisites: ['20'],
      realWorldExample: true
    },

    // Comparison Exercise (Level 4: Analyze)
    {
      id: 'compare_fed',
      label: 'Compare: FedAvg vs FedProx',
      group: 'learning',
      nodeType: 'comparison',
      bloomLevel: 4,
      title: 'Сравнительный анализ FedAvg и FedProx',
      description: 'Проведите эксперименты и сравните производительность',
      difficulty: 'advanced',
      estimatedTime: '2h',
      prerequisites: ['20', '21'],
      requiresCode: true
    },

    // ============================================
    // LEVEL 4: COMPRESSION TECHNIQUES (Сжатие)
    // ============================================

    {
      id: '30',
      label: 'Top-K Sparsification',
      group: 'compression',
      nodeType: 'concept',
      bloomLevel: 3,
      year: 2019,
      title: 'Top-K Gradient Sparsification',
      description: 'Передача только k крупнейших градиентов с error feedback.',
      formula: 'g_{sparse} = TopK(g, k), e_{t+1} = e_t + (g_t - g_{sparse})',
      triz: 'Избирательность - фокус на важном',
      learningPath: 'compression',
      difficulty: 'advanced',
      estimatedTime: '2h',
      prerequisites: ['20']
    },

    // Lab Exercise (Level 3: Apply)
    {
      id: 'lab_compression',
      label: 'Lab: Gradient Compression',
      group: 'learning',
      nodeType: 'lab',
      bloomLevel: 3,
      title: 'Лабораторная: Реализация градиентного сжатия',
      description: 'Интерактивная лабораторная работа с visualization',
      difficulty: 'advanced',
      estimatedTime: '3h',
      prerequisites: ['30'],
      interactive: true
    },

    // ============================================
    // LEVEL 5: PROJECTS (Проекты для Level 6: Create)
    // ============================================

    {
      id: 'project_mnist',
      label: 'Project: MNIST Classifier',
      group: 'project',
      nodeType: 'project',
      bloomLevel: 6, // Create
      title: 'Проект: Классификатор MNIST',
      description: 'Создайте классификатор рукописных цифр с нуля',
      difficulty: 'beginner',
      estimatedTime: '4h',
      prerequisites: ['10', '11', 'exercise_sgd'],
      deliverables: ['code', 'report', 'demo']
    },

    {
      id: 'project_federated',
      label: 'Project: FL System',
      group: 'project',
      nodeType: 'project',
      bloomLevel: 6,
      title: 'Проект: Система федеративного обучения',
      description: 'Постройте полноценную систему FL с несколькими клиентами',
      difficulty: 'advanced',
      estimatedTime: '10h',
      prerequisites: ['20', '21', '30'],
      deliverables: ['code', 'architecture', 'benchmarks', 'presentation']
    },

    {
      id: 'project_capstone',
      label: 'Capstone: Distributed AI',
      group: 'project',
      nodeType: 'capstone',
      bloomLevel: 6,
      title: 'Capstone проект: Распределенная AI система',
      description: 'Финальный проект: создайте инновационное решение',
      difficulty: 'expert',
      estimatedTime: '40h',
      prerequisites: ['project_federated', '50', '60'],
      deliverables: ['code', 'paper', 'presentation', 'deployment']
    },

    // ============================================
    // ADDITIONAL LEARNING NODES
    // ============================================

    // Resources
    {
      id: 'resource_papers',
      label: 'Research Papers',
      group: 'resource',
      nodeType: 'resource',
      bloomLevel: 4,
      title: 'Научные статьи',
      description: 'Коллекция важных исследовательских работ',
      difficulty: 'all',
      estimatedTime: 'varies',
      prerequisites: []
    },

    {
      id: 'resource_videos',
      label: 'Video Lectures',
      group: 'resource',
      nodeType: 'resource',
      bloomLevel: 2,
      title: 'Видео лекции',
      description: 'Курированная коллекция видео уроков',
      difficulty: 'all',
      estimatedTime: 'varies',
      prerequisites: []
    },

    // Assessments
    {
      id: 'assessment_mid',
      label: 'Midterm Assessment',
      group: 'assessment',
      nodeType: 'assessment',
      bloomLevel: 5, // Evaluate
      title: 'Промежуточная аттестация',
      description: 'Оцените свой прогресс в середине курса',
      difficulty: 'intermediate',
      estimatedTime: '1.5h',
      prerequisites: ['20', '30'],
      questions: 30,
      passingScore: 75
    },

    {
      id: 'assessment_final',
      label: 'Final Exam',
      group: 'assessment',
      nodeType: 'assessment',
      bloomLevel: 5,
      title: 'Финальный экзамен',
      description: 'Комплексная оценка всех знаний',
      difficulty: 'advanced',
      estimatedTime: '2h',
      prerequisites: ['assessment_mid', 'project_federated'],
      questions: 50,
      passingScore: 80
    },

    // ============================================
    // ADVANCED TOPICS (MoE, Merging, etc.)
    // ============================================

    {
      id: '50',
      label: 'Switch Transformers',
      group: 'moe',
      nodeType: 'concept',
      bloomLevel: 4,
      year: 2021,
      title: 'Switch Transformers',
      description: 'Simplified MoE с top-1 routing. 1.6T параметров, 4× ускорение.',
      formula: 'y = \\sum_{i=1}^n G(x)_i E_i(x)',
      triz: 'Специализация - разделение экспертизы',
      learningPath: 'advanced',
      difficulty: 'expert',
      estimatedTime: '3h',
      prerequisites: ['20', '30']
    },

    {
      id: '60',
      label: 'TIES-Merging',
      group: 'merging',
      nodeType: 'concept',
      bloomLevel: 4,
      year: 2023,
      title: 'TIES Merging',
      description: 'TRIM magnitude, ELECT sign, DISJOINT MERGE.',
      formula: 'elected\\_sign = sign(\\sum \\mathbb{1}[...]\\cdot|\\tau_i|)',
      triz: 'Согласование - разрешение конфликтов',
      learningPath: 'advanced',
      difficulty: 'expert',
      estimatedTime: '2h',
      prerequisites: ['50']
    },

    // ============================================
    // GAMIFICATION NODES
    // ============================================

    {
      id: 'badge_first_steps',
      label: 'Badge: First Steps',
      group: 'gamification',
      nodeType: 'badge',
      title: 'Первые шаги',
      description: 'Завершите первый модуль',
      icon: '🏆',
      xpReward: 50
    },

    {
      id: 'badge_code_warrior',
      label: 'Badge: Code Warrior',
      group: 'gamification',
      nodeType: 'badge',
      title: 'Воин кода',
      description: 'Решите 20 задач по программированию',
      icon: '💻',
      xpReward: 200
    },

    {
      id: 'badge_perfectionist',
      label: 'Badge: Perfectionist',
      group: 'gamification',
      nodeType: 'badge',
      title: 'Перфекционист',
      description: 'Получите 100% во всех квизах категории',
      icon: '🌟',
      xpReward: 500
    }
  ],

  edges: [
    // ============================================
    // PREREQUISITE EDGES (Зависимости)
    // ============================================

    // Foundations
    { from: '1', to: '10', type: 'prerequisite', label: 'требуется для', weight: 1.0 },
    { from: '1', to: '11', type: 'prerequisite', label: 'требуется для', weight: 1.0 },
    { from: '1', to: '12', type: 'prerequisite', label: 'требуется для', weight: 1.0 },

    // Learning Flow
    { from: '1', to: 'flash_1', type: 'learning_flow', label: 'практика', weight: 1.0 },
    { from: 'flash_1', to: 'quiz_1', type: 'learning_flow', label: 'проверка', weight: 1.0 },
    { from: '10', to: 'tutorial_sgd', type: 'learning_flow', label: 'визуализация', weight: 1.0 },
    { from: 'tutorial_sgd', to: 'exercise_sgd', type: 'learning_flow', label: 'применение', weight: 1.0 },

    // Federated Learning Path
    { from: '10', to: '20', type: 'evolves_to', label: 'extends', weight: 1.0 },
    { from: '20', to: '21', type: 'evolves_to', label: 'improves', weight: 1.0 },
    { from: '20', to: 'case_fedavg', type: 'learning_flow', label: 'real-world', weight: 1.0 },
    { from: '21', to: 'compare_fed', type: 'learning_flow', label: 'compare', weight: 1.0 },

    // Compression
    { from: '20', to: '30', type: 'combines', label: 'uses', weight: 1.0 },
    { from: '30', to: 'lab_compression', type: 'learning_flow', label: 'lab', weight: 1.0 },

    // Projects
    { from: 'exercise_sgd', to: 'project_mnist', type: 'learning_flow', label: 'build on', weight: 1.0 },
    { from: '20', to: 'project_federated', type: 'learning_flow', label: 'apply', weight: 1.0 },
    { from: 'project_federated', to: 'project_capstone', type: 'learning_flow', label: 'advance', weight: 1.0 },

    // Resources
    { from: '20', to: 'resource_papers', type: 'supplementary', label: 'read more', weight: 0.5 },
    { from: '10', to: 'resource_videos', type: 'supplementary', label: 'watch', weight: 0.5 },

    // Assessments
    { from: 'compare_fed', to: 'assessment_mid', type: 'assessment_flow', label: 'evaluate', weight: 1.0 },
    { from: 'project_federated', to: 'assessment_final', type: 'assessment_flow', label: 'final check', weight: 1.0 },

    // Advanced
    { from: '20', to: '50', type: 'evolves_to', label: 'advanced', weight: 1.0 },
    { from: '50', to: '60', type: 'combines', label: 'merges', weight: 1.0 },

    // Gamification
    { from: 'quiz_1', to: 'badge_first_steps', type: 'unlocks', label: 'earn', weight: 1.0 },
    { from: 'exercise_sgd', to: 'badge_code_warrior', type: 'progress', label: 'progress', weight: 0.05 },
    { from: 'assessment_mid', to: 'badge_perfectionist', type: 'unlocks', label: 'earn', weight: 1.0 }
  ]
};

// ============================================
// LEARNING PATHS DEFINITIONS
// ============================================

export const LEARNING_PATHS = {
  fundamentals: {
    id: 'fundamentals',
    name: 'Fundamentals of ML',
    description: 'Основы машинного обучения и оптимизации',
    duration: '2-3 weeks',
    difficulty: 'beginner',
    modules: ['1', '2', '3', '10', '11', '12'],
    practiceNodes: ['flash_1', 'quiz_1', 'tutorial_sgd', 'exercise_sgd'],
    project: 'project_mnist',
    xpReward: 500
  },

  federated_learning: {
    id: 'federated_learning',
    name: 'Federated Learning',
    description: 'Федеративное и распределенное обучение',
    duration: '4-6 weeks',
    difficulty: 'intermediate',
    prerequisites: ['fundamentals'],
    modules: ['20', '21', '22', '24'],
    practiceNodes: ['case_fedavg', 'compare_fed', 'lab_compression'],
    project: 'project_federated',
    assessment: 'assessment_mid',
    xpReward: 1200
  },

  compression: {
    id: 'compression',
    name: 'Compression Techniques',
    description: 'Техники сжатия для эффективной коммуникации',
    duration: '3-4 weeks',
    difficulty: 'intermediate',
    prerequisites: ['federated_learning'],
    modules: ['30', '31', '32'],
    practiceNodes: ['lab_compression'],
    xpReward: 800
  },

  advanced: {
    id: 'advanced',
    name: 'Advanced Topics',
    description: 'Продвинутые темы: MoE, Model Merging, MARL',
    duration: '6-8 weeks',
    difficulty: 'advanced',
    prerequisites: ['federated_learning', 'compression'],
    modules: ['50', '51', '52', '60', '61'],
    project: 'project_capstone',
    assessment: 'assessment_final',
    xpReward: 2000
  }
};

// ============================================
// BLOOM'S TAXONOMY LEVELS
// ============================================

export const BLOOM_LEVELS = {
  1: { name: 'Remember', color: '#4299e1', icon: '📝' },
  2: { name: 'Understand', color: '#48bb78', icon: '💡' },
  3: { name: 'Apply', color: '#ed8936', icon: '⚙️' },
  4: { name: 'Analyze', color: '#9f7aea', icon: '🔍' },
  5: { name: 'Evaluate', color: '#f6ad55', icon: '⚖️' },
  6: { name: 'Create', color: '#fc8181', icon: '🚀' }
};

// ============================================
// DIFFICULTY LEVELS
// ============================================

export const DIFFICULTY_LEVELS = {
  beginner: { multiplier: 1.0, color: '#48bb78', icon: '🌱' },
  intermediate: { multiplier: 1.5, color: '#ed8936', icon: '🌿' },
  advanced: { multiplier: 2.0, color: '#fc8181', icon: '🌳' },
  expert: { multiplier: 3.0, color: '#9f7aea', icon: '🏔️' }
};
