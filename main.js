// TradeBots Kenya - Main JavaScript File
class TradeBotApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.botStatus = 'active';
        this.isLoading = false;
        this.notifications = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateTime();
        this.loadUserPreferences();
        this.initializeCharts();
        this.startStatusUpdates();
        
        // Show welcome message
        setTimeout(() => {
            this.showToast('Welcome to TradeBots Kenya!', 'success');
        }, 1000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Bot Controls
        document.getElementById('startBot').addEventListener('click', () => this.startBot());
        document.getElementById('stopBot').addEventListener('click', () => this.stopBot());
        document.getElementById('pauseBot').addEventListener('click', () => this.pauseBot());

        // Schedule Management
        document.getElementById('saveSchedule').addEventListener('click', () => this.saveSchedule());
        document.getElementById('autoSchedule').addEventListener('change', (e) => {
            this.toggleAutoSchedule(e.target.checked);
        });

        // Settings
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        
        // Day schedule toggles
        document.querySelectorAll('.day-item .switch input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.toggleDaySchedule(e.target.closest('.day-item'), e.target.checked);
            });
        });

        // Slider updates
        document.querySelectorAll('.setting-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const valueSpan = e.target.parentNode.querySelector('.slider-value');
                if (valueSpan) {
                    valueSpan.textContent = e.target.value + '%';
                }
            });
        });

        // Notifications
        document.getElementById('notificationBtn').addEventListener('click', () => {
            this.showNotifications();
        });

        // Profile
        document.getElementById('profileBtn').addEventListener('click', () => {
            this.showProfile();
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        // Add animation
        document.getElementById(tabName).classList.add('fade-in');

        this.currentTab = tabName;

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch(tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'scheduler':
                this.loadScheduleData();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // Bot Control Methods
    async startBot() {
        if (this.botStatus === 'active') {
            this.showToast('Bot is already running', 'warning');
            return;
        }

        this.showLoading('Starting bot...');
        
        try {
            // Simulate API call
            await this.simulateApiCall(2000);
            
            this.botStatus = 'active';
            this.updateBotStatus();
            this.showToast('Bot started successfully!', 'success');
            
            // Update dashboard
            this.updateDashboard();
        } catch (error) {
            this.showToast('Failed to start bot', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async stopBot() {
        if (this.botStatus === 'inactive') {
            this.showToast('Bot is already stopped', 'warning');
            return;
        }

        this.showLoading('Stopping bot...');
        
        try {
            await this.simulateApiCall(1500);
            
            this.botStatus = 'inactive';
            this.updateBotStatus();
            this.showToast('Bot stopped successfully', 'success');
            
            this.updateDashboard();
        } catch (error) {
            this.showToast('Failed to stop bot', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async pauseBot() {
        if (this.botStatus === 'paused') {
            this.showToast('Bot is already paused', 'warning');
            return;
        }

        this.showLoading('Pausing bot...');
        
        try {
            await this.simulateApiCall(1000);
            
            this.botStatus = 'paused';
            this.updateBotStatus();
            this.showToast('Bot paused', 'success');
            
            this.updateDashboard();
        } catch (error) {
            this.showToast('Failed to pause bot', 'error');
        } finally {
            this.hideLoading();
        }
    }

    updateBotStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusDot = document.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('span:last-child');

        statusIndicator.className = `status-indicator ${this.botStatus}`;
        
        switch(this.botStatus) {
            case 'active':
                statusText.textContent = 'Active';
                statusDot.style.background = 'var(--success-color)';
                break;
            case 'paused':
                statusText.textContent = 'Paused';
                statusDot.style.background = 'var(--warning-color)';
                break;
            case 'inactive':
                statusText.textContent = 'Inactive';
                statusDot.style.background = 'var(--text-muted)';
                break;
        }
    }

    // Dashboard Methods
    updateDashboard() {
        const data = this.generateDashboardData();
        
        // Update status items
        document.querySelector('.status-item:nth-child(1) .value').textContent = 
            this.botStatus === 'active' ? this.formatTime(new Date()) : '--:--';
        
        document.querySelector('.status-item:nth-child(2) .value').textContent = 
            this.botStatus === 'active' ? Math.floor(Math.random() * 10) + 3 : '0';
        
        const plValue = document.querySelector('.status-item:nth-child(3) .value');
        const randomPL = (Math.random() * 5000 - 1000).toFixed(0);
        plValue.textContent = `${randomPL > 0 ? '+' : ''}KES ${Math.abs(randomPL).toLocaleString()}`;
        plValue.className = `value ${randomPL > 0 ? 'positive' : 'negative'}`;
    }

    generateDashboardData() {
        return {
            activeTrades: Math.floor(Math.random() * 10) + 1,
            todaysPL: (Math.random() * 5000 - 1000).toFixed(0),
            runningTime: this.formatTime(new Date())
        };
    }

    // Schedule Methods
    async saveSchedule() {
        this.showLoading('Saving schedule...');
        
        try {
            const scheduleData = this.collectScheduleData();
            await this.simulateApiCall(1500);
            
            localStorage.setItem('botSchedule', JSON.stringify(scheduleData));
            this.showToast('Schedule saved successfully!', 'success');
        } catch (error) {
            this.showToast('Failed to save schedule', 'error');
        } finally {
            this.hideLoading();
        }
    }

    collectScheduleData() {
        const schedule = {
            autoSchedule: document.getElementById('autoSchedule').checked,
            days: {}
        };

        document.querySelectorAll('.day-item').forEach(item => {
            const dayName = item.querySelector('.day-name').textContent.toLowerCase();
            const enabled = item.querySelector('.switch input').checked;
            const startTime = item.querySelector('.time-input:first-of-type').value;
            const endTime = item.querySelector('.time-input:last-of-type').value;
            
            schedule.days[dayName] = {
                enabled,
                startTime,
                endTime
            };
        });

        return schedule;
    }

    loadScheduleData() {
        const saved = localStorage.getItem('botSchedule');
        if (saved) {
            const schedule = JSON.parse(saved);
            document.getElementById('autoSchedule').checked = schedule.autoSchedule;
            
            Object.keys(schedule.days).forEach(day => {
                const dayItem = Array.from(document.querySelectorAll('.day-item'))
                    .find(item => item.querySelector('.day-name').textContent.toLowerCase() === day);
                
                if (dayItem) {
                    const data = schedule.days[day];
                    dayItem.querySelector('.switch input').checked = data.enabled;
                    dayItem.querySelector('.time-input:first-of-type').value = data.startTime;
                    dayItem.querySelector('.time-input:last-of-type').value = data.endTime;
                    
                    this.toggleDaySchedule(dayItem, data.enabled);
                }
            });
        }
    }

    toggleAutoSchedule(enabled) {
        const message = enabled ? 
            'Auto-schedule enabled based on market volatility' : 
            'Manual schedule mode activated';
        this.showToast(message, 'success');
    }

    toggleDaySchedule(dayItem, enabled) {
        const timeInputs = dayItem.querySelector('.time-inputs');
        const inputs = dayItem.querySelectorAll('.time-input');
        
        if (enabled) {
            timeInputs.classList.remove('disabled');
            inputs.forEach(input => input.disabled = false);
        } else {
            timeInputs.classList.add('disabled');
            inputs.forEach(input => input.disabled = true);
        }
    }

    // Analytics Methods
    loadAnalytics() {
        this.updateMetrics();
        this.animateChart();
    }

    updateMetrics() {
        const metrics = this.generateAnalyticsData();
        
        // Update metric values with animation
        setTimeout(() => {
            document.querySelector('.metric-card:nth-child(1) .metric-value').textContent = 
                `KES ${metrics.totalProfit.toLocaleString()}`;
            document.querySelector('.metric-card:nth-child(2) .metric-value').textContent = 
                metrics.totalTrades;
            document.querySelector('.metric-card:nth-child(3) .metric-value').textContent = 
                `${metrics.winRate}%`;
        }, 300);
    }

    generateAnalyticsData() {
        return {
            totalProfit: Math.floor(Math.random() * 100000) + 10000,
            totalTrades: Math.floor(Math.random() * 500) + 50,
            winRate: (Math.random() * 30 + 60).toFixed(1)
        };
    }

    animateChart() {
        const bars = document.querySelectorAll('.chart-bar');
        bars.forEach((bar, index) => {
            setTimeout(() => {
                bar.style.transform = 'scaleY(0)';
                setTimeout(() => {
                    bar.style.transform = 'scaleY(1)';
                }, 100);
            }, index * 200);
        });
    }

    // Settings Methods
    async saveSettings() {
        this.showLoading('Saving settings...');
        
        try {
            const settings = this.collectSettings();
            await this.simulateApiCall(1500);
            
            localStorage.setItem('botSettings', JSON.stringify(settings));
            this.showToast('Settings saved successfully!', 'success');
        } catch (error) {
            this.showToast('Failed to save settings', 'error');
        } finally {
            this.hideLoading();
        }
    }

    collectSettings() {
        return {
            riskLevel: document.querySelector('.setting-group:nth-child(1) select').value,
            maxDailyLoss: document.querySelector('input[type="number"]').value,
            positionSize: document.querySelector('.setting-slider').value,
            notifications: {
                tradeAlerts: document.querySelector('.setting-group:nth-child(2) .switch:nth-child(1) input').checked,
                dailySummary: document.querySelector('.setting-group:nth-child(2) .switch:nth-child(2) input').checked,
                marketHours: document.querySelector('.setting-group:nth-child(2) .switch:nth-child(3) input').checked
            },
            timeZone: document.querySelector('.setting-group:nth-child(3) select').value
        };
    }

    loadSettings() {
        const saved = localStorage.getItem('botSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            
            // Apply saved settings to UI
            document.querySelector('.setting-group:nth-child(1) select').value = settings.riskLevel;
            document.querySelector('input[type="number"]').value = settings.maxDailyLoss;
            document.querySelector('.setting-slider').value = settings.positionSize;
            
            if (settings.notifications) {
                document.querySelector('.setting-group:nth-child(2) .switch:nth-child(1) input').checked = 
                    settings.notifications.tradeAlerts;
                document.querySelector('.setting-group:nth-child(2) .switch:nth-child(2) input').checked = 
                    settings.notifications.dailySummary;
                document.querySelector('.setting-group:nth-child(2) .switch:nth-child(3) input').checked = 
                    settings.notifications.marketHours;
            }
        }
    }

    // Utility Methods
    formatTime(date) {
        return date.toLocaleTimeString('en-KE', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Africa/Nairobi'
        });
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = overlay.querySelector('p');
        text.textContent = message;
        overlay.classList.add('show');
        this.isLoading = true;
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
        this.isLoading = false;
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }

    showNotifications() {
        this.showToast('3 new notifications available', 'info');
    }

    showProfile() {
        this.showToast('Profile settings coming soon', 'info');
    }

    simulateApiCall(delay) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate occasional failures
                if (Math.random() < 0.1) {
                    reject(new Error('API call failed'));
                } else {
                    resolve();
                }
            }, delay);
        });
    }

    updateTime() {
        // Update time displays periodically
        setInterval(() => {
            if (this.botStatus === 'active') {
                this.updateDashboard();
            }
        }, 60000); // Update every minute
    }

    loadUserPreferences() {
        // Load theme preference
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    initializeCharts() {
        // Add hover effects to chart bars
        document.querySelectorAll('.chart-bar').forEach(bar => {
            bar.addEventListener('mouseenter', () => {
                const hour = bar.dataset.hour;
                this.showToast(`Trading performance at ${hour} EAT`, 'info');
            });
        });
    }

    startStatusUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            if (this.botStatus === 'active') {
                // Update random metrics
                this.updateDashboard();
                
                // Occasionally show trading notifications
                if (Math.random() < 0.1) {
                    const trades = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'];
                    const trade = trades[Math.floor(Math.random() * trades.length)];
                    const action = Math.random() < 0.5 ? 'Buy' : 'Sell';
                    this.showToast(`${action} order executed: ${trade}`, 'success');
                }
            }
        }, 30000); // Update every 30 seconds
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tradeBotApp = new TradeBotApp();
});

// Handle online/offline status
window.addEventListener('online', () => {
    window.tradeBotApp?.showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    window.tradeBotApp?.showToast('Connection lost - running in offline mode', 'warning');
});

// Handle app visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // App went to background
        console.log('App backgrounded');
    } else {
        // App came to foreground
        if (window.tradeBotApp) {
            window.tradeBotApp.updateDashboard();
        }
    }
});