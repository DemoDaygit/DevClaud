# Руководство разработчика - Knowledge Graph v3.0

## 🛠️ Настройка окружения

### Требования

- **Браузер:** Chrome 120+, Firefox 122+, Safari 17+, Edge 120+
- **Сервер:** Python 3 или Node.js (для локального тестирования)
- **Редактор:** VS Code, WebStorm или любой текстовый редактор
- **Инструменты:** Git, GitHub CLI (опционально)

### Установка

```bash
# Клонируйте репозиторий
git clone https://github.com/DemoDaygit/DevClaud.git
cd knowledge-graph

# Запустите локальный сервер
python -m http.server 8000
# или
npx http-server

# Откройте http://localhost:8000/knowledge-graph-enhanced.html
```

## 📐 Архитектура

### Структура кода

```
knowledge-graph-enhanced.html
├── <head>
│   ├── Импорты библиотек (D3, Three.js, Vis.js, GSAP)
│   └── CSS стили
│
├── <body>
│   ├── HTML структура (grid layout)
│   └── <script> (основная логика)
│       ├── GRAPH_DATA (данные узлов и связей)
│       ├── CATEGORIES (конфигурация категорий)
│       ├── EDGE_TYPES (конфигурация типов связей)
│       ├── GraphState (класс управления состоянием)
│       └── Функции управления (toggleLayout, exportGraph, etc)
```

### Классы и модули

#### GraphState

Основной класс управления состоянием графа:

```javascript
class GraphState {
    constructor()           // Инициализация
    initializeUI()         // Инициализация UI элементов
    applyFilters()         // Применение фильтров
    selectNode(nodeId)     // Выбор узла
    resetView()            // Сброс представления
    exportState()          // Сохранение в localStorage
    importState()          // Загрузка из localStorage
}
```

**Свойства:**
- `nodes` — vis.DataSet с узлами
- `edges` — vis.DataSet со связями
- `network` — vis.Network объект
- `filters` — объект с активными фильтрами

#### Данные (GRAPH_DATA)

```javascript
const GRAPH_DATA = {
    nodes: [
        {
            id: number,
            label: string,
            group: string,              // foundation|method|technique|architecture|tool|application
            year: number,
            description: string,
            formula: string,            // LaTeX формула
            triz: string,              // ТРИЗ-принцип
            title: string              // Подсказка
        }
    ],
    edges: [
        {
            from: number,
            to: number,
            type: string,              // evolves_to|enables|implements|uses|requires|optimized_by|contradiction
            label: string,
            weight: number             // 0-1
        }
    ]
};
```

#### Конфигурация (CATEGORIES, EDGE_TYPES)

```javascript
const CATEGORIES = {
    foundation: { color: '#64d8ff', label: 'Фундамент' },
    // ...
};

const EDGE_TYPES = {
    evolves_to: { color: '#64d8ff', width: 2, dashes: false },
    // ...
};
```

## 🔧 Расширение функциональности

### Добавление нового узла

```javascript
// 1. Добавьте в GRAPH_DATA.nodes
{
    id: 21,
    label: 'Новая концепция',
    group: 'foundation',
    year: 2025,
    description: 'Полное описание концепции',
    formula: 'Formula = concept_1 + concept_2',
    triz: 'ТРИЗ-принцип 1: Дробление',
    title: 'Подсказка при наведении'
}

// 2. Добавьте связи в GRAPH_DATA.edges
{
    from: 1,
    to: 21,
    type: 'evolves_to',
    label: 'эволюция',
    weight: 0.8
}

// 3. Перезагрузите страницу
```

### Добавление новой категории

```javascript
// 1. Добавьте в CATEGORIES
const CATEGORIES = {
    // ...
    my_category: { color: '#ff00ff', label: 'Моя категория' }
};

// 2. Используйте в узлах
{ id: 21, group: 'my_category', ... }

// 3. Фильтр автоматически появится в UI
```

### Добавление нового типа связи

```javascript
// 1. Добавьте в EDGE_TYPES
const EDGE_TYPES = {
    // ...
    my_relation: { color: '#00ff00', width: 2, dashes: false }
};

// 2. Используйте в связях
{ from: 1, to: 2, type: 'my_relation', ... }

// 3. Фильтр автоматически появится в UI
```

### Добавление нового фильтра

```javascript
// 1. Добавьте элемент в HTML (в sidebar-left)
<div class="sidebar-section">
    <div class="sidebar-title">Мой фильтр</div>
    <input type="text" id="myFilter" placeholder="Введите значение">
</div>

// 2. Обработайте в GraphState.initializeUI()
document.getElementById('myFilter').addEventListener('input', (e) => {
    this.filters.myFilter = e.target.value;
    this.applyFilters();
});

// 3. Используйте в applyFilters()
if (this.filters.myFilter && !node.label.includes(this.filters.myFilter)) {
    visible = false;
}
```

## 🧪 Тестирование

### Ручное тестирование

```javascript
// Откройте консоль браузера (F12) и выполните:

// Проверка инициализации
console.log(graphState.nodes.length);  // Должно быть 20
console.log(graphState.edges.length);  // Должно быть 18

// Проверка выбора узла
graphState.selectNode(5);

// Проверка фильтров
document.querySelector('[data-category="foundation"]').click();
graphState.applyFilters();

// Проверка поиска
document.getElementById('searchInput').value = 'federated';
graphState.filters.searchQuery = 'federated';
graphState.applyFilters();

// Проверка сохранения
graphState.exportState();
console.log(localStorage.getItem('graphState'));
```

### Автоматизированное тестирование (v3.1+)

