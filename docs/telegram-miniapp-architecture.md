# 📱 Профессиональная архитектура Telegram Mini Apps

## Руководство по построению современных обучающих платформ в Telegram

---

## 📋 Содержание

1. [Архитектура приложения](#архитектура-приложения)
2. [Интеграция с Telegram Web App API](#интеграция-с-telegram-web-app-api)
3. [Особенности обучающих платформ](#особенности-обучающих-платформ)
4. [Производительность и UX](#производительность-и-ux)
5. [Безопасность и аутентификация](#безопасность-и-аутентификация)
6. [Развертывание и масштабирование](#развертывание-и-масштабирование)
7. [Best Practices](#best-practices)

---

## 🏗️ Архитектура приложения

### Модульная структура

```
telegram-miniapp/
├── src/
│   ├── core/                   # Ядро приложения
│   │   ├── app.js             # Главный класс приложения
│   │   ├── router.js          # Маршрутизация
│   │   └── state.js           # Управление состоянием
│   ├── integrations/          # Внешние интеграции
│   │   ├── telegram.js        # Telegram Web App API
│   │   ├── analytics.js       # Аналитика
│   │   └── storage.js         # Хранилище данных
│   ├── modules/               # Функциональные модули
│   │   ├── auth/              # Аутентификация
│   │   ├── learning/          # Обучающий контент
│   │   ├── progress/          # Отслеживание прогресса
│   │   └── community/         # Сообщество
│   ├── ui/                    # UI компоненты
│   │   ├── components/        # Переиспользуемые компоненты
│   │   ├── layouts/           # Layouts
│   │   └── themes/            # Темы оформления
│   └── utils/                 # Утилиты
├── public/                    # Статические файлы
├── assets/                    # Ресурсы (изображения, иконки)
├── docs/                      # Документация
└── tests/                     # Тесты
```

### Паттерны проектирования

#### 1. **Module Pattern** - Инкапсуляция функциональности

```javascript
// ✅ Хорошо: Модульная структура
export class LearningModule {
    constructor(config) {
        this._lessons = [];
        this._progress = new ProgressTracker();
        this._analytics = new Analytics();
    }

    async loadLesson(lessonId) {
        try {
            const lesson = await this._fetchLesson(lessonId);
            this._trackEvent('lesson_loaded', { lessonId });
            return lesson;
        } catch (error) {
            this._handleError(error);
        }
    }

    // Приватные методы
    async _fetchLesson(id) { /* ... */ }
    _trackEvent(event, data) { /* ... */ }
    _handleError(error) { /* ... */ }
}

// ❌ Плохо: Все в глобальной области
function loadLesson(id) { /* ... */ }
var lessons = [];
var progress = {};
```

#### 2. **Observer Pattern** - Реактивное обновление UI

```javascript
// ✅ Хорошо: Event-driven архитектура
class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
}

// Использование
const eventBus = new EventBus();

// Подписка на события
eventBus.on('progress:updated', (data) => {
    updateProgressBar(data.progress);
    showNotification('Progress saved!');
});

// Публикация событий
eventBus.emit('progress:updated', { progress: 75 });
```

#### 3. **Factory Pattern** - Создание UI компонентов

```javascript
// ✅ Хорошо: Фабрика компонентов
class ComponentFactory {
    static createButton(type, options) {
        const baseClass = 'btn';
        const variants = {
            primary: 'btn-primary',
            secondary: 'btn-secondary',
            danger: 'btn-danger'
        };

        const button = document.createElement('button');
        button.className = `${baseClass} ${variants[type]}`;
        button.textContent = options.text;
        button.onclick = options.onClick;

        if (options.icon) {
            const icon = document.createElement('span');
            icon.className = 'btn-icon';
            icon.textContent = options.icon;
            button.prepend(icon);
        }

        return button;
    }

    static createCard(options) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${options.title}</h3>
            </div>
            <div class="card-body">
                ${options.content}
            </div>
            ${options.footer ? `<div class="card-footer">${options.footer}</div>` : ''}
        `;
        return card;
    }
}

// Использование
const saveButton = ComponentFactory.createButton('primary', {
    text: 'Save Progress',
    icon: '💾',
    onClick: () => saveProgress()
});
```

---

## 📲 Интеграция с Telegram Web App API

### 1. Инициализация

```javascript
class TelegramMiniApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.isReady = false;
    }

    async init() {
        if (!this.tg) {
            console.warn('Not in Telegram environment');
            return this.initDemoMode();
        }

        // 1. Готовность приложения
        this.tg.ready();

        // 2. Развернуть на весь экран
        this.tg.expand();

        // 3. Получить данные пользователя
        this.user = this.tg.initDataUnsafe?.user;

        // 4. Настроить внешний вид
        this.setupAppearance();

        // 5. Настроить элементы управления
        this.setupControls();

        // 6. Слушатели событий
        this.setupEventListeners();

        // 7. Включить подтверждение закрытия
        this.tg.enableClosingConfirmation();

        this.isReady = true;
        console.log('✅ Telegram Mini App initialized');
    }

    setupAppearance() {
        // Цвета заголовка и фона
        this.tg.setHeaderColor('#1a1a2e');
        this.tg.setBackgroundColor('#16213e');

        // Применить тему Telegram
        this.applyTelegramTheme();
    }

    applyTelegramTheme() {
        const theme = this.tg.themeParams;

        document.documentElement.style.setProperty('--tg-bg', theme.bg_color);
        document.documentElement.style.setProperty('--tg-text', theme.text_color);
        document.documentElement.style.setProperty('--tg-hint', theme.hint_color);
        document.documentElement.style.setProperty('--tg-link', theme.link_color);
        document.documentElement.style.setProperty('--tg-button', theme.button_color);
        document.documentElement.style.setProperty('--tg-button-text', theme.button_text_color);
    }

    setupControls() {
        // Главная кнопка
        this.tg.MainButton.setText('Continue');
        this.tg.MainButton.color = '#667eea';
        this.tg.MainButton.textColor = '#ffffff';

        // Кнопка назад
        this.tg.BackButton.onClick(() => this.handleBack());
    }

    setupEventListeners() {
        // Изменение темы
        this.tg.onEvent('themeChanged', () => {
            this.applyTelegramTheme();
        });

        // Изменение viewport
        this.tg.onEvent('viewportChanged', () => {
            this.handleViewportChange();
        });

        // Нажатие на главную кнопку
        this.tg.onEvent('mainButtonClicked', () => {
            this.handleMainButtonClick();
        });

        // События клавиатуры
        this.tg.onEvent('settingsButtonClicked', () => {
            this.openSettings();
        });
    }

    // Haptic обратная связь
    vibrate(type = 'light') {
        if (!this.tg?.HapticFeedback) return;

        const types = {
            light: () => this.tg.HapticFeedback.impactOccurred('light'),
            medium: () => this.tg.HapticFeedback.impactOccurred('medium'),
            heavy: () => this.tg.HapticFeedback.impactOccurred('heavy'),
            success: () => this.tg.HapticFeedback.notificationOccurred('success'),
            warning: () => this.tg.HapticFeedback.notificationOccurred('warning'),
            error: () => this.tg.HapticFeedback.notificationOccurred('error')
        };

        types[type]?.();
    }

    // Отправка данных боту
    sendDataToBot(data) {
        this.tg.sendData(JSON.stringify(data));
    }

    // Открытие ссылок
    openLink(url, options = {}) {
        if (options.tryInstantView) {
            this.tg.openLink(url, { try_instant_view: true });
        } else {
            this.tg.openTelegramLink(url);
        }
    }

    // Сканирование QR-кода
    async scanQRCode(text = 'Scan QR Code') {
        return new Promise((resolve, reject) => {
            this.tg.showScanQrPopup({ text }, (qrData) => {
                if (qrData) {
                    this.tg.closeScanQrPopup();
                    resolve(qrData);
                }
            });

            // Таймаут 60 секунд
            setTimeout(() => {
                this.tg.closeScanQrPopup();
                reject(new Error('QR scan timeout'));
            }, 60000);
        });
    }
}
```

### 2. Cloud Storage - Хранение данных пользователя

```javascript
class CloudStorageManager {
    constructor(telegram) {
        this.tg = telegram;
        this.storage = telegram?.CloudStorage;
    }

    async save(key, value) {
        return new Promise((resolve, reject) => {
            const data = typeof value === 'object'
                ? JSON.stringify(value)
                : String(value);

            this.storage.setItem(key, data, (error, success) => {
                if (error) reject(error);
                else resolve(success);
            });
        });
    }

    async load(key) {
        return new Promise((resolve, reject) => {
            this.storage.getItem(key, (error, value) => {
                if (error) reject(error);
                else {
                    try {
                        resolve(JSON.parse(value));
                    } catch {
                        resolve(value);
                    }
                }
            });
        });
    }

    async saveMultiple(items) {
        return new Promise((resolve, reject) => {
            const formatted = Object.entries(items).map(([k, v]) => [
                k,
                typeof v === 'object' ? JSON.stringify(v) : String(v)
            ]);

            this.storage.setItems(formatted, (error, success) => {
                if (error) reject(error);
                else resolve(success);
            });
        });
    }

    async loadMultiple(keys) {
        return new Promise((resolve, reject) => {
            this.storage.getItems(keys, (error, values) => {
                if (error) reject(error);
                else {
                    const parsed = {};
                    for (const [key, value] of Object.entries(values)) {
                        try {
                            parsed[key] = JSON.parse(value);
                        } catch {
                            parsed[key] = value;
                        }
                    }
                    resolve(parsed);
                }
            });
        });
    }

    async remove(key) {
        return new Promise((resolve, reject) => {
            this.storage.removeItem(key, (error, success) => {
                if (error) reject(error);
                else resolve(success);
            });
        });
    }

    async getKeys() {
        return new Promise((resolve, reject) => {
            this.storage.getKeys((error, keys) => {
                if (error) reject(error);
                else resolve(keys);
            });
        });
    }
}

// Использование для обучающей платформы
class LearningProgressManager {
    constructor(cloudStorage) {
        this.storage = cloudStorage;
    }

    async saveProgress(lessonId, progress) {
        const key = `lesson_${lessonId}`;
        const data = {
            lessonId,
            progress,
            lastAccess: Date.now(),
            completed: progress >= 100
        };

        await this.storage.save(key, data);
        await this.updateGlobalProgress();
    }

    async loadProgress(lessonId) {
        const key = `lesson_${lessonId}`;
        return await this.storage.load(key);
    }

    async updateGlobalProgress() {
        const keys = await this.storage.getKeys();
        const lessonKeys = keys.filter(k => k.startsWith('lesson_'));

        const allProgress = await this.storage.loadMultiple(lessonKeys);
        const completed = Object.values(allProgress)
            .filter(p => p.completed).length;

        await this.storage.save('global_progress', {
            total: lessonKeys.length,
            completed,
            percentage: Math.round((completed / lessonKeys.length) * 100),
            lastUpdate: Date.now()
        });
    }

    async getGlobalProgress() {
        return await this.storage.load('global_progress') || {
            total: 0,
            completed: 0,
            percentage: 0
        };
    }
}
```

---

## 🎓 Особенности обучающих платформ

### 1. Система прогресса

```javascript
class ProgressTracker {
    constructor(storage) {
        this.storage = storage;
        this.eventBus = new EventBus();
    }

    async trackLessonStart(lessonId) {
        const session = {
            lessonId,
            startTime: Date.now(),
            interactions: [],
            timeSpent: 0
        };

        await this.storage.save(`session_${lessonId}`, session);
        this.eventBus.emit('lesson:started', { lessonId });
    }

    async trackInteraction(lessonId, interactionType, data) {
        const session = await this.storage.load(`session_${lessonId}`);

        session.interactions.push({
            type: interactionType,
            data,
            timestamp: Date.now()
        });

        await this.storage.save(`session_${lessonId}`, session);
    }

    async completLesson(lessonId, score) {
        const session = await this.storage.load(`session_${lessonId}`);
        session.endTime = Date.now();
        session.timeSpent = session.endTime - session.startTime;
        session.score = score;
        session.completed = true;

        await this.storage.save(`session_${lessonId}`, session);
        await this.updateAchievements(lessonId, session);

        this.eventBus.emit('lesson:completed', {
            lessonId,
            timeSpent: session.timeSpent,
            score
        });

        return session;
    }

    async updateAchievements(lessonId, session) {
        const achievements = [];

        // Быстрое прохождение
        if (session.timeSpent < 300000) { // 5 минут
            achievements.push({
                id: 'speed_learner',
                title: 'Speed Learner',
                description: 'Completed lesson in under 5 minutes',
                icon: '⚡'
            });
        }

        // Идеальный результат
        if (session.score >= 100) {
            achievements.push({
                id: 'perfect_score',
                title: 'Perfect Score',
                description: 'Achieved 100% on the lesson',
                icon: '🏆'
            });
        }

        // Сохраняем достижения
        for (const achievement of achievements) {
            await this.unlockAchievement(achievement);
        }
    }

    async unlockAchievement(achievement) {
        const existingAchievements = await this.storage.load('achievements') || [];

        if (!existingAchievements.find(a => a.id === achievement.id)) {
            existingAchievements.push({
                ...achievement,
                unlockedAt: Date.now()
            });

            await this.storage.save('achievements', existingAchievements);

            this.eventBus.emit('achievement:unlocked', achievement);
            this.showAchievementNotification(achievement);
        }
    }

    showAchievementNotification(achievement) {
        // Показываем красивое уведомление
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <h4>Achievement Unlocked!</h4>
                <p class="achievement-title">${achievement.title}</p>
                <p class="achievement-description">${achievement.description}</p>
            </div>
        `;

        document.body.appendChild(notification);

        // Анимация появления
        setTimeout(() => notification.classList.add('show'), 10);

        // Убираем через 4 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    async getStatistics() {
        const keys = await this.storage.getKeys();
        const sessionKeys = keys.filter(k => k.startsWith('session_'));
        const sessions = await this.storage.loadMultiple(sessionKeys);

        const stats = {
            totalLessons: sessionKeys.length,
            completedLessons: Object.values(sessions).filter(s => s.completed).length,
            totalTimeSpent: Object.values(sessions).reduce((sum, s) => sum + (s.timeSpent || 0), 0),
            averageScore: this._calculateAverageScore(sessions),
            achievements: (await this.storage.load('achievements')) || [],
            streak: await this._calculateStreak(sessions)
        };

        return stats;
    }

    _calculateAverageScore(sessions) {
        const completedSessions = Object.values(sessions).filter(s => s.completed && s.score);
        if (completedSessions.length === 0) return 0;

        const totalScore = completedSessions.reduce((sum, s) => sum + s.score, 0);
        return Math.round(totalScore / completedSessions.length);
    }

    async _calculateStreak(sessions) {
        const completedDates = Object.values(sessions)
            .filter(s => s.completed)
            .map(s => new Date(s.endTime).toDateString())
            .sort((a, b) => new Date(b) - new Date(a));

        let streak = 0;
        let currentDate = new Date().toDateString();

        for (const date of completedDates) {
            if (date === currentDate) {
                streak++;
                const dateObj = new Date(currentDate);
                dateObj.setDate(dateObj.getDate() - 1);
                currentDate = dateObj.toDateString();
            } else {
                break;
            }
        }

        return streak;
    }
}
```

### 2. Интерактивный код-редактор

```javascript
class CodePlayground {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.editor = null;
        this.output = null;
    }

    async init() {
        // Использование Monaco Editor (легковесная версия VS Code)
        require.config({
            paths: {
                vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs'
            }
        });

        return new Promise((resolve) => {
            require(['vs/editor/editor.main'], () => {
                this.editor = monaco.editor.create(this.container, {
                    value: this.getStarterCode(),
                    language: 'python',
                    theme: 'vs-dark',
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                });

                resolve();
            });
        });
    }

    getStarterCode() {
        return `# Welcome to the Code Playground!
# Write your code here and click Run

def hello_world():
    print("Hello, Distributed AI!")

hello_world()
`;
    }

    async runCode() {
        const code = this.editor.getValue();

        try {
            // Вариант 1: Использовать Pyodide (Python в браузере)
            const output = await this.runPythonInBrowser(code);
            this.displayOutput(output);

            // Вариант 2: Отправить на backend
            // const output = await this.runCodeOnServer(code);
            // this.displayOutput(output);

        } catch (error) {
            this.displayError(error.message);
        }
    }

    async runPythonInBrowser(code) {
        // Загружаем Pyodide если еще не загружен
        if (!window.pyodide) {
            await loadPyodide();
        }

        // Перехватываем stdout
        let output = '';
        window.pyodide.setStdout({
            write: (text) => { output += text; }
        });

        try {
            await window.pyodide.runPythonAsync(code);
            return output || 'Code executed successfully (no output)';
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async runCodeOnServer(code) {
        const response = await fetch('/api/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({
                code,
                language: 'python',
                userId: this.getUserId()
            })
        });

        if (!response.ok) {
            throw new Error('Server error');
        }

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        return result.output;
    }

    displayOutput(output) {
        this.clearOutput();

        const outputEl = document.createElement('pre');
        outputEl.className = 'code-output success';
        outputEl.textContent = output;

        this.output.appendChild(outputEl);
    }

    displayError(message) {
        this.clearOutput();

        const errorEl = document.createElement('pre');
        errorEl.className = 'code-output error';
        errorEl.innerHTML = `
            <span class="error-icon">❌</span>
            <span class="error-message">${message}</span>
        `;

        this.output.appendChild(errorEl);
    }

    clearOutput() {
        if (this.output) {
            this.output.innerHTML = '';
        }
    }

    setValue(code) {
        this.editor.setValue(code);
    }

    getValue() {
        return this.editor.getValue();
    }

    setLanguage(language) {
        monaco.editor.setModelLanguage(
            this.editor.getModel(),
            language
        );
    }
}
```

### 3. Геймификация

```javascript
class Gamification {
    constructor(storage, eventBus) {
        this.storage = storage;
        this.eventBus = eventBus;
        this.xpSystem = new XPSystem(storage);
        this.achievements = new AchievementSystem(storage);
        this.leaderboard = new Leaderboard(storage);
    }

    async init() {
        await this.xpSystem.init();
        await this.achievements.init();
        await this.leaderboard.init();

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Начисление XP за завершение урока
        this.eventBus.on('lesson:completed', async (data) => {
            const xpGained = this.calculateLessonXP(data);
            await this.xpSystem.addXP(xpGained, 'lesson_completed');
        });

        // Начисление XP за упражнение
        this.eventBus.on('exercise:completed', async (data) => {
            const xpGained = this.calculateExerciseXP(data);
            await this.xpSystem.addXP(xpGained, 'exercise_completed');
        });

        // Проверка достижений
        this.eventBus.on('xp:levelUp', async (data) => {
            await this.achievements.checkAchievements();
        });
    }

    calculateLessonXP(data) {
        let baseXP = 100;

        // Бонус за высокий балл
        if (data.score >= 90) baseXP *= 1.5;
        else if (data.score >= 75) baseXP *= 1.25;

        // Бонус за скорость
        const targetTime = 1800000; // 30 минут
        if (data.timeSpent < targetTime) {
            baseXP *= 1.2;
        }

        // Бонус за streak
        const streak = data.streak || 0;
        if (streak >= 7) baseXP *= 1.5;
        else if (streak >= 3) baseXP *= 1.25;

        return Math.round(baseXP);
    }

    calculateExerciseXP(data) {
        const baseXP = 50;
        const difficultyMultiplier = {
            easy: 1.0,
            medium: 1.5,
            hard: 2.0
        };

        return Math.round(baseXP * (difficultyMultiplier[data.difficulty] || 1.0));
    }
}

class XPSystem {
    constructor(storage) {
        this.storage = storage;
        this.currentLevel = 1;
        this.currentXP = 0;
        this.totalXP = 0;
    }

    async init() {
        const savedData = await this.storage.load('xp_data');
        if (savedData) {
            this.currentLevel = savedData.level;
            this.currentXP = savedData.xp;
            this.totalXP = savedData.totalXP;
        }
    }

    async addXP(amount, source) {
        this.currentXP += amount;
        this.totalXP += amount;

        // Проверяем level up
        while (this.currentXP >= this.getXPForNextLevel()) {
            await this.levelUp();
        }

        await this.save();

        // Логируем источник XP
        await this.logXPGain(amount, source);

        return {
            gained: amount,
            current: this.currentXP,
            total: this.totalXP,
            level: this.currentLevel
        };
    }

    async levelUp() {
        const xpForNext = this.getXPForNextLevel();
        this.currentXP -= xpForNext;
        this.currentLevel += 1;

        // Событие level up
        this.eventBus.emit('xp:levelUp', {
            newLevel: this.currentLevel,
            rewards: this.getLevelUpRewards()
        });

        // Показываем красивую анимацию
        this.showLevelUpAnimation();
    }

    getXPForNextLevel() {
        // Экспоненциальная кривая: 100, 250, 450, 700, 1000...
        return Math.round(100 * Math.pow(this.currentLevel, 1.5));
    }

    getLevelUpRewards() {
        const rewards = [];

        // Каждый уровень
        rewards.push({
            type: 'badge',
            name: `Level ${this.currentLevel}`,
            icon: '⭐'
        });

        // Каждые 5 уровней
        if (this.currentLevel % 5 === 0) {
            rewards.push({
                type: 'certificate',
                name: 'Milestone Achievement',
                icon: '🏆'
            });
        }

        // Каждые 10 уровней
        if (this.currentLevel % 10 === 0) {
            rewards.push({
                type: 'special',
                name: 'Expert Status',
                icon: '👑'
            });
        }

        return rewards;
    }

    showLevelUpAnimation() {
        const overlay = document.createElement('div');
        overlay.className = 'level-up-overlay';
        overlay.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">🎉</div>
                <h2 class="level-up-title">Level Up!</h2>
                <div class="level-up-level">Level ${this.currentLevel}</div>
                <div class="level-up-rewards">
                    ${this.getLevelUpRewards().map(r => `
                        <div class="reward-item">
                            <span class="reward-icon">${r.icon}</span>
                            <span class="reward-name">${r.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        setTimeout(() => overlay.classList.add('show'), 10);
        setTimeout(() => {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 500);
        }, 3000);
    }

    async save() {
        await this.storage.save('xp_data', {
            level: this.currentLevel,
            xp: this.currentXP,
            totalXP: this.totalXP,
            lastUpdate: Date.now()
        });
    }

    async logXPGain(amount, source) {
        const history = (await this.storage.load('xp_history')) || [];
        history.push({
            amount,
            source,
            timestamp: Date.now(),
            level: this.currentLevel
        });

        // Храним последние 100 записей
        if (history.length > 100) {
            history.shift();
        }

        await this.storage.save('xp_history', history);
    }

    getProgress() {
        const xpForNext = this.getXPForNextLevel();
        return {
            level: this.currentLevel,
            currentXP: this.currentXP,
            xpForNextLevel: xpForNext,
            progress: Math.round((this.currentXP / xpForNext) * 100),
            totalXP: this.totalXP
        };
    }
}
```

---

## ⚡ Производительность и UX

### 1. Lazy Loading компонентов

```javascript
class LazyLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
    }

    async loadModule(moduleName) {
        // Если уже загружен
        if (this.loadedModules.has(moduleName)) {
            return true;
        }

        // Если уже загружается
        if (this.loadingPromises.has(moduleName)) {
            return await this.loadingPromises.get(moduleName);
        }

        // Начинаем загрузку
        const promise = this._loadModuleFile(moduleName);
        this.loadingPromises.set(moduleName, promise);

        try {
            await promise;
            this.loadedModules.add(moduleName);
            this.loadingPromises.delete(moduleName);
            return true;
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            throw error;
        }
    }

    async _loadModuleFile(moduleName) {
        const moduleMap = {
            '3d-visualization': '/modules/visualization3d.js',
            'code-editor': '/modules/code-editor.js',
            'video-player': '/modules/video-player.js',
            'quiz-engine': '/modules/quiz-engine.js'
        };

        const modulePath = moduleMap[moduleName];
        if (!modulePath) {
            throw new Error(`Unknown module: ${moduleName}`);
        }

        // Динамический импорт
        const module = await import(modulePath);

        // Инициализация если нужно
        if (module.init) {
            await module.init();
        }

        return module;
    }

    async loadOnVisible(elementId, moduleName) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const observer = new IntersectionObserver(async (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    await this.loadModule(moduleName);
                    observer.disconnect();
                }
            }
        }, {
            rootMargin: '50px' // Загружаем за 50px до появления
        });

        observer.observe(element);
    }
}

