# API Documentation - Knowledge Graph v3.0

## GraphState Class

Основной класс для управления состоянием графа знаний.

### Конструктор

```javascript
const graphState = new GraphState();
```

Инициализирует граф с данными из `GRAPH_DATA`, создаёт UI элементы и устанавливает обработчики событий.

### Свойства

#### nodes
```javascript
graphState.nodes: vis.DataSet
```
DataSet содержит все узлы графа. Каждый узел имеет структуру:

```javascript
{
    id: number,
    label: string,
    group: string,
    year: number,
    description: string,
    formula: string,
    triz: string,
    title: string,
    color: string,
    shape: string,
    size: number,
    font: object,
    hidden: boolean
}
```

#### edges
```javascript
graphState.edges: vis.DataSet
```
DataSet содержит все связи между узлами. Каждая связь имеет структуру:

```javascript
{
    id: number,
    from: number,
    to: number,
    type: string,
    label: string,
    weight: number,
    color: string,
    width: number,
    dashes: boolean | array,
    font: object,
    smooth: object,
    hidden: boolean
}
```

#### network
```javascript
graphState.network: vis.Network
```
Объект Vis.Network для управления визуализацией графа.

#### filters
```javascript
graphState.filters: object
```
Объект с текущими активными фильтрами:

```javascript
{
    categories: Set,        // Активные категории
    edgeTypes: Set,        // Активные типы связей
    maxYear: number,       // Максимальный год
    searchQuery: string    // Поисковый запрос
}
```

### Методы

#### initializeUI()
```javascript
graphState.initializeUI(): void
```
Инициализирует UI элементы (фильтры, поиск, слайдеры) и устанавливает обработчики событий.

**Пример:**
```javascript
// Вызывается автоматически в конструкторе
graphState.initializeUI();
```

#### applyFilters()
```javascript
graphState.applyFilters(): void
```
Применяет текущие фильтры к узлам и связям. Скрывает узлы, которые не соответствуют фильтрам.

**Пример:**
```javascript
// Активировать фильтр категории
document.querySelector('[data-category="foundation"]').checked = true;

// Применить фильтры
graphState.applyFilters();
```

#### selectNode(nodeId)
```javascript
graphState.selectNode(nodeId: number): void
```
Выбирает узел и отображает его информацию в правой панели.

**Параметры:**
- `nodeId` (number) — ID узла для выбора

**Пример:**
```javascript
graphState.selectNode(5);
// Отображает информацию о узле с ID 5
```

#### resetView()
```javascript
graphState.resetView(): void
```
Сбрасывает все фильтры и возвращает граф в исходное состояние.

**Пример:**
```javascript
graphState.resetView();
// Все узлы видны, фильтры очищены
```

#### exportState()
```javascript
graphState.exportState(): void
```
Сохраняет текущее состояние (фильтры, выбранный узел) в `localStorage`.

**Пример:**
```javascript
graphState.exportState();
// Состояние сохранено в localStorage['graphState']
```

#### importState()
```javascript
graphState.importState(): void
```
Загружает сохранённое состояние из `localStorage`.

**Пример:**
```javascript
graphState.importState();
// Восстанавливает фильтры и выбранный узел
```

## Работа с узлами

### Добавление узла

```javascript
graphState.nodes.add({
    id: 21,
    label: 'Новая концепция',
    group: 'foundation',
    year: 2025,
    description: 'Полное описание',
    formula: 'Formula = X + Y',
    triz: 'ТРИЗ-принцип',
    title: 'Подсказка'
});
```

### Обновление узла

```javascript
graphState.nodes.update({
    id: 5,
    label: 'Обновлённое название',
    description: 'Новое описание'
});
```

### Удаление узла

```javascript
graphState.nodes.remove(5);
```

### Получение узла

```javascript
const node = graphState.nodes.get(5);
console.log(node.label);  // Название узла
```

### Получение всех узлов

```javascript
const allNodes = graphState.nodes.get();
console.log(allNodes.length);  // Количество узлов
```

### Фильтрация узлов

```javascript
const foundationNodes = graphState.nodes.get({
    filter: node => node.group === 'foundation'
});
```

## Работа со связями

### Добавление связи

```javascript
graphState.edges.add({
    from: 5,
    to: 21,
    type: 'evolves_to',
    label: 'эволюция',
    weight: 0.8
});
```

### Обновление связи

```javascript
graphState.edges.update({
    id: 1,
    label: 'новая метка',
    weight: 0.9
});
```

### Удаление связи

```javascript
graphState.edges.remove(1);
```

### Получение связи

```javascript
const edge = graphState.edges.get(1);
console.log(edge.type);  // Тип связи
```

### Получение всех связей

```javascript
const allEdges = graphState.edges.get();
console.log(allEdges.length);  // Количество связей
```

### Поиск связей узла

```javascript
// Все связи, исходящие из узла 5
const outgoing = graphState.edges.get({
    filter: edge => edge.from === 5
});

// Все связи, входящие в узел 5
const incoming = graphState.edges.get({
    filter: edge => edge.to === 5
});

// Все связи узла 5 (входящие и исходящие)
const allConnected = graphState.edges.get({
    filter: edge => edge.from === 5 || edge.to === 5
});
```

## Работа с фильтрами

### Программное добавление фильтра категории

