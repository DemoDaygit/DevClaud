/**
 * Sample data for Knowledge Graph
 * Based on Swarm AI and Federated Learning concepts
 */

export const GRAPH_DATA = {
  nodes: [
    // Математические основы
    { id: '1', label: 'Теория Оптимизации', group: 'foundation', year: 2018, title: 'Теория оптимизации', description: 'Математическая основа всех методов обучения. Включает градиентные методы и стохастическую оптимизацию.', formula: '\\min_{\\theta} \\mathbb{E}[L(f_{\\theta}(x), y)]', triz: 'Системность - базовый уровень иерархии' },
    { id: '2', label: 'Game Theory', group: 'foundation', year: 2018, title: 'Теория игр', description: 'Математическая теория стратегического взаимодействия между рациональными агентами.', formula: 'Nash Equilibrium: \\pi_i^* = \\arg\\max_{\\pi_i} \\mathbb{E}[R_i]', triz: 'Согласование - разрешение конфликтов' },
    { id: '3', label: 'Информационная Теория', group: 'foundation', year: 2018, title: 'Информационная теория', description: 'Количественная оценка информации, энтропии и коммуникации.', formula: 'H(X) = -\\sum_x p(x)\\log p(x)', triz: 'Измеримость - квантификация информации' },

    // Базовые алгоритмы
    { id: '10', label: 'SGD', group: 'basic_algo', year: 2018, title: 'Stochastic Gradient Descent', description: 'Базовый алгоритм оптимизации для нейронных сетей.', formula: '\\theta_{t+1} = \\theta_t - \\eta_t \\nabla L', triz: 'Дробление - использование мини-батчей' },
    { id: '11', label: 'Adam', group: 'basic_algo', year: 2018, title: 'Adaptive Moment Estimation', description: 'Адаптивный алгоритм оптимизации с momentum.', formula: '\\theta_{t+1} = \\theta_t - \\eta\\frac{m_t}{\\sqrt{v_t}+\\epsilon}', triz: 'Адаптация - покоординатная настройка' },
    { id: '12', label: 'PSO', group: 'basic_algo', year: 2018, title: 'Particle Swarm Optimization', description: 'Роевой алгоритм оптимизации, имитирующий поведение птичьих стай.', formula: 'v_i^{t+1} = wv_i^t + c_1r_1(p_i-x_i^t) + c_2r_2(g-x_i^t)', triz: 'Коллективизм - использование опыта группы' },

    // Федеративное обучение
    { id: '20', label: 'FedAvg', group: 'federated', year: 2019, title: 'Federated Averaging', description: 'Базовый алгоритм федеративного обучения. Клиенты обучаются локально, сервер усредняет веса.', formula: '\\theta_{t+1} = \\sum_{k=1}^K \\frac{n_k}{n}\\theta_k^{t+1}', triz: 'Объединение - агрегация локальных моделей' },
    { id: '21', label: 'FedProx', group: 'federated', year: 2020, title: 'Federated Proximal', description: 'Расширение FedAvg с проксимальным членом для гетерогенности.', formula: '\\min_\\theta f_k(\\theta) + \\frac{\\mu}{2}\\|\\theta - \\theta^t\\|^2', triz: 'Регуляризация - ограничение отклонений' },
    { id: '22', label: 'SCAFFOLD', group: 'federated', year: 2020, title: 'Stochastic Controlled Averaging', description: 'Использует контрольные вариаты для устранения client drift.', formula: 'g_i = \\nabla f_i(x) - c_i + c', triz: 'Управление отклонениями' },
    { id: '24', label: 'DiLoCo', group: 'federated', year: 2024, title: 'Distributed Low-Communication', description: 'Экстремально редкая синхронизация (каждые 500 шагов).', formula: 'H=500, \\theta_{global}^{t+1} = \\theta_{global}^t + \\tau\\sum_{i=1}^N ...', triz: 'Периодичность - минимизация коммуникации' },

    // Сжатие
    { id: '30', label: 'Top-K Sparsification', group: 'compression', year: 2019, title: 'Top-K Gradient Sparsification', description: 'Передача только k крупнейших градиентов с error feedback.', formula: 'g_{sparse} = TopK(g, k), e_{t+1} = e_t + (g_t - g_{sparse})', triz: 'Избирательность - фокус на важном' },
    { id: '31', label: 'PowerSGD', group: 'compression', year: 2020, title: 'PowerSGD Low-Rank Compression', description: 'Low-rank аппроксимация матрицы градиентов.', formula: 'M \\approx PQ^T, ratio = \\frac{nm}{r(n+m)}', triz: 'Декомпозиция - разложение на факторы' },
    { id: '32', label: 'QSGD', group: 'compression', year: 2019, title: 'Quantized SGD', description: 'Стохастическая квантизация градиентов.', formula: '\\mathbb{E}[Q_s(v)] = v', triz: 'Дискретизация - уменьшение битности' },

    // MoE
    { id: '50', label: 'Switch Transformers', group: 'moe', year: 2021, title: 'Switch Transformers', description: 'Simplified MoE с top-1 routing. 1.6T параметров, 4× ускорение.', formula: 'y = \\sum_{i=1}^n G(x)_i E_i(x)', triz: 'Специализация - разделение экспертизы' },
    { id: '51', label: 'Expert Choice Routing', group: 'moe', year: 2022, title: 'Expert Choice Routing', description: 'Эксперты выбирают токены. Идеальная балансировка нагрузки.', formula: 'selected\\_tokens = TopK(Router(tokens))', triz: 'Инверсия - обратная логика выбора' },
    { id: '52', label: 'Mixture of Agents', group: 'moe', year: 2024, title: 'Mixture of Agents', description: 'Layered LLM collaboration. Каждый агент использует outputs предыдущих.', formula: 'response_{layer_i} = LLM_i(query, \\{responses\\})', triz: 'Послойное сотрудничество' },

    // Model Merging
    { id: '60', label: 'TIES-Merging', group: 'merging', year: 2023, title: 'TIES Merging', description: 'TRIM magnitude, ELECT sign, DISJOINT MERGE.', formula: 'elected\\_sign = sign(\\sum \\mathbb{1}[...]\\cdot|\\tau_i|)', triz: 'Согласование - разрешение конфликтов' },
    { id: '61', label: 'DARE', group: 'merging', year: 2023, title: 'Drop And REscale', description: 'Random drop с rescaling. Экстремальная спарсификация.', formula: 'drop(\\theta, p) = \\begin{cases} 0 & w.p.\\; p \\\\ \\theta/(1-p) & w.p.\\; 1-p \\end{cases}', triz: 'Стохастизация' },

    // MARL
    { id: '40', label: 'QMIX', group: 'marl', year: 2019, title: 'Monotonic Value Function Factorization', description: 'Value decomposition с mixing network.', formula: 'Q_{tot} = f(Q_1, ..., Q_n; s)', triz: 'Декомпозиция с ограничениями' },
    { id: '41', label: 'MAPPO', group: 'marl', year: 2021, title: 'Multi-Agent PPO', description: 'Простой PPO с value normalization и parameter sharing.', formula: 'L^{CLIP} = \\mathbb{E}[\\min(r_t A_t, ...)]', triz: 'Простота - минимальные модификации' },

    // Blockchain
    { id: '80', label: 'Blockchain FL', group: 'blockchain', year: 2021, title: 'Blockchain-enabled FL', description: 'Децентрализованная координация через smart contracts.', formula: 'hash(block_n) = SHA256(...)', triz: 'Распределение доверия - консенсус' },
    { id: '81', label: 'PoETA', group: 'blockchain', year: 2025, title: 'Proof of Elapsed Time and Accuracy', description: 'Consensus mechanism использующий ML training как proof.', formula: 'reward \\propto accuracy \\times time', triz: 'Переориентация - польза от работы' }
  ],

  edges: [
    // Основы → Базовые алгоритмы
    { from: '1', to: '10', type: 'requires', label: 'базис', weight: 1.0 },
    { from: '1', to: '11', type: 'requires', label: 'базис', weight: 1.0 },
    { from: '1', to: '12', type: 'requires', label: 'базис', weight: 1.0 },
    { from: '2', to: '40', type: 'requires', label: 'game theory', weight: 1.0 },
    { from: '3', to: '30', type: 'requires', label: 'entropy', weight: 1.0 },

    // Эволюция федеративного обучения
    { from: '10', to: '20', type: 'evolves_to', label: 'extends', weight: 1.0 },
    { from: '20', to: '21', type: 'evolves_to', label: '2020', weight: 1.0 },
    { from: '20', to: '22', type: 'evolves_to', label: '2020', weight: 1.0 },
    { from: '11', to: '21', type: 'evolves_to', label: 'adapts', weight: 1.0 },
    { from: '20', to: '24', type: 'evolves_to', label: '2024', weight: 1.0 },

    // Сжатие коммуникации
    { from: '10', to: '30', type: 'evolves_to', label: 'compresses', weight: 1.0 },
    { from: '10', to: '31', type: 'evolves_to', label: 'compresses', weight: 1.0 },
    { from: '10', to: '32', type: 'evolves_to', label: 'quantizes', weight: 1.0 },
    { from: '32', to: '31', type: 'evolves_to', label: 'combines', weight: 1.0 },

    // MoE эволюция
    { from: '50', to: '51', type: 'evolves_to', label: 'inverts', weight: 1.0 },
    { from: '50', to: '52', type: 'evolves_to', label: 'agents', weight: 1.0 },

    // Merging
    { from: '60', to: '61', type: 'evolves_to', label: 'stochastic', weight: 1.0 },

    // MARL
    { from: '40', to: '41', type: 'evolves_to', label: 'simplifies', weight: 1.0 },

    // Интеграции
    { from: '20', to: '30', type: 'combines', label: 'uses', weight: 1.0 },
    { from: '24', to: '30', type: 'combines', label: 'integrates', weight: 1.0 },
    { from: '80', to: '24', type: 'combines', label: 'coordination', weight: 1.0 },
    { from: '52', to: '60', type: 'combines', label: 'merges', weight: 1.0 },

    // ПРОТИВОРЕЧИЯ
    { from: '20', to: '30', type: 'contradiction', label: 'Communication ↔ Accuracy', weight: 0.8 },
    { from: '24', to: '31', type: 'contradiction', label: 'Compression ↔ Quality', weight: 0.9 }
  ]
};
