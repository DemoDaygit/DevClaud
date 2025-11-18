# 🚀 Quick Start Guide - Swarm AI Knowledge Graph v4.0

## 📦 Один команда - запустить всё

```bash
docker-compose up -d
```

Подождите 30 секунд, затем откройте:

- **Frontend**: http://localhost:8080
- **API**: http://localhost:3000/api
- **Neo4j**: http://localhost:7474

## 🎯 Первые шаги

### 1. Заполните базу данных

В браузере откройте http://localhost:8080 и нажмите кнопку:

```
[Seed Database]
```

Или через API:

```bash
curl -X POST http://localhost:3000/api/graph/seed
```

### 2. Исследуйте граф

- **Поиск**: Введите текст в поле поиска
- **Фильтр**: Выберите категории и типы связей
- **Временная шкала**: Двигайте слайдер для фильтрации по годам
- **Layout**: Выберите алгоритм размещения узлов

### 3. Используйте аналитику

На правой панели:

- **PageRank**: Нажмите "Calculate PageRank"
- **Centrality**: Выберите тип и нажмите "Calculate"
- **Communities**: Нажмите "Detect Communities"
- **Shortest Path**: Введите ID узлов и нажмите "Find Shortest Path"

### 4. Экспортируйте данные

Нажмите кнопку **Export** и выберите формат:

- JSON
- GraphML (Gephi, yEd)
- Cypher (Neo4j)
- CSV
- GEXF

## 🛠️ Полезные команды

### Docker

```bash
# Запустить
docker-compose up -d

# Остановить
docker-compose down

# Посмотреть логи
docker-compose logs -f

# Перезапустить
docker-compose restart

# Остановить и удалить volumes
docker-compose down -v
```

### API

```bash
# Получить все узлы
curl http://localhost:3000/api/graph/nodes

# Поиск
curl http://localhost:3000/api/graph/search?q=federated

# PageRank
curl http://localhost:3000/api/analytics/pagerank?limit=10

# Статистика
curl http://localhost:3000/api/analytics/statistics

# Экспорт в JSON
curl http://localhost:3000/api/export/json > graph.json
```

## 🎓 Следующие шаги

1. Прочитайте полную документацию: `README-ENTERPRISE.md`
2. Изучите API endpoints
3. Попробуйте создать свои узлы и связи
4. Экспортируйте граф в Gephi для визуального анализа

## ❓ Проблемы?

### Backend не запускается

```bash
# Проверьте логи
docker-compose logs backend

# Перезапустите
docker-compose restart backend
```

### Neo4j не подключается

```bash
# Проверьте статус
docker-compose ps

# Подождите 30 секунд после запуска
# Neo4j требует время на инициализацию
```

### Frontend не загружается

```bash
# Проверьте логи
docker-compose logs frontend

# Очистите кеш браузера
# Ctrl+Shift+R (Chrome) или Cmd+Shift+R (Mac)
```

## 📚 Дополнительные ресурсы

- **Neo4j Browser**: http://localhost:7474
  - Username: `neo4j`
  - Password: `swarm_ai_2025`

- **API Documentation**: http://localhost:3000/api

- **GitHub**: https://github.com/DemoDaygit/DevClaud

---

**Успехов в работе с графом знаний!** 🎉