// Использование
const lazyLoader = new LazyLoader();

// Загрузить при клике
document.getElementById('open-editor-btn').addEventListener('click', async () => {
    showLoader();
    await lazyLoader.loadModule('code-editor');
    hideLoader();
    openCodeEditor();
});

// Загрузить при появлении
lazyLoader.loadOnVisible('visualization-section', '3d-visualization');
```

### 2. Оптимизация изображений

```javascript
class ImageOptimizer {
    static createResponsiveImage(src, alt, sizes = {}) {
        const img = document.createElement('img');
        img.alt = alt;
        img.loading = 'lazy'; // Native lazy loading

        // Используем srcset для разных разрешений
        const srcset = Object.entries(sizes)
            .map(([size, url]) => `${url} ${size}`)
            .join(', ');

        if (srcset) {
            img.srcset = srcset;
        }
        img.src = src; // Fallback

        // Low-quality placeholder
        img.style.backgroundColor = '#f0f0f0';

        return img;
    }

    static async loadImageWithPlaceholder(container, src) {
        // 1. Показываем placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
        placeholder.style.backgroundSize = '200% 100%';
        placeholder.style.animation = 'shimmer 1.5s infinite';
        container.appendChild(placeholder);

        // 2. Загружаем изображение
        const img = new Image();
        img.src = src;

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        // 3. Плавная замена
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s';
        container.appendChild(img);

        setTimeout(() => {
            img.style.opacity = '1';
            setTimeout(() => placeholder.remove(), 300);
        }, 10);

        return img;
    }

