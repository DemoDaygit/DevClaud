/**
 * ContentManager - Система управления обучающим контентом
 * Загружает структурированные уроки из JSON файлов
 * Поддерживает адаптивное обучение, геймификацию и аналитику
 */

export class ContentManager {
    constructor(lang = 'ru') {
        this.currentLanguage = lang;
        this.curriculum = null;
        this.lessons = new Map();
        this.microlessons = new Map();
        this.projects = new Map();
        this.userProgress = null;
        this.cache = new Map();
    }

    /**
     * Инициализация - загрузка учебной программы
     */
    async init() {
        try {
            // Загружаем главную конфигурацию
            this.curriculum = await this.loadJSON('/academy/config/curriculum.json');

            console.log('✅ Curriculum loaded:', {
                version: this.curriculum.version,
                modules: this.curriculum.modules.length,
                pathways: this.curriculum.pathways.length
            });

            return true;
        } catch (error) {
            console.error('❌ Failed to load curriculum:', error);
            throw error;
        }
    }

    /**
     * Загрузка JSON файла с кешированием
     */
    async loadJSON(url) {
        // Проверяем кеш
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.cache.set(url, data);
            return data;
        } catch (error) {
            console.error(`Failed to load ${url}:`, error);
            throw error;
        }
    }

    /**
     * Получить локализованный текст
     */
    t(obj) {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        return obj[this.currentLanguage] || obj['en'] || '';
    }

    /**
     * Загрузить урок по ID
     */
    async loadLesson(lessonId) {
        // Проверяем кеш
        if (this.lessons.has(lessonId)) {
            return this.lessons.get(lessonId);
        }

        try {
            const lesson = await this.loadJSON(`/academy/content/lessons/${lessonId}.json`);
            this.lessons.set(lessonId, lesson);
            return lesson;
        } catch (error) {
            console.error(`Failed to load lesson ${lessonId}:`, error);
            return null;
        }
    }

    /**
     * Получить модуль по ID
     */
    getModule(moduleId) {
        return this.curriculum.modules.find(m => m.id === moduleId);
    }

    /**
     * Получить путь обучения
     */
    getPathway(pathwayId) {
        return this.curriculum.pathways.find(p => p.id === pathwayId);
    }

    /**
     * Получить все уроки модуля
     */
    async getModuleLessons(moduleId) {
        const module = this.getModule(moduleId);
        if (!module) return [];

        const lessons = await Promise.all(
            module.lessons.map(lid => this.loadLesson(lid))
        );

        return lessons.filter(l => l !== null);
    }

    /**
     * Получить рекомендованный следующий урок
     */
    async getNextLesson(currentLessonId) {
        const currentLesson = await this.loadLesson(currentLessonId);
        if (!currentLesson) return null;

        // Адаптивность на основе успеха
        const userScore = this.getUserScore(currentLessonId);

        if (currentLesson.adaptivity) {
            if (userScore >= 90 && currentLesson.adaptivity.onSuccess) {
                const next = currentLesson.adaptivity.onSuccess.nextRecommended;
                return next ? await this.loadLesson(next[0]) : null;
            }

            if (userScore < 70 && currentLesson.adaptivity.onStruggle) {
                const review = currentLesson.adaptivity.onStruggle.recommendations;
                return review ? await this.loadLesson(review[0]) : null;
            }
        }

        // Простая последовательная навигация
        const module = this.getModule(currentLesson.moduleId);
        if (!module) return null;

        const currentIndex = module.lessons.indexOf(currentLessonId);
        if (currentIndex === -1 || currentIndex === module.lessons.length - 1) {
            return null;
        }

        return await this.loadLesson(module.lessons[currentIndex + 1]);
    }

    /**
     * Рендер контента урока
     */
    async renderLesson(lessonId, containerId) {
        const lesson = await this.loadLesson(lessonId);
        if (!lesson) {
            console.error('Lesson not found:', lessonId);
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        // Отслеживание начала урока
        this.trackLessonStart(lessonId);

        // Генерация HTML
        const html = this.generateLessonHTML(lesson);
        container.innerHTML = html;

        // Инициализация интерактивных компонентов
        this.initInteractiveComponents(lesson, container);

        // Возвращаем объект урока для дополнительной работы
        return lesson;
    }

    /**
     * Генерация HTML для урока
     */
    generateLessonHTML(lesson) {
        const content = lesson.content;

        return `
            <div class="lesson-container" data-lesson-id="${lesson.id}">
                <!-- Header -->
                <div class="lesson-header">
                    <div class="lesson-meta">
                        <span class="lesson-type">${this.getLessonTypeIcon(lesson.type)} ${this.t(lesson.type)}</span>
                        <span class="lesson-difficulty difficulty-${lesson.difficulty}">${lesson.difficulty}</span>
                        <span class="lesson-duration">⏱️ ${Math.round(lesson.estimatedDuration / 60)} мин</span>
                    </div>
                    <h1 class="lesson-title">${this.t(lesson.title)}</h1>
                    <p class="lesson-description">${this.t(lesson.description)}</p>
                </div>

                <!-- Intro -->
                <div class="lesson-intro">
                    <div class="hook">
                        ${this.t(content.intro.hook)}
                    </div>
                    ${content.intro.problem ? `
                        <div class="problem-statement">
                            <h3>🎯 Проблема</h3>
                            <p>${this.t(content.intro.problem)}</p>
                        </div>
                    ` : ''}
                    <div class="overview">
                        ${this.t(content.intro.overview)}
                    </div>
                    ${content.intro.whatYouWillLearn ? `
                        <div class="learning-objectives">
                            <h3>📋 Что вы узнаете:</h3>
                            <ul>
                                ${this.t(content.intro.whatYouWillLearn).map(item =>
                                    `<li>${item}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>

                <!-- Sections -->
                <div class="lesson-content">
                    ${content.sections.map((section, index) => this.renderSection(section, index, lesson)).join('')}
                </div>

                <!-- Summary -->
                <div class="lesson-summary">
                    <h2>📝 Итоги урока</h2>

                    <div class="key-takeaways">
                        <h3>🎯 Ключевые выводы</h3>
                        <ul>
                            ${this.t(content.summary.keyTakeaways).map(takeaway =>
                                `<li>${takeaway}</li>`
                            ).join('')}
                        </ul>
                    </div>

                    ${content.summary.reflectionQuestions ? `
                        <div class="reflection-questions">
                            <h3>🤔 Вопросы для размышления</h3>
                            <ul>
                                ${this.t(content.summary.reflectionQuestions).map(q =>
                                    `<li>${q}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    <div class="next-steps">
                        <h3>➡️ Что дальше?</h3>
                        <p>${this.t(content.summary.nextSteps)}</p>
                    </div>

                    ${content.summary.additionalResources ? `
                        <div class="additional-resources">
                            <h3>📚 Дополнительные материалы</h3>
                            ${this.renderResources(content.summary.additionalResources)}
                        </div>
                    ` : ''}
                </div>

                <!-- Activities -->
                ${lesson.activities ? this.renderActivities(lesson.activities) : ''}

                <!-- Navigation -->
                <div class="lesson-navigation">
                    <button class="btn btn-secondary" onclick="window.contentManager.previousLesson('${lesson.id}')">
                        ← Предыдущий урок
                    </button>
                    <button class="btn btn-primary" onclick="window.contentManager.completeLesson('${lesson.id}')">
                        Завершить урок ✓
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Рендер секции урока
     */
    renderSection(section, index, lesson) {
        const html = `
            <div class="lesson-section" id="section-${section.id}" data-section-index="${index}">
                <h2>${this.t(section.title)}</h2>

                <!-- Content -->
                <div class="section-content">
                    ${this.renderMarkdown(this.t(section.content))}
                </div>

                <!-- Media -->
                ${section.media ? this.renderMedia(section.media) : ''}

                <!-- Interactive Component -->
                ${section.interactive ? this.renderInteractive(section.interactive, lesson.id) : ''}

                <!-- Section Quiz/Activity -->
                ${this.renderSectionActivity(section, lesson)}
            </div>
        `;

        return html;
    }

    /**
     * Рендер медиа (изображения, видео, диаграммы)
     */
    renderMedia(media) {
        switch (media.type) {
            case 'image':
            case 'diagram':
                return `
                    <figure class="media-figure">
                        <img src="${media.url}" alt="${this.t(media.caption)}" loading="lazy">
                        <figcaption>${this.t(media.caption)}</figcaption>
                    </figure>
                `;

            case 'video':
                return `
                    <div class="media-video">
                        <video controls poster="${media.thumbnail}">
                            <source src="${media.url}" type="video/mp4">
                            ${media.captions ? '<track kind="captions" src="' + media.captions + '">' : ''}
                        </video>
                        ${media.duration ? `<span class="video-duration">⏱️ ${Math.round(media.duration / 60)} мин</span>` : ''}
                    </div>
                `;

            default:
                return '';
        }
    }

    /**
     * Рендер интерактивного компонента
     */
    renderInteractive(interactive, lessonId) {
        switch (interactive.type) {
            case 'poll':
                return this.renderPoll(interactive, lessonId);

            case 'comparison':
                return `
                    <div class="interactive-component" data-component="${interactive.component}">
                        <p>${this.t(interactive.description)}</p>
                        <div id="${interactive.component}-${lessonId}" class="interactive-container"></div>
                    </div>
                `;

            case 'decision-tree':
                return `
                    <div class="interactive-component" data-component="${interactive.component}">
                        <div id="${interactive.component}-${lessonId}" class="decision-tree-container"></div>
                    </div>
                `;

            default:
                return '';
        }
    }

    /**
     * Рендер опроса
     */
    renderPoll(poll, lessonId) {
        return `
            <div class="poll-component" data-poll-id="${lessonId}-poll">
                <h4>${this.t(poll.question)}</h4>
                <div class="poll-options">
                    ${this.t(poll.options).map((option, index) => `
                        <label class="poll-option">
                            <input type="radio" name="poll-${lessonId}" value="${index}">
                            <span>${option}</span>
                        </label>
                    `).join('')}
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.contentManager.submitPoll('${lessonId}')">
                    Отправить ответ
                </button>
                <div class="poll-results" id="poll-results-${lessonId}" style="display:none;"></div>
            </div>
        `;
    }

    /**
     * Рендер активностей (квизы, упражнения)
     */
    renderActivities(activities) {
        return `
            <div class="lesson-activities">
                ${activities.map(activity => {
                    switch (activity.type) {
                        case 'quiz':
                            return this.renderQuiz(activity);
                        case 'exercise':
                            return this.renderExercise(activity);
                        default:
                            return '';
                    }
                }).join('')}
            </div>
        `;
    }

    /**
     * Рендер квиза
     */
    renderQuiz(quizActivity) {
        return `
            <div class="quiz-activity" id="quiz-${quizActivity.id}">
                <h3>🧪 Проверьте свои знания</h3>
                <p>Passing score: ${quizActivity.passingScore}%</p>

                <button class="btn btn-primary" onclick="window.contentManager.startQuiz('${quizActivity.id}')">
                    Начать тест
                </button>

                <div class="quiz-container" id="quiz-container-${quizActivity.id}" style="display:none;"></div>
            </div>
        `;
    }

    /**
     * Рендер упражнения
     */
    renderExercise(exerciseActivity) {
        return `
            <div class="exercise-activity" id="exercise-${exerciseActivity.id}">
                <h3>💻 ${this.t(exerciseActivity.title)}</h3>
                <p>${this.t(exerciseActivity.description)}</p>

                ${exerciseActivity.required ? '<span class="badge badge-required">Обязательное</span>' : ''}

                <button class="btn btn-primary" onclick="window.contentManager.startExercise('${exerciseActivity.id}')">
                    Начать упражнение
                </button>
            </div>
        `;
    }

    /**
     * Рендер дополнительных ресурсов
     */
    renderResources(resources) {
        return `
            <ul class="resources-list">
                ${resources.map(resource => `
                    <li class="resource-item resource-${resource.type}">
                        <a href="${resource.url}" target="_blank" rel="noopener">
                            ${this.getResourceIcon(resource.type)}
                            ${this.t(resource.title)}
                            ${resource.duration ? ` (${Math.round(resource.duration / 60)} мин)` : ''}
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    /**
     * Простой Markdown рендерер
     */
    renderMarkdown(markdown) {
        if (!markdown) return '';

        return markdown
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/```([^```]+)```/g, '<pre><code>$1</code></pre>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            .replace(/✅/g, '<span class="icon-check">✅</span>')
            .replace(/❌/g, '<span class="icon-cross">❌</span>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Инициализация интерактивных компонентов
     */
    initInteractiveComponents(lesson, container) {
        // Инициализация интерактивных компонентов после рендера
        lesson.content.sections.forEach(section => {
            if (section.interactive && section.interactive.component) {
                this.loadInteractiveComponent(
                    section.interactive.component,
                    `${section.interactive.component}-${lesson.id}`
                );
            }
        });
    }

    /**
     * Динамическая загрузка интерактивного компонента
     */
    async loadInteractiveComponent(componentName, containerId) {
        try {
            const component = await import(`./components/${componentName}.js`);
            const instance = new component.default(containerId, this);
            await instance.init();
        } catch (error) {
            console.warn(`Interactive component ${componentName} not found:`, error);
        }
    }

    /**
     * Вспомогательные методы
     */
    getLessonTypeIcon(type) {
        const icons = {
            'theory': '📚',
            'interactive': '🎮',
            'practice': '💻',
            'video': '🎥'
        };
        return icons[type] || '📄';
    }

    getResourceIcon(type) {
        const icons = {
            'article': '📄',
            'paper': '📝',
            'video': '🎥',
            'book': '📚',
            'course': '🎓'
        };
        return icons[type] || '🔗';
    }

    /**
     * Трекинг и аналитика
     */
    trackLessonStart(lessonId) {
        const event = {
            type: 'lesson_start',
            lessonId,
            timestamp: Date.now()
        };

        this.trackEvent(event);
    }

    trackLessonComplete(lessonId, score, timeSpent) {
        const event = {
            type: 'lesson_complete',
            lessonId,
            score,
            timeSpent,
            timestamp: Date.now()
        };

        this.trackEvent(event);
    }

    trackEvent(event) {
        // Отправка на backend или сохранение локально
        console.log('📊 Event tracked:', event);

        // Сохраняем в localStorage для отладки
        const events = JSON.parse(localStorage.getItem('learning_events') || '[]');
        events.push(event);
        localStorage.setItem('learning_events', JSON.stringify(events));

        // TODO: Отправить на backend analytics service
        // await fetch('/api/analytics/event', { method: 'POST', body: JSON.stringify(event) });
    }

    /**
     * Управление прогрессом
     */
    getUserScore(lessonId) {
        // TODO: Получить из userProgress
        return 75; // Mock
    }

    async completeLesson(lessonId) {
        const lesson = await this.loadLesson(lessonId);
        if (!lesson) return;

        // Вычисляем score
        const score = this.calculateLessonScore(lessonId);
        const timeSpent = this.calculateTimeSpent(lessonId);

        // Отслеживаем завершение
        this.trackLessonComplete(lessonId, score, timeSpent);

        // Начисляем XP
        if (lesson.gamification) {
            this.awardXP(lesson.gamification.xp, lessonId);
        }

        // Показываем поздравление
        this.showCompletionModal(lesson, score);

        // Рекомендуем следующий урок
        const nextLesson = await this.getNextLesson(lessonId);
        if (nextLesson) {
            setTimeout(() => {
                this.offerNextLesson(nextLesson);
            }, 2000);
        }
    }

    calculateLessonScore(lessonId) {
        // TODO: Реализовать подсчет на основе квизов и активностей
        return 85;
    }

    calculateTimeSpent(lessonId) {
        // TODO: Реализовать трекинг времени
        return 600; // 10 минут
    }

    awardXP(amount, source) {
        console.log(`🎉 Awarded ${amount} XP for ${source}`);
        // TODO: Интеграция с системой XP
    }

    showCompletionModal(lesson, score) {
        // TODO: Показать красивое модальное окно с результатами
        alert(`Урок завершен!\n\nВаш результат: ${score}%\nПолучено XP: ${lesson.gamification?.xp?.base || 100}`);
    }

    offerNextLesson(nextLesson) {
        const proceed = confirm(`Следующий урок:\n${this.t(nextLesson.title)}\n\nПродолжить?`);
        if (proceed) {
            this.renderLesson(nextLesson.id, 'lesson-container');
        }
    }
}

// Глобальный экспорт для inline event handlers
if (typeof window !== 'undefined') {
    window.ContentManager = ContentManager;
}
