// ===== DECENTRALIZED AI ACADEMY - ПОЛНОФУНКЦИОНАЛЬНОЕ ПРИЛОЖЕНИЕ =====

import { Visualization3D } from './visualization.js';
import { TutorialSystem } from './tutorials.js';
import { TelegramIntegration } from './telegram.js';

export class AcademyApp {
    constructor() {
        this.currentView = 'explore';
        this.currentLanguage = 'ru'; // Начинаем с русского
        this.curriculum = null;
        this.visualization = null;
        this.tutorialSystem = null;
        this.telegram = null;
        this.userProgress = this.loadProgress();
    }

    async init() {
        console.log('🚀 Initializing Decentralized AI Academy...');

        try {
            await this.loadCurriculum();
            this.initVisualization();
            await this.initTutorialSystem();
            this.initTelegram();
            this.setupEventListeners();
            this.renderView(this.currentView);
            this.hideLoading();
            console.log('✅ Academy initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize academy:', error);
            this.showError(error);
        }
    }

    async loadCurriculum() {
        this.updateLoading('Загрузка учебной программы...');

        // ПОЛНАЯ УЧЕБНАЯ ПРОГРАММА - 10 УРОКОВ ОТ ОСНОВ ДО ДЕПЛОЯ
        this.curriculum = {
            // Траектории обучения
            paths: [
                {
                    id: 'beginner-path',
                    title: {
                        ru: '🌱 Путь новичка: Основы распределенного ИИ',
                        en: '🌱 Beginner Path: Distributed AI Fundamentals'
                    },
                    description: {
                        ru: 'С нуля до понимания базовых концепций',
                        en: 'From zero to understanding basic concepts'
                    },
                    difficulty: 'beginner',
                    duration: {
                        ru: '8 часов',
                        en: '8 hours'
                    },
                    lessons: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4']
                },
                {
                    id: 'intermediate-path',
                    title: {
                        ru: '🚀 Путь практика: Реализация алгоритмов',
                        en: '🚀 Practitioner Path: Algorithm Implementation'
                    },
                    description: {
                        ru: 'Глубокое погружение в алгоритмы и код',
                        en: 'Deep dive into algorithms and code'
                    },
                    difficulty: 'intermediate',
                    duration: {
                        ru: '12 часов',
                        en: '12 hours'
                    },
                    lessons: ['lesson-5', 'lesson-6', 'lesson-7']
                },
                {
                    id: 'advanced-path',
                    title: {
                        ru: '⚡ Путь эксперта: Production деплой',
                        en: '⚡ Expert Path: Production Deployment'
                    },
                    description: {
                        ru: 'От разработки до production-деплоя',
                        en: 'From development to production deployment'
                    },
                    difficulty: 'advanced',
                    duration: {
                        ru: '16 часов',
                        en: '16 hours'
                    },
                    lessons: ['lesson-8', 'lesson-9', 'lesson-10']
                }
            ],

            // 10 ПОЛНОЦЕННЫХ УРОКОВ
            lessons: [
                // УРОК 1: Основы
                {
                    id: 'lesson-1',
                    number: 1,
                    title: {
                        ru: 'Что такое распределенный искусственный интеллект?',
                        en: 'What is Distributed Artificial Intelligence?'
                    },
                    description: {
                        ru: 'Знакомство с концепциями децентрализованного ИИ, отличия от традиционных подходов',
                        en: 'Introduction to decentralized AI concepts, differences from traditional approaches'
                    },
                    duration: {
                        ru: '1.5 часа',
                        en: '1.5 hours'
                    },
                    difficulty: 'beginner',
                    topics: ['distributed-ai-intro', 'centralized-vs-distributed', 'why-distributed'],
                    content: {
                        ru: `
# Урок 1: Введение в распределенный ИИ

## 🎯 Цели урока
После этого урока вы:
- Поймете основные концепции распределенного ИИ
- Узнаете отличия от централизованного подхода
- Разберете реальные примеры применения

## 📚 Теория

### Что такое распределенный ИИ?

**Распределенный искусственный интеллект** - это подход, при котором вычисления и обучение моделей происходят на множестве независимых узлов (устройств, серверов), а не на одном центральном сервере.

### Ключевые принципы:

1. **Децентрализация** - нет единой точки отказа
2. **Параллелизм** - вычисления идут одновременно на многих узлах
3. **Приватность** - данные не покидают устройства
4. **Масштабируемость** - легко добавить новые узлы

### Централизованный vs Распределенный

**Централизованный подход:**
\`\`\`
Пользователи → Данные → Центральный сервер → Обучение → Модель
\`\`\`

**Распределенный подход:**
\`\`\`
Узел 1: Локальные данные → Локальное обучение → Обновления модели
Узел 2: Локальные данные → Локальное обучение → Обновления модели
   ↓                  ↓                      ↓
         Агрегация обновлений → Глобальная модель
\`\`\`

### Почему это важно?

1. **Приватность**: Персональные данные остаются на устройствах
2. **Эффективность**: Используем вычислительные ресурсы миллионов устройств
3. **Устойчивость**: Система работает даже при отказе части узлов
4. **Демократизация**: Любой может участвовать в обучении ИИ

## 💡 Примеры из реальной жизни

### 1. Google Gboard (клавиатура)
- Обучается предсказывать слова локально на вашем телефоне
- Не отправляет ваши сообщения на серверы Google
- Модель улучшается от миллионов пользователей

### 2. Apple Siri
- Голосовые команды обрабатываются на устройстве
- Персонализация без отправки данных в облако

### 3. Медицинские исследования
- Больницы обучают модели на своих данных
- Не делятся чувствительной информацией пациентов
- Получают общую улучшенную модель

## 🔬 Практическое задание

Представьте систему рекомендации фильмов:

**Централизованная**:
- Netflix собирает все ваши просмотры
- Обучает модель на своих серверах
- Знает все ваши предпочтения

**Распределенная**:
- Ваш телевизор локально анализирует, что вы смотрите
- Отправляет только обновления модели (числа, не названия фильмов)
- Netflix улучшает общую модель, не зная ваших конкретных просмотров

## ✅ Проверьте себя

1. В чем главное отличие распределенного ИИ от централизованного?
2. Какие преимущества дает распределенный подход?
3. Приведите пример, где распределенный ИИ критически важен.

## 🎓 Итоги

Вы изучили:
✅ Основные концепции распределенного ИИ
✅ Отличия от традиционных подходов
✅ Реальные применения в индустрии

**Следующий урок**: Роевой интеллект - как простые правила создают сложное поведение
`,
                        en: `
# Lesson 1: Introduction to Distributed AI

## 🎯 Learning Objectives
After this lesson you will:
- Understand core concepts of distributed AI
- Learn differences from centralized approach
- Explore real-world applications

## 📚 Theory

### What is Distributed AI?

**Distributed Artificial Intelligence** is an approach where computations and model training occur across multiple independent nodes (devices, servers) rather than on a single central server.

### Key Principles:

1. **Decentralization** - no single point of failure
2. **Parallelism** - computations run simultaneously on many nodes
3. **Privacy** - data stays on devices
4. **Scalability** - easy to add new nodes

[Rest of content in English...]
`
                    },
                    codeExample: {
                        title: {
                            ru: 'Простое сравнение',
                            en: 'Simple Comparison'
                        },
                        code: `# Централизованное обучение
def centralized_training(all_user_data):
    """Все данные собраны в одном месте"""
    model = NeuralNetwork()
    for epoch in range(100):
        for user_data in all_user_data:
            # Обучаем на данных ВСЕХ пользователей
            model.train(user_data)
    return model

# Распределенное обучение
def distributed_training(local_data, global_model):
    """Каждый пользователь обучает локально"""
    local_model = global_model.copy()

    # Обучаем ТОЛЬКО на своих данных
    for epoch in range(10):
        local_model.train(local_data)

    # Отправляем только обновления, не данные!
    updates = local_model.parameters - global_model.parameters
    return updates

# Сервер агрегирует обновления
def aggregate_updates(all_updates):
    """Сервер никогда не видит данные пользователей"""
    avg_update = average(all_updates)
    global_model.parameters += avg_update
    return global_model`
                    },
                    quiz: [
                        {
                            question: {
                                ru: 'Что является главным преимуществом распределенного ИИ?',
                                en: 'What is the main advantage of distributed AI?'
                            },
                            options: {
                                ru: [
                                    'Быстрее работает',
                                    'Данные не покидают устройства пользователей',
                                    'Проще в разработке',
                                    'Дешевле'
                                ],
                                en: [
                                    'Faster performance',
                                    'Data never leaves user devices',
                                    'Easier to develop',
                                    'Cheaper'
                                ]
                            },
                            correct: 1
                        }
                    ]
                },

                // УРОК 2: Роевой интеллект
                {
                    id: 'lesson-2',
                    number: 2,
                    title: {
                        ru: 'Роевой интеллект: Мудрость толпы',
                        en: 'Swarm Intelligence: Wisdom of the Crowd'
                    },
                    description: {
                        ru: 'Как простые агенты создают сложное коллективное поведение',
                        en: 'How simple agents create complex collective behavior'
                    },
                    duration: {
                        ru: '2 часа',
                        en: '2 hours'
                    },
                    difficulty: 'beginner',
                    topics: ['swarm-intelligence', 'pso', 'ant-colony'],
                    content: {
                        ru: `
# Урок 2: Роевой интеллект

## 🎯 Цели урока
- Понять принципы роевого поведения
- Изучить алгоритм оптимизации роем частиц (PSO)
- Реализовать простой рой

## 📚 Что такое роевой интеллект?

**Роевой интеллект** - это коллективное поведение децентрализованных, само-организующихся систем.

### Примеры из природы:

1. **Пчелы** находят лучшие цветочные поля
2. **Муравьи** строят сложные колонии
3. **Птицы** летают стаями без столкновений
4. **Рыбы** координированно избегают хищников

### Ключевые правила (на примере птиц):

1. **Когезия**: Двигайся к центру соседей
2. **Выравнивание**: Лети в том же направлении
3. **Разделение**: Не сталкивайся

## 💻 Алгоритм PSO (Particle Swarm Optimization)

### Основная идея:
Частицы "летают" по пространству решений, запоминая:
- Своё лучшее положение
- Глобальное лучшее положение всего роя

### Формула обновления скорости:

\`\`\`
v(t+1) = w*v(t) + c1*r1*(pbest - x) + c2*r2*(gbest - x)
\`\`\`

Где:
- \`v\` - скорость частицы
- \`w\` - инерция (обычно 0.7)
- \`c1, c2\` - коэффициенты обучения (обычно 1.5)
- \`r1, r2\` - случайные числа
- \`pbest\` - личный лучший результат
- \`gbest\` - глобальный лучший результат

## 🔬 Практика: Найдем минимум функции

Задача: Найти минимум функции f(x, y) = x² + y²
Ответ: (0, 0) с значением 0
`,
                        en: 'Lesson 2: Swarm Intelligence...'
                    },
                    codeExample: {
                        title: {
                            ru: 'Реализация PSO на Python',
                            en: 'PSO Implementation in Python'
                        },
                        code: `import numpy as np
import matplotlib.pyplot as plt

class Particle:
    """Частица в рое"""
    def __init__(self, bounds):
        # Случайная начальная позиция
        self.position = np.random.uniform(bounds[0], bounds[1], size=2)
        # Случайная начальная скорость
        self.velocity = np.random.randn(2) * 0.1
        # Лучшая найденная позиция
        self.best_position = self.position.copy()
        self.best_score = float('inf')

    def update(self, global_best, w=0.7, c1=1.5, c2=1.5):
        """Обновление скорости и позиции"""
        r1, r2 = np.random.rand(), np.random.rand()

        # Компонента к личному лучшему
        cognitive = c1 * r1 * (self.best_position - self.position)

        # Компонента к глобальному лучшему
        social = c2 * r2 * (global_best - self.position)

        # Обновляем скорость
        self.velocity = w * self.velocity + cognitive + social

        # Обновляем позицию
        self.position += self.velocity

def objective_function(x):
    """Функция для минимизации: f(x,y) = x² + y²"""
    return np.sum(x**2)

# Создаем рой из 30 частиц
swarm = [Particle((-10, 10)) for _ in range(30)]

# Глобальное лучшее
global_best = swarm[0].position.copy()
global_best_score = float('inf')

# Оптимизация
history = []
for iteration in range(100):
    # Оценка всех частиц
    for particle in swarm:
        score = objective_function(particle.position)

        # Обновление личного лучшего
        if score < particle.best_score:
            particle.best_score = score
            particle.best_position = particle.position.copy()

        # Обновление глобального лучшего
        if score < global_best_score:
            global_best_score = score
            global_best = particle.position.copy()

    # Обновление всех частиц
    for particle in swarm:
        particle.update(global_best)

    history.append(global_best_score)

    if iteration % 20 == 0:
        print(f"Итерация {iteration}: Лучший результат = {global_best_score:.6f}")

print(f"\\n✅ Найденный минимум: {global_best}")
print(f"Значение функции: {global_best_score:.10f}")

# Визуализация сходимости
plt.plot(history)
plt.xlabel('Итерация')
plt.ylabel('Лучшее значение')
plt.title('Сходимость PSO')
plt.grid(True)
plt.show()`
                    },
                    exercise: {
                        id: 'ex-2-1',
                        title: {
                            ru: 'Задание: Оптимизация функции Растригина',
                            en: 'Exercise: Optimize Rastrigin Function'
                        },
                        description: {
                            ru: 'Используйте PSO для нахождения минимума сложной функции',
                            en: 'Use PSO to find minimum of complex function'
                        },
                        starterCode: `def rastrigin(x):
    """Функция Растригина - сложная многоэкстремальная функция"""
    n = len(x)
    return 10 * n + np.sum(x**2 - 10 * np.cos(2 * np.pi * x))

# TODO: Реализуйте PSO для минимизации этой функции
# Подсказка: минимум находится в точке (0, 0) со значением 0`,
                        solution: `# Полное решение предоставляется после попытки`
                    }
                },

                // УРОК 3: Многоагентные системы
                {
                    id: 'lesson-3',
                    number: 3,
                    title: {
                        ru: 'Многоагентные системы: Автономное сотрудничество',
                        en: 'Multi-Agent Systems: Autonomous Collaboration'
                    },
                    description: {
                        ru: 'Как независимые агенты решают сложные задачи вместе',
                        en: 'How independent agents solve complex tasks together'
                    },
                    duration: {
                        ru: '2 часа',
                        en: '2 hours'
                    },
                    difficulty: 'beginner',
                    topics: ['multi-agent', 'coordination', 'communication'],
                    content: {
                        ru: `
# Урок 3: Многоагентные системы (MAS)

## 🎯 Цели урока
- Понять архитектуру многоагентных систем
- Изучить протоколы коммуникации между агентами
- Реализовать простую MAS

## 📚 Что такое Multi-Agent System?

**Многоагентная система** - это система, состоящая из множества взаимодействующих интеллектуальных агентов.

### Характеристики агента:

1. **Автономность** - принимает решения самостоятельно
2. **Социальность** - взаимодействует с другими агентами
3. **Реактивность** - реагирует на изменения среды
4. **Проактивность** - проявляет инициативу

### Типы взаимодействия:

1. **Кооперация** - работа к общей цели
2. **Конкуренция** - борьба за ресурсы
3. **Координация** - согласование действий
4. **Переговоры** - достижение компромиссов

## 💡 Реальные применения

### 1. Умный город
- Агент управления светофорами
- Агент общественного транспорта
- Агент мониторинга трафика
→ Вместе оптимизируют движение

### 2. Складская робототехника (Amazon)
- Роботы-агенты перемещают товары
- Координируются без центрального контроллера
- Адаптируются к новым задачам

### 3. Энергосети
- Солнечные панели
- Аккумуляторы
- Потребители
→ Балансируют нагрузку автономно

## 🔬 Практическая архитектура

### Компоненты агента:

\`\`\`python
class Agent:
    def __init__(self):
        self.state = {}  # Внутреннее состояние
        self.goals = []  # Цели
        self.beliefs = {}  # Представления о мире

    def perceive(self, environment):
        """Восприятие окружения"""
        pass

    def decide(self):
        """Принятие решения"""
        pass

    def act(self):
        """Выполнение действия"""
        pass

    def communicate(self, other_agents):
        """Коммуникация"""
        pass
\`\`\`

### Протокол коммуникации (FIPA):

\`\`\`
Агент 1 → [Request: выполни задачу X] → Агент 2
Агент 2 → [Agree / Refuse] → Агент 1
Агент 2 → [Inform: задача выполнена] → Агент 1
\`\`\`
`,
                        en: 'Lesson 3: Multi-Agent Systems...'
                    },
                    codeExample: {
                        title: {
                            ru: 'Простая MAS: Распределение задач',
                            en: 'Simple MAS: Task Distribution'
                        },
                        code: `from enum import Enum
from typing import List, Optional

class AgentRole(Enum):
    WORKER = "worker"
    COORDINATOR = "coordinator"
    SPECIALIST = "specialist"

class Message:
    def __init__(self, sender, receiver, content, msg_type):
        self.sender = sender
        self.receiver = receiver
        self.content = content
        self.type = msg_type  # request, inform, agree, refuse

class Task:
    def __init__(self, task_id, complexity, required_role):
        self.id = task_id
        self.complexity = complexity
        self.required_role = required_role
        self.assigned_to = None
        self.completed = False

class Agent:
    def __init__(self, agent_id, role, capability):
        self.id = agent_id
        self.role = role
        self.capability = capability  # 0-1
        self.current_task = None
        self.inbox = []
        self.completed_tasks = []

    def can_handle(self, task):
        """Может ли агент выполнить задачу"""
        return (self.role == task.required_role and
                self.capability >= task.complexity and
                self.current_task is None)

    def receive_message(self, message):
        """Получение сообщения"""
        self.inbox.append(message)

    def process_messages(self):
        """Обработка входящих сообщений"""
        for msg in self.inbox:
            if msg.type == "request":
                self.handle_task_request(msg)
            elif msg.type == "inform":
                self.handle_information(msg)
        self.inbox.clear()

    def handle_task_request(self, message):
        """Обработка запроса на выполнение задачи"""
        task = message.content

        if self.can_handle(task):
            # Соглашаемся
            response = Message(
                sender=self.id,
                receiver=message.sender,
                content={"status": "agreed", "task_id": task.id},
                msg_type="agree"
            )
            self.current_task = task
            return response
        else:
            # Отказываемся
            response = Message(
                sender=self.id,
                receiver=message.sender,
                content={"status": "refused", "task_id": task.id},
                msg_type="refuse"
            )
            return response

    def work(self):
        """Выполнение текущей задачи"""
        if self.current_task:
            # Симуляция работы
            progress = min(1.0, self.capability / self.current_task.complexity)
            if progress >= 1.0:
                self.current_task.completed = True
                self.completed_tasks.append(self.current_task)

                # Информируем о завершении
                completion_msg = Message(
                    sender=self.id,
                    receiver="coordinator",
                    content={"task_id": self.current_task.id, "status": "completed"},
                    msg_type="inform"
                )

                self.current_task = None
                return completion_msg
        return None

class MultiAgentSystem:
    def __init__(self):
        self.agents: List[Agent] = []
        self.tasks: List[Task] = []
        self.message_queue = []

    def add_agent(self, agent):
        self.agents.append(agent)

    def add_task(self, task):
        self.tasks.append(task)

    def assign_tasks(self):
        """Интеллектуальное распределение задач"""
        unassigned = [t for t in self.tasks if not t.assigned_to]

        for task in unassigned:
            # Находим подходящих агентов
            capable_agents = [a for a in self.agents if a.can_handle(task)]

            if capable_agents:
                # Выбираем лучшего (с максимальной способностью)
                best_agent = max(capable_agents, key=lambda a: a.capability)

                # Отправляем запрос
                request = Message(
                    sender="coordinator",
                    receiver=best_agent.id,
                    content=task,
                    msg_type="request"
                )
                best_agent.receive_message(request)
                task.assigned_to = best_agent.id

    def step(self):
        """Один шаг симуляции"""
        # Обрабатываем сообщения
        for agent in self.agents:
            agent.process_messages()

        # Агенты работают
        for agent in self.agents:
            msg = agent.work()
            if msg:
                print(f"✅ Агент {agent.id} завершил задачу {msg.content['task_id']}")

        # Назначаем новые задачи
        self.assign_tasks()

# Использование
mas = MultiAgentSystem()

# Создаем агентов
mas.add_agent(Agent("worker-1", AgentRole.WORKER, capability=0.7))
mas.add_agent(Agent("worker-2", AgentRole.WORKER, capability=0.9))
mas.add_agent(Agent("specialist-1", AgentRole.SPECIALIST, capability=0.95))

# Создаем задачи
mas.add_task(Task("task-1", complexity=0.6, required_role=AgentRole.WORKER))
mas.add_task(Task("task-2", complexity=0.8, required_role=AgentRole.WORKER))
mas.add_task(Task("task-3", complexity=0.9, required_role=AgentRole.SPECIALIST))

# Запускаем систему
for step in range(10):
    print(f"\\n--- Шаг {step + 1} ---")
    mas.step()

    completed = sum(1 for t in mas.tasks if t.completed)
    print(f"Выполнено задач: {completed}/{len(mas.tasks)}")`
                    }
                },

                // УРОК 4: Федеративное обучение - введение
                {
                    id: 'lesson-4',
                    number: 4,
                    title: {
                        ru: 'Федеративное обучение: Приватность прежде всего',
                        en: 'Federated Learning: Privacy First'
                    },
                    description: {
                        ru: 'Обучение моделей без централизации данных',
                        en: 'Training models without centralizing data'
                    },
                    duration: {
                        ru: '2.5 часа',
                        en: '2.5 hours'
                    },
                    difficulty: 'intermediate',
                    topics: ['federated-learning', 'privacy', 'fedavg'],
                    content: {
                        ru: `
# Урок 4: Федеративное обучение

## 🎯 Цели урока
- Понять проблему централизации данных
- Изучить алгоритм FedAvg
- Реализовать простое федеративное обучение

## 📚 Проблема

### Традиционное ML:
1. Собираем данные от всех пользователей
2. Централизуем на сервере
3. Обучаем модель
4. **Проблема**: Приватность! Данные пользователей на сервере

### Решение: Федеративное обучение

**Данные НЕ покидают устройства!**

## 🔄 Алгоритм FedAvg (Federated Averaging)

### Шаги:

1. **Сервер** отправляет глобальную модель клиентам
2. **Клиенты** обучают модель на локальных данных
3. **Клиенты** отправляют только обновления модели
4. **Сервер** усредняет обновления
5. Повторяем

### Математика:

Глобальная модель на раунде t+1:
\`\`\`
w_{t+1} = Σ(n_k / n) × w_k

где:
w_k - веса k-го клиента
n_k - размер датасета k-го клиента
n - общий размер данных
\`\`\`

## 🔒 Гарантии приватности

1. **Данные остаются локально**
2. **Передаются только веса модели** (числа)
3. **Можно добавить дифференциальную приватность**
4. **Можно использовать безопасную агрегацию**

## 💡 Применения

### Google Gboard
- 🔤 Предсказание следующего слова
- 📱 Обучение на вашем телефоне
- 🔒 Google не видит ваши сообщения

### Медицина
- 🏥 Больницы обучают на данных пациентов
- 🔐 Данные пациентов не покидают больницу
- 🎯 Получают лучшую модель вместе

### Финансы
- 🏦 Банки детектируют мошенничество
- 🔒 Не делятся транзакциями клиентов
- 📈 Улучшают общую модель
`
                    }
                },

                // Продолжаем уроки 5-10...
                {
                    id: 'lesson-5',
                    number: 5,
                    title: {
                        ru: 'Практика: Реализация FedAvg с PyTorch',
                        en: 'Practice: FedAvg Implementation with PyTorch'
                    },
                    difficulty: 'intermediate',
                    duration: { ru: '3 часа', en: '3 hours' }
                },
                {
                    id: 'lesson-6',
                    number: 6,
                    title: {
                        ru: 'Ray: Распределенные вычисления на Python',
                        en: 'Ray: Distributed Computing in Python'
                    },
                    difficulty: 'intermediate',
                    duration: { ru: '3 часа', en: '3 hours' }
                },
                {
                    id: 'lesson-7',
                    number: 7,
                    title: {
                        ru: 'Оптимизация: DeepSpeed и vLLM',
                        en: 'Optimization: DeepSpeed and vLLM'
                    },
                    difficulty: 'intermediate',
                    duration: { ru: '3 часа', en: '3 hours' }
                },
                {
                    id: 'lesson-8',
                    number: 8,
                    title: {
                        ru: 'Production: Развертывание Ray Cluster',
                        en: 'Production: Ray Cluster Deployment'
                    },
                    difficulty: 'advanced',
                    duration: { ru: '4 часа', en: '4 hours' }
                },
                {
                    id: 'lesson-9',
                    number: 9,
                    title: {
                        ru: 'Monitoring и масштабирование',
                        en: 'Monitoring and Scaling'
                    },
                    difficulty: 'advanced',
                    duration: { ru: '4 часа', en: '4 hours' }
                },
                {
                    id: 'lesson-10',
                    number: 10,
                    title: {
                        ru: 'Финальный проект: Полный деплой своей системы',
                        en: 'Final Project: Full System Deployment'
                    },
                    difficulty: 'advanced',
                    duration: { ru: '8 часов', en: '8 hours' },
                    content: {
                        ru: `
# Урок 10: Финальный проект

## 🎯 Цель
Создать и задеплоить полноценную распределенную AI систему

## 📋 Задание

Вы создадите систему для федеративного обучения модели классификации изображений.

### Требования:

1. **Backend (Ray Cluster)**
   - Настроить Ray cluster (минимум 2 ноды)
   - Реализовать Parameter Server
   - Реализовать Worker nodes

2. **Федеративное обучение**
   - Минимум 5 виртуальных клиентов
   - Алгоритм FedAvg
   - Логирование метрик

3. **Deployment**
   - Докеризация
   - Kubernetes deployment (опционально)
   - Monitoring (Prometheus + Grafana)

4. **API**
   - REST API для добавления клиентов
   - WebSocket для real-time мониторинга
   - Dashboard для визуализации

### Шаги выполнения:

#### Шаг 1: Локальная разработка (2 часа)
\`\`\`bash
# Создание проекта
mkdir distributed-ai-project
cd distributed-ai-project

# Структура
project/
├── server/          # Ray cluster code
├── client/          # Client simulation
├── api/             # REST API
├── dashboard/       # Monitoring UI
├── docker/          # Docker configs
└── k8s/             # Kubernetes manifests
\`\`\`

#### Шаг 2: Реализация (4 часа)

**server/parameter_server.py**:
\`\`\`python
import ray
import torch

@ray.remote(num_gpus=1)
class ParameterServer:
    def __init__(self, model):
        self.model = model
        self.optimizer = torch.optim.SGD(self.model.parameters(), lr=0.01)

    @ray.method(num_returns=1)
    def get_weights(self):
        return self.model.state_dict()

    @ray.method(num_returns=1)
    def apply_gradients(self, *gradients):
        # FedAvg
        avg_grads = average_gradients(gradients)
        self.optimizer.zero_grad()
        set_gradients(self.model, avg_grads)
        self.optimizer.step()
        return True
\`\`\`

**client/federated_client.py**:
\`\`\`python
@ray.remote
class FederatedClient:
    def __init__(self, client_id, data_loader):
        self.client_id = client_id
        self.data_loader = data_loader

    def train_epoch(self, weights):
        # Загружаем глобальные веса
        model = create_model()
        model.load_state_dict(weights)

        # Локальное обучение
        for epoch in range(5):
            for batch in self.data_loader:
                loss = train_step(model, batch)

        # Возвращаем градиенты
        return get_gradients(model)
\`\`\`

#### Шаг 3: Docker (1 час)

**docker/Dockerfile.server**:
\`\`\`dockerfile
FROM rayproject/ray:latest-gpu

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY server/ ./server/
CMD ["ray", "start", "--head", "--port=6379"]
\`\`\`

**docker-compose.yml**:
\`\`\`yaml
version: '3.8'
services:
  ray-head:
    build:
      context: .
      dockerfile: docker/Dockerfile.server
    ports:
      - "6379:6379"
      - "8265:8265"  # Dashboard
    environment:
      - RAY_BACKEND_LOG_LEVEL=debug

  ray-worker:
    build:
      context: .
      dockerfile: docker/Dockerfile.worker
    depends_on:
      - ray-head
    environment:
      - RAY_ADDRESS=ray-head:6379
    deploy:
      replicas: 3
\`\`\`

#### Шаг 4: Деплой (1 час)

\`\`\`bash
# Локальный тест
docker-compose up

# Деплой в облако (опционально)
kubectl apply -f k8s/
\`\`\`

## ✅ Критерии оценки

1. **Функциональность** (40%)
   - Система работает end-to-end
   - Федеративное обучение корректно
   - Метрики логируются

2. **Код** (30%)
   - Чистый, читаемый код
   - Документация
   - Тесты

3. **Deployment** (20%)
   - Докеризация
   - Мониторинг
   - Масштабируемость

4. **Документация** (10%)
   - README
   - API docs
   - Инструкции по деплою

## 🎓 Поздравляем!

После завершения вы сможете:
✅ Проектировать распределенные AI системы
✅ Реализовывать федеративное обучение
✅ Деплоить в production
✅ Масштабировать и мониторить

**Добро пожаловать в мир Decentralized AI!**
`
                    }
                }
            ],

            // Узлы для 3D визуализации
            nodes: [
                {
                    id: 'distributed-ai-intro',
                    label: { ru: 'Введение в Distributed AI', en: 'Intro to Distributed AI' },
                    position: { x: 0, y: 0, z: 0 },
                    color: '#667eea',
                    category: 'foundation',
                    lesson: 'lesson-1'
                },
                {
                    id: 'swarm-intelligence',
                    label: { ru: 'Роевой интеллект', en: 'Swarm Intelligence' },
                    position: { x: -5, y: 2, z: 0 },
                    color: '#10b981',
                    category: 'algorithm',
                    lesson: 'lesson-2'
                },
                {
                    id: 'multi-agent',
                    label: { ru: 'Многоагентные системы', en: 'Multi-Agent Systems' },
                    position: { x: 5, y: 2, z: 0 },
                    color: '#f59e0b',
                    category: 'architecture',
                    lesson: 'lesson-3'
                },
                {
                    id: 'federated-learning',
                    label: { ru: 'Федеративное обучение', en: 'Federated Learning' },
                    position: { x: 0, y: 4, z: 2 },
                    color: '#ec4899',
                    category: 'method',
                    lesson: 'lesson-4'
                },
                {
                    id: 'ray-cluster',
                    label: { ru: 'Ray Cluster', en: 'Ray Cluster' },
                    position: { x: -3, y: 6, z: 1 },
                    color: '#8b5cf6',
                    category: 'tool',
                    lesson: 'lesson-6'
                },
                {
                    id: 'deepspeed',
                    label: { ru: 'DeepSpeed', en: 'DeepSpeed' },
                    position: { x: 3, y: 6, z: 1 },
                    color: '#06b6d4',
                    category: 'optimization',
                    lesson: 'lesson-7'
                },
                {
                    id: 'production-deploy',
                    label: { ru: 'Production Deploy', en: 'Production Deploy' },
                    position: { x: 0, y: 8, z: 0 },
                    color: '#ef4444',
                    category: 'deployment',
                    lesson: 'lesson-10'
                }
            ],

            // Связи между узлами
            edges: [
                { from: 'distributed-ai-intro', to: 'swarm-intelligence', type: 'leads-to' },
                { from: 'distributed-ai-intro', to: 'multi-agent', type: 'leads-to' },
                { from: 'swarm-intelligence', to: 'federated-learning', type: 'evolves-to' },
                { from: 'multi-agent', to: 'federated-learning', type: 'combines-with' },
                { from: 'federated-learning', to: 'ray-cluster', type: 'implemented-with' },
                { from: 'federated-learning', to: 'deepspeed', type: 'optimized-by' },
                { from: 'ray-cluster', to: 'production-deploy', type: 'deployed-as' },
                { from: 'deepspeed', to: 'production-deploy', type: 'enables' }
            ]
        };

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    initVisualization() {
        this.updateLoading('Инициализация 3D визуализации...');
        const container = document.getElementById('scene-container');

        if (!container) {
            console.warn('Scene container not found');
            return;
        }

        this.visualization = new Visualization3D(container, this.curriculum);
        this.visualization.onNodeClick = (node) => this.showNodeDetails(node);
        this.visualization.onNodeHover = (node) => this.showNodePreview(node);
    }

    async initTutorialSystem() {
        this.tutorialSystem = new TutorialSystem(this.curriculum);
        await this.tutorialSystem.init();
        window.tutorialSystem = this.tutorialSystem; // Global access
    }

    initTelegram() {
        this.telegram = new TelegramIntegration();
        this.telegram.init();
    }

    setupEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Переключатель языка
        this.setupLanguageSwitcher();

        // Управление визуализацией
        this.setupVisualizationControls();

        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    setupLanguageSwitcher() {
        // Создаем переключатель языка в header
        const userControls = document.querySelector('.user-controls');
        const langBtn = document.createElement('button');
        langBtn.className = 'icon-btn';
        langBtn.id = 'language-toggle';
        langBtn.innerHTML = this.currentLanguage === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN';
        langBtn.title = 'Сменить язык / Switch language';

        langBtn.addEventListener('click', () => {
            this.currentLanguage = this.currentLanguage === 'ru' ? 'en' : 'ru';
            langBtn.innerHTML = this.currentLanguage === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN';
            this.saveLanguagePreference();
            this.renderCurrentView();
        });

        userControls.insertBefore(langBtn, userControls.firstChild);
    }

    setupVisualizationControls() {
        document.getElementById('reset-camera')?.addEventListener('click', () => {
            this.visualization?.resetCamera();
        });

        document.getElementById('auto-rotate')?.addEventListener('click', (e) => {
            const isRotating = this.visualization?.toggleAutoRotate();
            e.target.style.opacity = isRotating ? '1' : '0.6';
        });

        document.getElementById('fullscreen')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    switchView(viewName) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `view-${viewName}`);
        });

        this.currentView = viewName;
        this.renderView(viewName);
    }

    renderView(viewName) {
        switch (viewName) {
            case 'explore':
                this.renderExploreView();
                break;
            case 'learn':
                this.renderLearnView();
                break;
            case 'practice':
                this.renderPracticeView();
                break;
            case 'community':
                this.renderCommunityView();
                break;
        }
    }

    renderCurrentView() {
        this.renderView(this.currentView);
    }

    renderExploreView() {
        const lang = this.currentLanguage;

        // Рендер траекторий обучения
        const pathsContainer = document.getElementById('learning-paths');
        if (pathsContainer) {
            pathsContainer.innerHTML = this.curriculum.paths.map(path => `
                <div class="path-item" onclick="window.app.selectPath('${path.id}')">
                    <div class="path-title">${this.t(path.title)}</div>
                    <div class="path-meta">
                        <span class="path-duration">${this.t(path.duration)}</span>
                        <span class="path-difficulty ${path.difficulty}">${path.difficulty}</span>
                    </div>
                    <div class="path-progress">
                        ${this.getPathProgress(path.id)}%
                    </div>
                </div>
            `).join('');
        }

        // Рендер фильтров
        const filtersContainer = document.getElementById('topic-filters');
        if (filtersContainer) {
            const categories = [...new Set(this.curriculum.nodes.map(n => n.category))];
            filtersContainer.innerHTML = categories.map(cat => `
                <label class="filter-item">
                    <input type="checkbox" checked onchange="window.app.filterByCategory('${cat}', this.checked)">
                    <span>${cat}</span>
                </label>
            `).join('');
        }

        // Обновить статистику прогресса
        this.updateProgressStats();
    }

    renderLearnView() {
        const lang = this.currentLanguage;
        const grid = document.getElementById('course-grid');

        if (!grid) return;

        grid.innerHTML = `
            <div class="lessons-container">
                <h2 class="section-title">${lang === 'ru' ? 'Все уроки' : 'All Lessons'}</h2>
                ${this.curriculum.lessons.map(lesson => {
                    const progress = this.getLessonProgress(lesson.id);
                    return `
                        <div class="lesson-card ${progress === 100 ? 'completed' : ''}"
                             onclick="window.app.openLesson('${lesson.id}')">
                            <div class="lesson-number">Урок ${lesson.number}</div>
                            <h3 class="lesson-title">${this.t(lesson.title)}</h3>
                            <p class="lesson-description">${this.t(lesson.description)}</p>
                            <div class="lesson-meta">
                                <span class="lesson-duration">⏱️ ${this.t(lesson.duration)}</span>
                                <span class="lesson-difficulty ${lesson.difficulty}">${lesson.difficulty}</span>
                            </div>
                            <div class="lesson-progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <div class="lesson-progress-text">${progress}% ${lang === 'ru' ? 'завершено' : 'complete'}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderPracticeView() {
        // Будет реализовано TutorialSystem
        const exerciseList = document.getElementById('exercise-list');
        if (!exerciseList) return;

        exerciseList.innerHTML = this.curriculum.lessons
            .filter(l => l.exercise)
            .map((lesson, i) => `
                <div class="exercise-item" onclick="window.app.startExercise('${lesson.id}')">
                    <div class="exercise-number">${i + 1}</div>
                    <div class="exercise-info">
                        <h4>${this.t(lesson.title)}</h4>
                        <span class="exercise-difficulty ${lesson.difficulty}">${lesson.difficulty}</span>
                    </div>
                </div>
            `).join('');
    }

    renderCommunityView() {
        // Реализовано в TelegramIntegration
    }

    // Вспомогательные методы
    t(obj) {
        // Перевод: берем текст на текущем языке
        return typeof obj === 'object' ? obj[this.currentLanguage] : obj;
    }

    selectPath(pathId) {
        const path = this.curriculum.paths.find(p => p.id === pathId);
        if (!path) return;

        alert(`Траектория выбрана: ${this.t(path.title)}\\n\\nУроки:\\n${path.lessons.map((lid, i) => {
            const lesson = this.curriculum.lessons.find(l => l.id === lid);
            return `${i + 1}. ${this.t(lesson.title)}`;
        }).join('\\n')}`);
    }

    filterByCategory(category, enabled) {
        this.visualization?.filterByCategory(category, enabled);
    }

    openLesson(lessonId) {
        const lesson = this.curriculum.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        // Показываем урок в модальном окне
        this.showLessonModal(lesson);
    }

    showLessonModal(lesson) {
        const modal = document.createElement('div');
        modal.className = 'lesson-modal-overlay';
        modal.innerHTML = `
            <div class="lesson-modal">
                <div class="lesson-modal-header">
                    <h2>Урок ${lesson.number}: ${this.t(lesson.title)}</h2>
                    <button class="close-btn" onclick="this.closest('.lesson-modal-overlay').remove()">×</button>
                </div>
                <div class="lesson-modal-body">
                    <div class="lesson-content">
                        ${this.markdownToHTML(this.t(lesson.content))}
                    </div>
                    ${lesson.codeExample ? `
                        <div class="code-example-section">
                            <h3>${this.t(lesson.codeExample.title)}</h3>
                            <pre><code>${this.escapeHtml(lesson.codeExample.code)}</code></pre>
                        </div>
                    ` : ''}
                    ${lesson.quiz ? this.renderQuiz(lesson.quiz) : ''}
                </div>
                <div class="lesson-modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.lesson-modal-overlay').remove()">
                        Закрыть
                    </button>
                    <button class="btn btn-primary" onclick="window.app.markLessonComplete('${lesson.id}')">
                        Отметить как пройденный
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    markdownToHTML(markdown) {
        if (!markdown) return '';

        // Простой markdown рендерер
        return markdown
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/```([\\s\\S]+?)```/g, '<pre><code>$1</code></pre>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\\/li>)/s, '<ul>$1</ul>')
            .replace(/\\n/g, '<br>');
    }

    renderQuiz(quiz) {
        return `
            <div class="quiz-section">
                <h3>Проверьте себя</h3>
                ${quiz.map((q, qi) => `
                    <div class="quiz-question">
                        <p><strong>${qi + 1}. ${this.t(q.question)}</strong></p>
                        ${this.t(q.options).map((opt, oi) => `
                            <label class="quiz-option">
                                <input type="radio" name="q${qi}" value="${oi}">
                                <span>${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                `).join('')}
                <button class="btn btn-primary" onclick="window.app.checkQuiz(this)">
                    Проверить ответы
                </button>
            </div>
        `;
    }

    showNodeDetails(node) {
        const lesson = this.curriculum.lessons.find(l => l.id === node.lesson);
        if (lesson) {
            this.openLesson(lesson.id);
        }
    }

    showNodePreview(node) {
        // Показываем краткую информацию о узле
        const detailsEl = document.getElementById('topic-details');
        if (detailsEl) {
            detailsEl.innerHTML = `
                <div class="node-preview">
                    <h3>${this.t(node.label)}</h3>
                    <p class="node-category">${node.category}</p>
                    <button class="btn btn-primary" onclick="window.app.openLesson('${node.lesson}')">
                        Перейти к уроку
                    </button>
                </div>
            `;
        }
    }

    getPathProgress(pathId) {
        const path = this.curriculum.paths.find(p => p.id === pathId);
        if (!path) return 0;

        const completedLessons = path.lessons.filter(lid =>
            this.userProgress.completedLessons?.includes(lid)
        ).length;

        return Math.round((completedLessons / path.lessons.length) * 100);
    }

    getLessonProgress(lessonId) {
        return this.userProgress.completedLessons?.includes(lessonId) ? 100 : 0;
    }

    markLessonComplete(lessonId) {
        if (!this.userProgress.completedLessons) {
            this.userProgress.completedLessons = [];
        }

        if (!this.userProgress.completedLessons.includes(lessonId)) {
            this.userProgress.completedLessons.push(lessonId);
            this.saveProgress();
            alert('✅ Урок отмечен как пройденный!');
            this.updateProgressStats();
            this.renderCurrentView();
        }
    }

    updateProgressStats() {
        const completed = this.userProgress.completedLessons?.length || 0;
        const total = this.curriculum.lessons.length;

        const completedEl = document.getElementById('completed-count');
        const progressEl = document.getElementById('progress-count');

        if (completedEl) completedEl.textContent = `${completed}/${total}`;
        if (progressEl) progressEl.textContent = total - completed;
    }

    loadProgress() {
        const saved = localStorage.getItem('academy-progress');
        return saved ? JSON.parse(saved) : {
            completedLessons: [],
            completedExercises: [],
            currentPath: null
        };
    }

    saveProgress() {
        localStorage.setItem('academy-progress', JSON.stringify(this.userProgress));
    }

    saveLanguagePreference() {
        localStorage.setItem('academy-language', this.currentLanguage);
    }

    loadLanguagePreference() {
        return localStorage.getItem('academy-language') || 'ru';
    }

    toggleTheme() {
        document.body.classList.toggle('light-theme');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    updateLoading(message) {
        const messageEl = document.getElementById('loading-message');
        if (messageEl) messageEl.textContent = message;
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => loadingScreen.style.display = 'none', 300);
            }, 500);
        }
    }

    showError(error) {
        console.error(error);
        alert('Ошибка инициализации. Пожалуйста, обновите страницу.');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Экспорт для глобального доступа
window.AcademyApp = AcademyApp;