    static async convertToWebP(imageFile) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/webp', 0.85);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(imageFile);
        });
    }
}
```

### 3. Debounce и Throttle

```javascript
class PerformanceUtils {
    // Debounce - выполняется ПОСЛЕ окончания серии вызовов
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle - выполняется НЕ ЧАЩЕ определенного интервала
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // RequestAnimationFrame throttle для плавности
    static rafThrottle(func) {
        let requestId = null;
        let lastArgs;

        const later = (context) => () => {
            requestId = null;
            func.apply(context, lastArgs);
        };

        return function throttled(...args) {
            lastArgs = args;
            if (requestId === null) {
                requestId = requestAnimationFrame(later(this));
            }
        };
    }
}

// Использование
const searchInput = document.getElementById('search');

// Debounce для поиска (ждем пока пользователь закончит печатать)
const debouncedSearch = PerformanceUtils.debounce(async (query) => {
    const results = await searchLessons(query);
    displayResults(results);
}, 300);

searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
});

// Throttle для скролла
const throttledScroll = PerformanceUtils.throttle(() => {
    updateScrollProgress();
    checkLazyLoad();
}, 100);

window.addEventListener('scroll', throttledScroll);

// RAF throttle для анимаций
const rafThrottledResize = PerformanceUtils.rafThrottle(() => {
    updateLayout();
    recalculatePositions();
});