```javascript
// tests/graph.test.js
describe('GraphState', () => {
    let graphState;
    
    beforeEach(() => {
        graphState = new GraphState();
    });
    
    test('should initialize with correct number of nodes', () => {
        expect(graphState.nodes.length).toBe(20);
    });
    
    test('should select node correctly', () => {
        graphState.selectNode(5);
        expect(document.getElementById('infoPanel').classList.contains('active')).toBe(true);
    });
    
    test('should apply filters correctly', () => {
        document.querySelector('[data-category="foundation"]').checked = true;
        graphState.applyFilters();
        // Проверка видимости узлов
    });
});
```

## 🎨 Стилизация

### CSS переменные

```css
/* Основные цвета */
--primary: #64d8ff;      /* Синий */
--success: #a0ff6f;      /* Зелёный */
--warning: #ffd93d;      /* Жёлтый */
--danger: #ff6b9d;       /* Розовый */
--info: #00d4ff;         /* Голубой */

/* Фоны */
--bg-dark: #0f0c29;
--bg-darker: #302b63;
--bg-darkest: #24243e;

/* Текст */
--text-primary: #e0e0e0;
--text-secondary: rgba(255, 255, 255, 0.7);
```

### Добавление новых стилей

```css
/* Добавьте в <style> блок */
.my-component {
    background: linear-gradient(135deg, var(--primary), var(--success));
    color: var(--text-primary);
    padding: 15px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.my-component:hover {
    box-shadow: 0 0 20px rgba(100, 216, 255, 0.3);
}
```

## 🚀 Оптимизация производительности

### Профилирование

```javascript
// Измерение времени загрузки
console.time('graph-init');
graphState = new GraphState();
console.timeEnd('graph-init');

// Измерение FPS
let lastTime = performance.now();
let frameCount = 0;

function measureFPS() {
    const now = performance.now();
    if (now >= lastTime + 1000) {
        console.log(`FPS: ${frameCount}`);
        frameCount = 0;
        lastTime = now;
    }
    frameCount++;
    requestAnimationFrame(measureFPS);
}
measureFPS();
```

### Рекомендации

1. **Batch обновления:** Обновляйте узлы/связи группами, не по одному
2. **Ленивая загрузка:** Загружайте узлы по мере необходимости
3. **Кэширование:** Кэшируйте результаты поиска
4. **Оптимизация DOM:** Минимизируйте манипуляции DOM
5. **WebGL:** Используйте WebGL для больших графов (v3.5+)

## 📦 Зависимости

### Текущие (v3.0)

```html
<!-- Vis.js для визуализации графов -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.js"></script>

<!-- D3.js для продвинутой визуализации -->
<script src="https://d3js.org/d3.v7.min.js"></script>

<!-- Three.js для 3D (подготовка к v3.5) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- GSAP для анимаций -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
```

### Планируемые (v3.5+)

```json
{
    "dependencies": {
        "d3": "^7.8.0",
        "three": "^r128",
        "gsap": "^3.12.2",
        "vis-network": "^9.1.0",
        "axios": "^1.6.0",
        "web3": "^4.0.0"
    },
    "devDependencies": {
        "vitest": "^0.34.0",
        "typescript": "^5.2.0",
        "eslint": "^8.50.0",
        "prettier": "^3.0.0"
    }
}
```

## 🔄 Версионирование

### Семантическое версионирование

```
MAJOR.MINOR.PATCH
3.0.0
│ │ └─ Исправления ошибок
│ └─── Новые функции (обратно совместимо)
└───── Критические изменения
```

### История версий

- **v3.0** (Nov 2025) — Архитектурная визуализация
- **v3.1** (Dec 2025) — Pagination и экспорт
- **v3.5** (Q1 2026) — TON интеграция
- **v4.0** (Q2 2026) — VR интерфейс

## 🐛 Отладка

### Логирование

```javascript
// Добавьте в GraphState для отладки
const DEBUG = true;

if (DEBUG) {
    console.log('Filters applied:', this.filters);
    console.log('Visible nodes:', this.nodes.get({ filter: n => !n.hidden }));
}
```

### Инструменты браузера

```javascript
// Откройте DevTools (F12)

// Проверка состояния
graphState.nodes.get()      // Все узлы
graphState.edges.get()      // Все связи
graphState.filters          // Текущие фильтры

// Проверка сохранённого состояния
localStorage.getItem('graphState')
sessionStorage.getItem('graphState')
```

## 📝 Комментирование кода

### Стиль комментариев

```javascript
// Однострочный комментарий

/**
 * Многострочный комментарий
 * @param {number} nodeId - ID узла
 * @returns {void}
 */
function selectNode(nodeId) {
    // Реализация
}

// TODO: Реализовать функцию X в v3.5
// FIXME: Исправить производительность на больших графах
// HACK: Временное решение для совместимости с Safari
```

## 🚢 Развёртывание

### GitHub Pages

```bash
# 1. Убедитесь, что файлы в корне репозитория
# 2. Включите GitHub Pages в Settings → Pages
# 3. Выберите branch: main
# 4. Сохраните

# Доступно по адресу: https://demodaygit.github.io/DevClaud/
```

### Собственный сервер

```bash
# 1. Скопируйте файлы на сервер
scp knowledge-graph-enhanced.html user@server:/var/www/html/

# 2. Убедитесь в правах доступа
chmod 644 /var/www/html/knowledge-graph-enhanced.html

# 3. Доступно по адресу: https://your-domain.com/knowledge-graph-enhanced.html
```

## 📚 Дополнительные ресурсы

- **Vis.js документация:** https://visjs.org/
- **D3.js документация:** https://d3js.org/
- **Three.js документация:** https://threejs.org/
- **GSAP документация:** https://greensock.com/gsap/

---

**Версия:** 3.0  
**Дата:** 14.11.2025  
**Статус:** Production-ready

Вопросы? Создавайте Issues на GitHub!
