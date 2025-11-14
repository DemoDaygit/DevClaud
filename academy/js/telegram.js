/**
 * TelegramIntegration - Telegram Mini App Integration
 * Handles Telegram Web App API, user authentication, and community features
 */

export class TelegramIntegration {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.isInitialized = false;
        this.isTelegramEnvironment = false;

        // Mock data for testing outside Telegram
        this.mockUser = {
            id: 12345,
            first_name: 'Demo',
            last_name: 'User',
            username: 'demouser',
            language_code: 'en'
        };
    }

    init() {
        if (this.tg) {
            this.isTelegramEnvironment = true;
            this.setupTelegramApp();
        } else {
            console.warn('Not running in Telegram environment. Using demo mode.');
            this.setupDemoMode();
        }

        this.setupCommunityFeatures();
        this.isInitialized = true;
    }

    setupTelegramApp() {
        try {
            // Initialize Telegram Web App
            this.tg.ready();
            this.tg.expand();

            // Get user data
            this.user = this.tg.initDataUnsafe?.user;

            // Configure app appearance
            this.tg.setHeaderColor('#0f172a');
            this.tg.setBackgroundColor('#0f172a');

            // Setup main button
            this.tg.MainButton.setText('Continue Learning');
            this.tg.MainButton.color = '#667eea';
            this.tg.MainButton.textColor = '#ffffff';

            // Setup back button
            this.tg.BackButton.onClick(() => {
                this.handleBackButton();
            });

            // Listen for theme changes
            this.tg.onEvent('themeChanged', () => {
                this.handleThemeChange();
            });

            // Listen for viewport changes
            this.tg.onEvent('viewportChanged', () => {
                this.handleViewportChange();
            });

            // Setup close confirmation
            this.tg.enableClosingConfirmation();

            console.log('✅ Telegram Web App initialized', this.user);
        } catch (error) {
            console.error('Error initializing Telegram Web App:', error);
            this.setupDemoMode();
        }
    }

    setupDemoMode() {
        this.user = this.mockUser;
        console.log('Running in demo mode with mock user:', this.user);
    }

    setupCommunityFeatures() {
        // Setup community card click handlers
        this.setupCommunityCards();

        // Load recent activity
        this.loadRecentActivity();

        // Update user profile display
        this.updateUserDisplay();
    }

    setupCommunityCards() {
        const cards = document.querySelectorAll('.community-card button');

        cards.forEach((button, index) => {
            button.addEventListener('click', () => {
                const card = button.closest('.community-card');
                const cardTitle = card.querySelector('h3').textContent;

                switch (index) {
                    case 0: // Telegram Channel
                        this.openTelegramChannel();
                        break;
                    case 1: // Discussion Group
                        this.openDiscussionGroup();
                        break;
                    case 2: // AI Bot
                        this.openAIBot();
                        break;
                    case 3: // Leaderboard
                        this.showLeaderboard();
                        break;
                }
            });
        });
    }

    openTelegramChannel() {
        const channelUrl = 'https://t.me/DecentralizedAI_Academy';

        if (this.isTelegramEnvironment) {
            this.tg.openTelegramLink(channelUrl);
        } else {
            window.open(channelUrl, '_blank');
        }

        this.trackEvent('community', 'open_channel');
    }

    openDiscussionGroup() {
        const groupUrl = 'https://t.me/DecentralizedAI_Discussion';

        if (this.isTelegramEnvironment) {
            this.tg.openTelegramLink(groupUrl);
        } else {
            window.open(groupUrl, '_blank');
        }

        this.trackEvent('community', 'open_group');
    }

    openAIBot() {
        const botUrl = 'https://t.me/DecentralizedAI_Bot';

        if (this.isTelegramEnvironment) {
            this.tg.openTelegramLink(botUrl);
        } else {
            window.open(botUrl, '_blank');
        }

        this.trackEvent('community', 'open_bot');
    }

    showLeaderboard() {
        this.trackEvent('community', 'view_leaderboard');

        // Generate mock leaderboard
        const leaderboardData = this.generateLeaderboard();

        // Display in modal or popup
        this.showModal('Leaderboard', this.renderLeaderboard(leaderboardData));
    }

    generateLeaderboard() {
        return [
            { rank: 1, name: 'Alice', score: 2500, avatar: '👩‍💻' },
            { rank: 2, name: 'Bob', score: 2300, avatar: '👨‍💻' },
            { rank: 3, name: 'Carol', score: 2100, avatar: '👩‍🔬' },
            { rank: 4, name: 'David', score: 1900, avatar: '👨‍🔬' },
            { rank: 5, name: this.user?.first_name || 'You', score: 1500, avatar: '🎓', isCurrentUser: true },
            { rank: 6, name: 'Eve', score: 1200, avatar: '👩‍💼' },
            { rank: 7, name: 'Frank', score: 1000, avatar: '👨‍💼' },
        ];
    }

    renderLeaderboard(data) {
        return `
            <div class="leaderboard">
                <div class="leaderboard-header">
                    <h3>🏆 Top Learners</h3>
                    <p>Rankings based on completed exercises and achievements</p>
                </div>
                <div class="leaderboard-list">
                    ${data.map(user => `
                        <div class="leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}">
                            <div class="rank">#${user.rank}</div>
                            <div class="avatar">${user.avatar}</div>
                            <div class="user-info">
                                <div class="name">${user.name}</div>
                                <div class="score">${user.score} points</div>
                            </div>
                            ${user.rank <= 3 ? `<div class="medal">${['🥇', '🥈', '🥉'][user.rank - 1]}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    loadRecentActivity() {
        const activityFeed = document.getElementById('activity-feed');
        if (!activityFeed) return;

        // Generate mock activity data
        const activities = [
            {
                user: 'Alice',
                action: 'completed',
                target: 'Swarm Intelligence Exercise',
                time: '2 minutes ago',
                icon: '✅'
            },
            {
                user: 'Bob',
                action: 'started',
                target: 'Federated Learning Path',
                time: '15 minutes ago',
                icon: '🚀'
            },
            {
                user: 'Carol',
                action: 'achieved',
                target: 'First Deployment Badge',
                time: '1 hour ago',
                icon: '🏆'
            },
            {
                user: 'David',
                action: 'shared',
                target: 'Ray Cluster Configuration',
                time: '2 hours ago',
                icon: '💡'
            }
        ];

        activityFeed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <strong>${activity.user}</strong> ${activity.action} <em>${activity.target}</em>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    updateUserDisplay() {
        if (!this.user) return;

        // Update telegram connect button if user is authenticated
        const connectBtn = document.getElementById('telegram-connect');
        if (connectBtn && this.isTelegramEnvironment) {
            connectBtn.innerHTML = `
                <span>${this.user.first_name}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
            `;
        }
    }

    // Main Button Control
    showMainButton(text, onClick) {
        if (!this.isTelegramEnvironment) return;

        this.tg.MainButton.setText(text);
        this.tg.MainButton.onClick(onClick);
        this.tg.MainButton.show();
    }

    hideMainButton() {
        if (!this.isTelegramEnvironment) return;
        this.tg.MainButton.hide();
    }

    // Back Button Control
    showBackButton() {
        if (!this.isTelegramEnvironment) return;
        this.tg.BackButton.show();
    }

    hideBackButton() {
        if (!this.isTelegramEnvironment) return;
        this.tg.BackButton.hide();
    }

    handleBackButton() {
        // Navigate back in app
        const event = new CustomEvent('telegram-back');
        window.dispatchEvent(event);
    }

    // Theme Management
    handleThemeChange() {
        if (!this.isTelegramEnvironment) return;

        const theme = this.tg.themeParams;
        document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color);
        document.documentElement.style.setProperty('--tg-theme-text-color', theme.text_color);
        document.documentElement.style.setProperty('--tg-theme-hint-color', theme.hint_color);
        document.documentElement.style.setProperty('--tg-theme-link-color', theme.link_color);
        document.documentElement.style.setProperty('--tg-theme-button-color', theme.button_color);
        document.documentElement.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
    }

    handleViewportChange() {
        if (!this.isTelegramEnvironment) return;

        const { height, isExpanded } = this.tg.viewportHeight;
        console.log('Viewport changed:', { height, isExpanded });
    }

    // Haptic Feedback
    hapticFeedback(type = 'light') {
        if (!this.isTelegramEnvironment || !this.tg.HapticFeedback) return;

        switch (type) {
            case 'light':
                this.tg.HapticFeedback.impactOccurred('light');
                break;
            case 'medium':
                this.tg.HapticFeedback.impactOccurred('medium');
                break;
            case 'heavy':
                this.tg.HapticFeedback.impactOccurred('heavy');
                break;
            case 'success':
                this.tg.HapticFeedback.notificationOccurred('success');
                break;
            case 'warning':
                this.tg.HapticFeedback.notificationOccurred('warning');
                break;
            case 'error':
                this.tg.HapticFeedback.notificationOccurred('error');
                break;
        }
    }

    // Data Management
    sendData(data) {
        if (!this.isTelegramEnvironment) {
            console.log('Would send to bot:', data);
            return;
        }

        this.tg.sendData(JSON.stringify(data));
    }

    // Cloud Storage (Telegram Cloud Storage)
    async saveToCloud(key, value) {
        if (!this.isTelegramEnvironment) {
            localStorage.setItem(`tg_cloud_${key}`, JSON.stringify(value));
            return;
        }

        return new Promise((resolve, reject) => {
            this.tg.CloudStorage.setItem(key, JSON.stringify(value), (error, success) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(success);
                }
            });
        });
    }

    async loadFromCloud(key) {
        if (!this.isTelegramEnvironment) {
            const value = localStorage.getItem(`tg_cloud_${key}`);
            return value ? JSON.parse(value) : null;
        }

        return new Promise((resolve, reject) => {
            this.tg.CloudStorage.getItem(key, (error, value) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(value ? JSON.parse(value) : null);
                }
            });
        });
    }

    // Analytics & Tracking
    trackEvent(category, action, label = '', value = 0) {
        const event = {
            category,
            action,
            label,
            value,
            userId: this.user?.id,
            timestamp: Date.now()
        };

        // Send to analytics service or bot
        console.log('Track event:', event);

        // You could send this to your backend or Telegram bot
        // this.sendData({ type: 'analytics', event });
    }

    // Modal/Popup Helper
    showModal(title, content) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listener to close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Add to CSS if not already present
        if (!document.querySelector('style[data-modal]')) {
            const style = document.createElement('style');
            style.setAttribute('data-modal', 'true');
            style.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.2s;
                }
                .modal-content {
                    background: var(--bg-secondary);
                    border-radius: 16px;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    margin: 20px;
                    animation: slideUp 0.3s;
                }
                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid var(--bg-tertiary);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h2 {
                    margin: 0;
                    color: var(--text-primary);
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 32px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .modal-body {
                    padding: 20px;
                }
                .leaderboard-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .leaderboard-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px;
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                    transition: transform 0.2s;
                }
                .leaderboard-item:hover {
                    transform: translateX(4px);
                }
                .leaderboard-item.current-user {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }
                .leaderboard-item .rank {
                    font-size: 18px;
                    font-weight: bold;
                    color: var(--text-secondary);
                    min-width: 40px;
                }
                .leaderboard-item .avatar {
                    font-size: 32px;
                }
                .leaderboard-item .user-info {
                    flex: 1;
                }
                .leaderboard-item .name {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .leaderboard-item .score {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                .leaderboard-item .medal {
                    font-size: 24px;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Share functionality
    shareProgress(progress) {
        const message = `🎓 I've completed ${progress.completed}/${progress.total} exercises at Decentralized AI Academy!`;

        if (this.isTelegramEnvironment) {
            this.tg.shareMessage(message);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard?.writeText(message).then(() => {
                alert('Progress copied to clipboard!');
            });
        }

        this.trackEvent('social', 'share_progress', '', progress.completed);
    }

    // Get user info
    getUser() {
        return this.user;
    }

    // Check if running in Telegram
    isTelegram() {
        return this.isTelegramEnvironment;
    }
}