```javascript
// Активировать фильтр
graphState.filters.categories.add('foundation');

// Применить
graphState.applyFilters();
```

### Программное удаление фильтра

```javascript
// Деактивировать фильтр
graphState.filters.categories.delete('foundation');

// Применить
graphState.applyFilters();
```

### Установка года

```javascript
graphState.filters.maxYear = 2023;
graphState.applyFilters();
```

### Установка поискового запроса

```javascript
graphState.filters.searchQuery = 'federated';
graphState.applyFilters();
```

## Работа с сетью (Network)

### Выбор узла

```javascript
graphState.network.selectNodes([5]);
```

### Выбор нескольких узлов

```javascript
graphState.network.selectNodes([5, 10, 15]);
```

### Получение выбранных узлов

```javascript
const selected = graphState.network.getSelectedNodes();
console.log(selected);  // [5, 10, 15]
```

### Фокус на узел

```javascript
graphState.network.focus(5, {
    scale: 1.5,
    animation: true
});
```

### Масштабирование

```javascript
graphState.network.setOptions({
    physics: {
        enabled: false
    }
});

graphState.network.fit();  // Вписать весь граф
```

### Включение/отключение физики

```javascript
// Включить
graphState.network.physics.enabled = true;

// Отключить
graphState.network.physics.enabled = false;
```

## События

### Клик на узел

```javascript
graphState.network.on('click', (params) => {
    if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        graphState.selectNode(nodeId);
    }
});
```

### Двойной клик

```javascript
graphState.network.on('doubleClick', (params) => {
    console.log('Двойной клик на:', params);
});
```

### Изменение выделения

```javascript
graphState.network.on('selectNode', (params) => {
    console.log('Выбран узел:', params.nodes[0]);
});
```

## Примеры использования

### Пример 1: Фильтрация по категории

```javascript
// Показать только узлы категории 'method'
document.querySelectorAll('[data-category]').forEach(cb => {
    cb.checked = cb.dataset.category === 'method';
});
graphState.applyFilters();
```

### Пример 2: Поиск и выбор

```javascript
// Найти узел по названию
const nodes = graphState.nodes.get({
    filter: node => node.label.toLowerCase().includes('federated')
});

if (nodes.length > 0) {
    graphState.selectNode(nodes[0].id);
}
```

### Пример 3: Добавление новой концепции

```javascript
// Добавить новый узел
graphState.nodes.add({
    id: 100,
    label: 'Quantum Computing',
    group: 'foundation',
    year: 2024,
    description: 'Квантовые вычисления для ускорения ML',
    formula: '|ψ⟩ = α|0⟩ + β|1⟩',
    triz: 'Принцип 35: Изменение агрегатного состояния'
});

// Добавить связь
graphState.edges.add({
    from: 1,
    to: 100,
    type: 'enables',
    label: 'основа для'
});

// Применить изменения
graphState.applyFilters();
```

### Пример 4: Сохранение и загрузка

```javascript
// Сохранить текущее состояние
function saveMyWork() {
    graphState.exportState();
    alert('Работа сохранена');
}

// Загрузить сохранённое состояние
function loadMyWork() {
    graphState.importState();
    alert('Работа загружена');
}
```

### Пример 5: Экспорт данных

```javascript
function exportAsJSON() {
    const data = {
        nodes: graphState.nodes.get(),
        edges: graphState.edges.get(),
        timestamp: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-graph-${Date.now()}.json`;
    a.click();
}
```

## Константы конфигурации

### CATEGORIES

```javascript
const CATEGORIES = {
    foundation: { color: '#64d8ff', label: 'Фундамент' },
    method: { color: '#a0ff6f', label: 'Метод' },
    technique: { color: '#ff6b9d', label: 'Техника' },
    architecture: { color: '#ffd93d', label: 'Архитектура' },
    tool: { color: '#00d4ff', label: 'Инструмент' },
    application: { color: '#ff6b9d', label: 'Приложение' }
};
```

### EDGE_TYPES

```javascript
const EDGE_TYPES = {
    evolves_to: { color: '#64d8ff', width: 2, dashes: false },
    enables: { color: '#a0ff6f', width: 2, dashes: false },
    implements: { color: '#ffd93d', width: 2, dashes: false },
    uses: { color: '#00d4ff', width: 2, dashes: false },
    requires: { color: '#ff6b9d', width: 2, dashes: false },
    optimized_by: { color: '#64d8ff', width: 1.5, dashes: true },
    contradiction: { color: '#ff0000', width: 2, dashes: [5, 5] }
};
```

## Обработка ошибок

```javascript
try {
    graphState.selectNode(999);  // Несуществующий узел
} catch (error) {
    console.error('Ошибка:', error.message);
}

// Проверка существования узла
if (graphState.nodes.get(5)) {
    graphState.selectNode(5);
} else {
    console.warn('Узел не найден');
}
```

## Производительность

### Оптимизация больших графов

```javascript
// Отключить физику для больших графов
if (graphState.nodes.length > 1000) {
    graphState.network.physics.enabled = false;
}

// Использовать batch обновления
const updates = [];
for (let i = 0; i < 100; i++) {
    updates.push({
        id: i,
        label: `Node ${i}`,
        hidden: true
    });
}
graphState.nodes.update(updates);  // Один вызов вместо 100
```

---

**Версия:** 3.0  
**Дата:** 14.11.2025  
**Статус:** Production-ready