window.addEventListener('resize', rafThrottledResize);
```

---

## 🔒 Безопасность и аутентификация

### 1. Валидация данных Telegram

```javascript
class TelegramAuth {
    constructor(botToken) {
        this.botToken = botToken;
    }

    /**
     * Проверка подлинности данных от Telegram
     * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
     */
    async validateInitData(initData) {
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');
        urlParams.delete('hash');

        // Сортируем параметры
        const dataCheckString = Array.from(urlParams.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        // Вычисляем секретный ключ
        const secretKey = await this.hmacSHA256(
            this.botToken,
            'WebAppData'
        );

        // Вычисляем hash
        const calculatedHash = await this.hmacSHA256(
            dataCheckString,
            secretKey,
            'hex'
        );

        return calculatedHash === hash;
    }

    async hmacSHA256(message, key, outputFormat = 'binary') {
        const encoder = new TextEncoder();
        const keyData = typeof key === 'string' ? encoder.encode(key) : key;
        const messageData = encoder.encode(message);

        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign(
            'HMAC',
            cryptoKey,
            messageData
        );

        if (outputFormat === 'hex') {
            return Array.from(new Uint8Array(signature))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }

        return signature;
    }

    /**
     * Безопасное получение пользователя
     */
    async getAuthenticatedUser(initData) {
        const isValid = await this.validateInitData(initData);

        if (!isValid) {
            throw new Error('Invalid authentication data');
        }

        const params = new URLSearchParams(initData);
        const userJson = params.get('user');

        if (!userJson) {
            throw new Error('No user data');
        }

        return JSON.parse(userJson);
    }
}

// Backend проверка (Node.js)
const crypto = require('crypto');

function validateTelegramWebAppData(initData, botToken) {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

    const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    return calculatedHash === hash;
}
```

### 2. Content Security Policy

```javascript
// Установка CSP headers (на сервере)
const cspDirectives = {
    "default-src": ["'self'"],
    "script-src": [
        "'self'",
        "https://telegram.org",
        "https://cdnjs.cloudflare.com",
        "'unsafe-inline'", // Только если необходимо
        "'unsafe-eval'"   // Для Monaco Editor
    ],
    "style-src": [
        "'self'",
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com"
    ],
    "img-src": [
        "'self'",
        "data:",
        "https:",
        "blob:"
    ],
    "font-src": [
        "'self'",
        "https://cdnjs.cloudflare.com"
    ],
    "connect-src": [
        "'self'",
        "https://api.telegram.org",
        "https://your-backend-api.com"
    ],
    "frame-ancestors": [
        "https://web.telegram.org"
    ]
};

const csp = Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

// В HTML
// <meta http-equiv="Content-Security-Policy" content="${csp}">
```

### 3. Безопасное хранение данных

```javascript
class SecureStorage {
    constructor() {
        this.encryptionKey = null;
    }

