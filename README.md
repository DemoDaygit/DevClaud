# 🧠 Swarm AI - Enterprise Knowledge Graph & Educational Platform

> **Полнофункциональная платформа для изучения и визуализации концепций Swarm AI и Federated Learning с использованием передовых образовательных методологий и технологий графовых баз данных**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Neo4j](https://img.shields.io/badge/neo4j-5.15-blue.svg)](https://neo4j.com/)
[![React](https://img.shields.io/badge/react-18-61dafb.svg)](https://reactjs.org/)

## 📖 О проекте

**DevClaud** — это инновационная платформа, объединяющая:

1. 🗂️ **Knowledge Graph** — визуализация связей между концепциями роевого интеллекта
2. 🎓 **Educational System** — система обучения с геймификацией и адаптивными методиками
3. 🔬 **Analytics Engine** — анализ графов знаний с использованием PageRank, Community Detection и других алгоритмов

### ✨ Ключевые возможности

#### 🗺️ Knowledge Graph (v4.0)
- **Neo4j Graph Database** — профессиональная графовая СУБД
- **Cytoscape.js визуализация** — интерактивный граф с 10,000+ узлов
- **Граф-аналитика** — PageRank, Betweenness Centrality, Community Detection (Louvain)
- **Экспорт данных** — GraphML, Cypher, JSON, CSV, GEXF
- **REST API** — полноценный backend на Node.js + Express

#### 🎓 Educational Learning System
- **Spaced Repetition** — система интервального повторения (Leitner Algorithm)
- **Bloom's Taxonomy** — 6-уровневая структура обучения
- **Gamification** — XP, уровни, достижения, таблица лидеров
- **Adaptive Learning** — персонализированные рекомендации
- **4 Learning Paths** — структурированные траектории обучения
- **Multiple Module Types**:
  - 📇 Flashcards — карточки для запоминания
  - 📝 Quizzes — интерактивные тесты
  - 💻 Coding Exercises — задачи по программированию
  - 🚀 Projects — практические проекты

## 🚀 Быстрый старт

### Вариант 1: Docker Compose (Рекомендуется)

```bash
# Клонируйте репозиторий
git clone https://github.com/DemoDaygit/DevClaud.git
cd DevClaud

# Запустите все сервисы одной командой
docker-compose up -d

# Подождите 30 секунд и откройте браузер
```

**Доступ к приложению:**
- 🌐 **Frontend**: http://localhost:8080
- 🔧 **API**: http://localhost:3000/api
- 🗄️ **Neo4j Browser**: http://localhost:7474 (neo4j / swarm_ai_2025)

### Вариант 2: Локальная разработка

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (в другом терминале)
cd frontend
npm install
npm run dev
```

### Первоначальная настройка

Заполните базу данных начальными данными:

```bash
# Через API
curl -X POST http://localhost:3000/api/graph/seed

# Или нажмите кнопку "Seed Database" в интерфейсе
```

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │  Knowledge Graph UI  │  │  Learning Dashboard  │         │
│  │  - Cytoscape.js      │  │  - Flashcards        │         │
│  │  - Graph Analytics   │  │  - Quizzes           │         │
│  │  - Export/Import     │  │  - Exercises         │         │
│  └──────────────────────┘  └──────────────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    BACKEND API LAYER                         │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐          │
│  │ Graph API  │  │ Analytics  │  │ Learning API │          │
│  │ /api/graph │  │ /api/analytics│ /api/learning│          │
│  └────────────┘  └────────────┘  └──────────────┘          │
│                 Node.js + Express                            │
├─────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                │
│  ┌──────────────────────────────────────────────┐           │
│  │          Neo4j Graph Database 5.15            │           │
│  │  - Knowledge Graph Storage                    │           │
│  │  - Cypher Query Language                      │           │
│  │  - GDS (Graph Data Science) Library           │           │
│  │  - APOC Procedures                            │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 📚 Документация

### Основная документация
- [README-ENTERPRISE.md](README-ENTERPRISE.md) — детальная документация по Knowledge Graph
- [QUICKSTART.md](QUICKSTART.md) — быстрый старт и troubleshooting

### Образовательная система
- [docs/EDUCATIONAL_ARCHITECTURE.md](docs/EDUCATIONAL_ARCHITECTURE.md) — архитектура обучающей системы
- [docs/LEARNING_MODULES.md](docs/LEARNING_MODULES.md) — спецификация модулей обучения
- [docs/EDUCATIONAL_SUMMARY.md](docs/EDUCATIONAL_SUMMARY.md) — резюме образовательной системы

## 🔌 API Endpoints

### Knowledge Graph API

```bash
# Получить весь граф
GET /api/graph

# Поиск узлов
GET /api/graph/search?q=federated

# Создать узел
POST /api/graph/nodes

# Аналитика графа
GET /api/analytics/pagerank
GET /api/analytics/centrality
GET /api/analytics/communities

# Экспорт
GET /api/export/graphml
GET /api/export/cypher
```

### Learning API

```bash
# Прогресс пользователя
GET /api/learning/progress/:userId

# Карточки для повторения
GET /api/learning/flashcards/:userId/due

# Отправить ответ на карточку
POST /api/learning/flashcards/:userId/review

# Квизы
GET /api/learning/quiz/:quizId
POST /api/learning/quiz/:quizId/submit

# Упражнения
POST /api/learning/exercise/:userId/submit

# Траектории обучения
GET /api/learning/paths
POST /api/learning/paths/:pathId/enroll

# Таблица лидеров
GET /api/learning/leaderboard
```

## 🛠️ Технологический стек

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: Neo4j 5.15 Community
- **Graph Processing**: Graphology
- **WebSocket**: ws
- **Export**: Papa Parse, GraphML builder

### Frontend
- **Framework**: React 18
- **Bundler**: Vite
- **Graph Visualization**: Cytoscape.js
- **HTTP Client**: Axios
- **Styling**: Custom CSS (Dark Theme)

### DevOps
- **Containerization**: Docker + Docker Compose
- **Process Management**: PM2
- **Reverse Proxy**: Nginx (опционально)

## 📊 Features

### Knowledge Graph Features

| Функция | Описание | Статус |
|---------|----------|--------|
| Neo4j Integration | Профессиональная графовая БД | ✅ |
| Interactive Visualization | Cytoscape.js с 10,000+ узлов | ✅ |
| PageRank | Алгоритм ранжирования узлов | ✅ |
| Community Detection | Алгоритм Louvain | ✅ |
| Centrality Metrics | Degree, Betweenness, Closeness | ✅ |
| Export Formats | GraphML, Cypher, JSON, CSV, GEXF | ✅ |
| Real-time Updates | WebSocket поддержка | ✅ |
| Search & Filters | Полнотекстовый поиск | ✅ |

### Educational System Features

| Функция | Описание | Статус |
|---------|----------|--------|
| Spaced Repetition | Leitner Algorithm (5 boxes) | ✅ |
| Flashcards | Интервальное повторение | ✅ |
| Quizzes | Множественный выбор, True/False, Fill-in-blank | ✅ |
| Coding Exercises | Проверка кода с test cases | ✅ |
| Gamification | XP, Levels, Badges, Streaks | ✅ |
| Leaderboard | Weekly, Monthly, All-time | ✅ |
| Learning Paths | 4 структурированные траектории | ✅ |
| Adaptive Learning | Персонализированные рекомендации | ✅ |
| Progress Tracking | Детальная аналитика прогресса | ✅ |
| Bloom's Taxonomy | 6-уровневая структура обучения | ✅ |

## 🎯 Learning Paths

### 1. 🎓 Fundamentals Path
**Уровень**: Beginner
**Длительность**: 2-3 недели
**Модули**: 6
**XP награда**: 500

Основы машинного обучения, нейросетей и распределенных систем.

### 2. 🔄 Federated Learning Path
**Уровень**: Intermediate
**Длительность**: 3-4 недели
**Модули**: 8
**XP награда**: 800

FedAvg, FedProx, дифференциальная приватность, агрегация моделей.

### 3. 🗜️ Compression & Optimization Path
**Уровень**: Intermediate
**Длительность**: 2-3 недели
**Модули**: 6
**XP награда**: 700

Gradient compression, квантизация, Top-K sparsification.

### 4. 🚀 Advanced Topics Path
**Уровень**: Advanced
**Длительность**: 4-5 недель
**Модули**: 10
**XP награда**: 1000

Byzantine-robust FL, Async FL, Multi-task Learning, Research frontiers.

## 📈 Roadmap

### Ближайшие планы (Q1 2025)
- [ ] Monaco Editor интеграция для coding exercises
- [ ] Jupyter Notebook поддержка
- [ ] Real-time collaboration features
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered hints система

### Долгосрочные цели (2025)
- [ ] Multi-language support (EN, RU, CN)
- [ ] Video lessons integration
- [ ] Community features (forums, peer review)
- [ ] Certificate generation
- [ ] Enterprise SSO integration
- [ ] Custom learning path builder

## 🤝 Вклад в проект

Мы приветствуем вклад в проект! Пожалуйста:

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

### Стиль кода
- ESLint для JavaScript/React
- Prettier для форматирования
- Conventional Commits для сообщений коммитов

## 📝 Лицензия

Этот проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).

## 👨‍💻 Автор

**DemoDaygit**

- GitHub: [@DemoDaygit](https://github.com/DemoDaygit)
- Project: [DevClaud](https://github.com/DemoDaygit/DevClaud)

## 🙏 Благодарности

Проект создан с использованием передовых технологий и методологий:

### Технологии
- [Neo4j](https://neo4j.com/) — графовая база данных
- [Cytoscape.js](https://js.cytoscape.org/) — визуализация графов
- [React](https://reactjs.org/) — UI библиотека
- [Express](https://expressjs.com/) — backend framework

### Образовательные методологии
- **Bloom's Taxonomy** (Benjamin Bloom, 1956)
- **Spaced Repetition** (Hermann Ebbinghaus, 1885)
- **Leitner System** (Sebastian Leitner, 1972)
- **Cognitive Load Theory** (John Sweller, 1988)
- **Flow Theory** (Mihaly Csikszentmihalyi, 1990)

## 📞 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [QUICKSTART.md](QUICKSTART.md) для решения типичных проблем
2. Откройте [Issue](https://github.com/DemoDaygit/DevClaud/issues) на GitHub
3. Посмотрите [существующие Issues](https://github.com/DemoDaygit/DevClaud/issues)

---

<div align="center">

**⭐ Если проект был полезен, поставьте звездочку на GitHub! ⭐**

Made with ❤️ using AI

</div>