    async init(password) {
        // Создаем ключ шифрования из пароля пользователя
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        this.encryptionKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode('telegram-miniapp-salt'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }

    async encrypt(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));

        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            this.encryptionKey,
            dataBuffer
        );

        // Объединяем IV и зашифрованные данные
        const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedBuffer), iv.length);

        // Конвертируем в base64
        return btoa(String.fromCharCode(...combined));
    }

    async decrypt(encryptedData) {
        // Декодируем из base64
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

        // Извлекаем IV и данные
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);

        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            this.encryptionKey,
            data
        );

        const decoder = new TextDecoder();
        const decryptedString = decoder.decode(decryptedBuffer);
        return JSON.parse(decryptedString);
    }

    async saveSecure(key, value) {
        const encrypted = await this.encrypt(value);
        localStorage.setItem(`secure_${key}`, encrypted);
    }

    async loadSecure(key) {
        const encrypted = localStorage.getItem(`secure_${key}`);
        if (!encrypted) return null;

        try {
            return await this.decrypt(encrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }
}
```

---

## 🚀 Развертывание и масштабирование

### 1. Progressive Web App (PWA)

```javascript
// service-worker.js
const CACHE_NAME = 'telegram-miniapp-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/app.js',
    '/js/telegram.js',
    '/assets/logo.png'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Кеширование и возврат запросов
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Возвращаем из кеша или загружаем с сети
                if (response) {
                    return response;
                }

                return fetch(event.request).then((response) => {
                    // Проверяем, валидный ли ответ
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Клонируем ответ
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Обновление Service Worker
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
```

```json
// manifest.json
{
    "name": "Decentralized AI Academy",
    "short_name": "AI Academy",
    "description": "Learn Distributed AI with interactive lessons",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#0f172a",
    "theme_color": "#667eea",
    "orientation": "portrait",
    "icons": [
        {
            "src": "/assets/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/assets/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

### 2. Backend архитектура

```javascript
// API для обучающей платформы (Node.js + Express)

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(cors({
    origin: 'https://your-telegram-miniapp.com',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // Максимум 100 запросов
    message: 'Too many requests from this IP'
});

app.use('/api/', limiter);

// Аутентификация middleware
const authenticateTelegram = async (req, res, next) => {
    const initData = req.headers['x-telegram-init-data'];

    if (!initData) {
        return res.status(401).json({ error: 'No auth data' });
    }

    const isValid = validateTelegramWebAppData(initData, process.env.BOT_TOKEN);

    if (!isValid) {
        return res.status(401).json({ error: 'Invalid auth data' });
    }

    // Извлекаем пользователя
    const params = new URLSearchParams(initData);
    req.telegramUser = JSON.parse(params.get('user'));

    next();
};

// API endpoints

// Получить прогресс пользователя
app.get('/api/progress', authenticateTelegram, async (req, res) => {
    try {
        const userId = req.telegramUser.id;
        const progress = await db.getUserProgress(userId);

        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Сохранить прогресс урока
app.post('/api/lessons/:lessonId/progress', authenticateTelegram, async (req, res) => {
    try {
        const userId = req.telegramUser.id;
        const { lessonId } = req.params;
        const { progress, score, timeSpent } = req.body;

        await db.saveLessonProgress({
            userId,
            lessonId,
            progress,
            score,
            timeSpent,
            completedAt: progress >= 100 ? new Date() : null
        });

        // Обновить XP и достижения
        await updateUserXP(userId, lessonId, score);
        await checkAchievements(userId);

        res.json({
            success: true,
            message: 'Progress saved'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Выполнить код
app.post('/api/execute', authenticateTelegram, async (req, res) => {
    try {
        const { code, language } = req.body;

        // Безопасное выполнение в изолированной среде (Docker)
        const result = await executeCodeInSandbox({
            code,
            language,
            timeout: 5000,
            memoryLimit: '128MB'
        });

        res.json({
            success: true,
            output: result.output,
            error: result.error,
            executionTime: result.executionTime
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Execution failed'
        });
    }
});

// Leaderboard
app.get('/api/leaderboard', authenticateTelegram, async (req, res) => {
    try {
        const top100 = await db.getTopUsers(100);
        const userId = req.telegramUser.id;
        const userRank = await db.getUserRank(userId);

        res.json({
            success: true,
            data: {
                top: top100,
                user: userRank
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(3000, () => {
    console.log('API server running on port 3000');
});
```

### 3. Docker deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем приложение
COPY . .

# Build frontend если нужно
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Start app
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - BOT_TOKEN=${BOT_TOKEN}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=telegram_miniapp
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## ✅ Best Practices

### 1. Чеклист перед запуском

```markdown
## 🔍 Pre-Launch Checklist

### Функциональность
- [ ] Все основные функции работают
- [ ] Обработка ошибок реализована
- [ ] Offline режим поддерживается
- [ ] Данные синхронизируются с облаком

### Производительность
- [ ] Первая отрисовка < 2 секунд
- [ ] Интерактивность < 3 секунд
- [ ] Lazy loading для тяжелых компонентов
- [ ] Изображения оптимизированы
- [ ] Service Worker настроен

### Безопасность
- [ ] Валидация Telegram данных
- [ ] CSP настроен
- [ ] HTTPS обязателен
- [ ] Нет XSS уязвимостей
- [ ] Rate limiting настроен

### UX
- [ ] Адаптивный дизайн для всех экранов
- [ ] Haptic feedback настроен
- [ ] Анимации плавные (60 FPS)
- [ ] Loading states везде
- [ ] Error states информативные

### Telegram интеграция
- [ ] MainButton работает корректно
- [ ] BackButton работает
- [ ] Тема Telegram применяется
- [ ] Cloud Storage используется
- [ ] Ссылки открываются в Telegram

### Аналитика
- [ ] События трекаются
- [ ] Ошибки логируются
- [ ] Пользовательское поведение анализируется

### Тестирование
- [ ] Тесты написаны
- [ ] Все тесты проходят
- [ ] Протестировано на реальных устройствах
- [ ] Протестировано в Telegram iOS
- [ ] Протестировано в Telegram Android
- [ ] Протестировано в Telegram Desktop
```

### 2. Мониторинг и аналитика

```javascript
class Analytics {
    constructor(telegramUser) {
        this.user = telegramUser;
        this.sessionStart = Date.now();
    }

    // Трекинг событий
    trackEvent(category, action, label = '', value = 0) {
        const event = {
            category,
            action,
            label,
            value,
            userId: this.user?.id,
            timestamp: Date.now(),
            sessionDuration: Date.now() - this.sessionStart,
            platform: this.getPlatform()
        };

        // Отправка на backend
        this.sendToBackend('/api/analytics/event', event);

        // Логирование в консоль для разработки
        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Event:', event);
        }
    }

    // Трекинг ошибок
    trackError(error, context = {}) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            context,
            userId: this.user?.id,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Отправка на backend
        this.sendToBackend('/api/analytics/error', errorData);

        // Логирование
        console.error('❌ Error tracked:', errorData);
    }

    // Трекинг времени
    trackTiming(category, variable, time) {
        const timing = {
            category,
            variable,
            time,
            userId: this.user?.id,
            timestamp: Date.now()
        };

        this.sendToBackend('/api/analytics/timing', timing);
    }

    getPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.includes('android')) return 'android';
        if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
        if (userAgent.includes('mac')) return 'macos';
        if (userAgent.includes('win')) return 'windows';
        if (userAgent.includes('linux')) return 'linux';

        return 'unknown';
    }

    async sendToBackend(endpoint, data) {
        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            // Сохраняем локально если не удалось отправить
            this.saveOffline(endpoint, data);
        }
    }

    saveOffline(endpoint, data) {
        const queue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
        queue.push({ endpoint, data, timestamp: Date.now() });
        localStorage.setItem('analytics_queue', JSON.stringify(queue));
    }

    async syncOfflineData() {
        const queue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');

        for (const item of queue) {
            try {
                await this.sendToBackend(item.endpoint, item.data);
            } catch (error) {
                // Оставляем в очереди
                continue;
            }
        }

        // Очищаем очередь
        localStorage.setItem('analytics_queue', '[]');
    }
}

// Глобальная обработка ошибок
window.addEventListener('error', (event) => {
    analytics.trackError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// Promise rejections
window.addEventListener('unhandledrejection', (event) => {
    analytics.trackError(event.reason, {
        type: 'unhandled_promise'
    });
});
```

### 3. Тестирование

```javascript
// tests/app.test.js
describe('TelegramMiniApp', () => {
    let app;

    beforeEach(() => {
        // Mock Telegram Web App
        window.Telegram = {
            WebApp: {
                ready: jest.fn(),
                expand: jest.fn(),
                MainButton: {
                    setText: jest.fn(),
                    show: jest.fn(),
                    hide: jest.fn()
                },
                BackButton: {
                    onClick: jest.fn()
                }
            }
        };

        app = new TelegramMiniApp();
    });

    test('should initialize correctly', async () => {
        await app.init();

        expect(app.isReady).toBe(true);
        expect(window.Telegram.WebApp.ready).toHaveBeenCalled();
        expect(window.Telegram.WebApp.expand).toHaveBeenCalled();
    });

    test('should save progress', async () => {
        const lessonId = 'lesson-1';
        const progress = 75;

        await app.saveProgress(lessonId, progress);

        const saved = await app.loadProgress(lessonId);
        expect(saved.progress).toBe(progress);
    });

    test('should handle errors gracefully', async () => {
        const errorHandler = jest.fn();
        app.on('error', errorHandler);

        await app.loadLesson('non-existent');

        expect(errorHandler).toHaveBeenCalled();
    });
});
```

---

## 📚 Дополнительные ресурсы

### Документация
- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Web App Examples](https://github.com/Telegram-Mini-Apps)

### Инструменты
- **Monaco Editor** - Редактор кода в браузере
- **Pyodide** - Python в WebAssembly
- **Three.js** - 3D визуализация
- **Chart.js** - Графики и диаграммы
- **Marked** - Markdown парсер

### Best Practices
1. **Всегда проверяйте** данные от Telegram на backend
2. **Используйте Cloud Storage** для хранения прогресса
3. **Реализуйте offline режим** для лучшего UX
4. **Оптимизируйте производительность** - первая отрисовка критична
5. **Применяйте тему Telegram** для нативного вида
6. **Добавьте haptic feedback** для интерактивности
7. **Логируйте аналитику** для понимания пользователей

---

## 🎯 Заключение

Профессиональный Telegram Mini App для обучающей платформы должен:

1. **Быть быстрым** - первая загрузка < 2 сек
2. **Быть безопасным** - валидация данных, CSP, HTTPS
3. **Быть удобным** - адаптивный, с haptic feedback
4. **Быть надежным** - offline режим, error handling
5. **Быть масштабируемым** - модульная архитектура
6. **Быть интерактивным** - геймификация, прогресс трекинг

Следуя этим рекомендациям, вы создадите качественную обучающую платформу, которая будет радовать пользователей!

---

**Автор**: AI Development Team
**Дата**: 2025-11-15
**Версия**: 1.0

