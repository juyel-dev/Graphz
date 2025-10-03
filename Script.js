// graphz-core.js
class GraphzApp {
    constructor() {
        this.version = '2.1.0';
        this.config = {
            apiBaseUrl: 'https://api.graphz-learning.com/v1',
            maxFileSize: 10 * 1024 * 1024, // 10MB
            supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
            itemsPerPage: 24,
            defaultTheme: 'auto',
            enableAnalytics: true,
            offlineSupport: true
        };
        
        this.state = {
            currentUser: null,
            adminLoggedIn: false,
            currentTheme: 'light',
            searchQuery: '',
            activeFilters: {},
            currentView: 'grid',
            loading: false,
            online: navigator.onLine
        };

        this.modules = {};
        this.init();
    }

    async init() {
        try {
            // Initialize core modules
            await this.initializeModules();
            
            // Load user preferences
            await this.loadUserPreferences();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            // Initialize UI components
            this.initializeUI();
            
            console.log(`Graphz v${this.version} initialized successfully`);
            
        } catch (error) {
            console.error('Failed to initialize Graphz:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    async initializeModules() {
        // Initialize all modules
        this.modules = {
            search: new SearchEngine(this),
            graphManager: new GraphManager(this),
            quizEngine: new QuizEngine(this),
            userManager: new UserManager(this),
            adminPanel: new AdminPanel(this),
            analytics: new AnalyticsEngine(this),
            chartRenderer: new ChartRenderer(this),
            fileHandler: new FileHandler(this),
            notifications: new NotificationSystem(this),
            settings: new SettingsManager(this)
        };

        // Initialize each module
        for (const [name, module] of Object.entries(this.modules)) {
            if (module && typeof module.init === 'function') {
                await module.init();
            }
        }
    }

    setupEventListeners() {
        // Online/offline detection
        window.addEventListener('online', () => {
            this.state.online = true;
            this.modules.notifications.show('Connection restored', 'success');
        });

        window.addEventListener('offline', () => {
            this.state.online = false;
            this.modules.notifications.show('You are currently offline', 'warning');
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.modules.analytics.trackEvent('app', 'background', 'page_hidden');
            } else {
                this.modules.analytics.trackEvent('app', 'foreground', 'page_visible');
            }
        });

        // Error handling
        window.addEventListener('error', (e) => this.handleGlobalError(e));
        window.addEventListener('unhandledrejection', (e) => this.handlePromiseRejection(e));
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.modules.search.openSearch();
        }

        // Escape key to close modals
        if (e.key === 'Escape') {
            this.closeAllModals();
        }

        // Ctrl/Cmd + / for help
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.showHelp();
        }
    }

    handleGlobalError(error) {
        console.error('Global error:', error);
        this.modules.analytics.trackEvent('error', 'global', error.message);
        
        // Don't show error notification for common network errors
        if (!error.message.includes('Failed to fetch')) {
            this.modules.notifications.show('Something went wrong. Please try again.', 'error');
        }
    }

    handlePromiseRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        this.modules.analytics.trackEvent('error', 'promise_rejection', event.reason?.message);
    }

    async loadUserPreferences() {
        try {
            const preferences = this.modules.settings.loadUserPreferences();
            this.state.currentTheme = preferences.theme || this.config.defaultTheme;
            this.state.currentView = preferences.view || 'grid';
            this.config.itemsPerPage = preferences.itemsPerPage || 24;
            
            // Apply theme immediately
            this.applyTheme(this.state.currentTheme);
            
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    }

    applyTheme(theme) {
        const html = document.documentElement;
        
        // Remove existing theme classes
        html.classList.remove('theme-light', 'theme-dark');
        
        if (theme === 'auto') {
            // Use system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                html.classList.add('theme-dark');
                this.state.currentTheme = 'dark';
            } else {
                html.classList.add('theme-light');
                this.state.currentTheme = 'light';
            }
        } else {
            html.classList.add(`theme-${theme}`);
            this.state.currentTheme = theme;
        }
        
        // Save theme preference
        this.modules.settings.savePreference('theme', theme);
    }

    async loadInitialData() {
        try {
            // Load graphs data
            await this.modules.graphManager.loadGraphs();
            
            // Load user data if logged in
            if (this.state.currentUser) {
                await this.modules.userManager.loadUserData();
            }
            
            // Update UI with loaded data
            this.updateUI();
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            throw error;
        }
    }

    initializeUI() {
        // Initialize all UI components
        this.initializeNavigation();
        this.initializeSearch();
        this.initializeGallery();
        this.initializeModals();
        this.initializeAdminPanel();
        
        // Hide loading screen
        this.hideLoadingScreen();
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    updateUI() {
        // Update counters and stats
        this.updateCounters();
        
        // Refresh gallery if needed
        if (this.modules.graphManager) {
            this.modules.graphManager.refreshGallery();
        }
        
        // Update user interface elements
        this.updateUserInterface();
    }

    updateCounters() {
        // Update graph count
        const totalGraphs = this.modules.graphManager.getTotalGraphs();
        document.getElementById('totalGraphsCount')?.textContent = `${totalGraphs}+`;
        document.getElementById('totalGraphsAdmin')?.textContent = totalGraphs;
        
        // Update other counters as needed
        // This will be expanded based on actual data
    }

    updateUserInterface() {
        // Update based on user state
        if (this.state.currentUser) {
            this.showAuthenticatedUI();
        } else {
            this.showAnonymousUI();
        }
        
        // Update admin access
        if (this.state.adminLoggedIn) {
            this.showAdminUI();
        }
    }

    showAuthenticatedUI() {
        // Update user menu
        const userMenu = document.getElementById('userDropdown');
        if (userMenu) {
            userMenu.innerHTML = `
                <div class="user-info">
                    <span class="user-name">${this.state.currentUser.name}</span>
                    <span class="user-status">${this.state.currentUser.role}</span>
                </div>
                <div class="user-actions">
                    <button class="user-action-btn" id="profileBtn">
                        <i class="fas fa-user" aria-hidden="true"></i>
                        Profile
                    </button>
                    <button class="user-action-btn" id="logoutBtn">
                        <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
                        Logout
                    </button>
                </div>
            `;
        }
    }

    showAnonymousUI() {
        // Show login/register buttons
        const userMenu = document.getElementById('userDropdown');
        if (userMenu) {
            userMenu.innerHTML = `
                <div class="user-info">
                    <span class="user-name">Guest User</span>
                    <span class="user-status">Not signed in</span>
                </div>
                <div class="user-actions">
                    <button class="user-action-btn" id="loginBtn">
                        <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
                        Sign In
                    </button>
                    <button class="user-action-btn" id="registerBtn">
                        <i class="fas fa-user-plus" aria-hidden="true"></i>
                        Register
                    </button>
                </div>
            `;
        }
    }

    showAdminUI() {
        // Show admin link in navigation
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            adminLink.style.display = 'block';
        }
    }

    closeAllModals() {
        // Close all open modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.setAttribute('aria-hidden', 'true');
            modal.style.display = 'none';
        });
        
        // Close overlays
        const overlays = document.querySelectorAll('.modal-overlay');
        overlays.forEach(overlay => {
            overlay.style.display = 'none';
        });
    }

    showHelp() {
        this.modules.notifications.show(`
            <strong>Keyboard Shortcuts:</strong><br>
            Ctrl/Cmd + K - Open search<br>
            Ctrl/Cmd + / - Show this help<br>
            Escape - Close modals<br>
            Ctrl/Cmd + S - Save (in editors)
        `, 'info', 5000);
    }

    // Public API methods
    async searchGraphs(query, filters = {}) {
        return await this.modules.search.search(query, filters);
    }

    async getGraphById(id) {
        return await this.modules.graphManager.getGraphById(id);
    }

    async downloadGraph(graphId, format = 'original') {
        return await this.modules.graphManager.downloadGraph(graphId, format);
    }

    async startQuiz(quizId) {
        return await this.modules.quizEngine.startQuiz(quizId);
    }

    async submitFeedback(feedback) {
        return await this.modules.userManager.submitFeedback(feedback);
    }

    // Utility methods
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    debounce(func, wait) {
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

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Error handling
    showError(message, duration = 5000) {
        this.modules.notifications.show(message, 'error', duration);
    }

    showSuccess(message, duration = 3000) {
        this.modules.notifications.show(message, 'success', duration);
    }

    showWarning(message, duration = 4000) {
        this.modules.notifications.show(message, 'warning', duration);
    }

    showInfo(message, duration = 4000) {
        this.modules.notifications.show(message, 'info', duration);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.graphzApp = new GraphzApp();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GraphzApp;
          }
// search-engine.js
class SearchEngine {
    constructor(app) {
        this.app = app;
        this.index = new Map();
        this.searchHistory = new Set();
        this.suggestionsCache = new Map();
        this.lastSearchTime = 0;
        this.debounceDelay = 300;
        
        this.config = {
            maxSuggestions: 10,
            maxHistory: 50,
            minQueryLength: 2,
            fuzzyMatchThreshold: 0.6,
            weightMultipliers: {
                title: 10,
                aliases: 8,
                tags: 6,
                keywords: 4,
                description: 2,
                equation: 3
            }
        };
    }

    async init() {
        await this.buildSearchIndex();
        this.setupSearchListeners();
        this.loadSearchHistory();
    }

    async buildSearchIndex() {
        console.log('Building search index...');
        
        const graphs = this.app.modules.graphManager.getAllGraphs();
        
        for (const graph of graphs) {
            this.indexGraph(graph);
        }
        
        console.log(`Search index built with ${this.index.size} terms`);
    }

    indexGraph(graph) {
        // Index by title
        this.addToIndex(graph.title, graph.id, this.config.weightMultipliers.title);
        
        // Index by aliases
        graph.aliases?.forEach(alias => {
            this.addToIndex(alias, graph.id, this.config.weightMultipliers.aliases);
        });
        
        // Index by tags
        graph.tags?.forEach(tag => {
            this.addToIndex(tag, graph.id, this.config.weightMultipliers.tags);
        });
        
        // Index by keywords
        graph.keywords?.forEach(keyword => {
            this.addToIndex(keyword, graph.id, this.config.weightMultipliers.keywords);
        });
        
        // Index by description
        this.indexText(graph.description, graph.id, this.config.weightMultipliers.description);
        
        // Index by equation
        if (graph.equation) {
            this.addToIndex(graph.equation, graph.id, this.config.weightMultipliers.equation);
        }
    }

    addToIndex(term, graphId, weight = 1) {
        if (!term || typeof term !== 'string') return;
        
        const normalized = this.normalizeTerm(term);
        const words = normalized.split(/\s+/).filter(word => word.length >= 2);
        
        words.forEach(word => {
            if (!this.index.has(word)) {
                this.index.set(word, new Map());
            }
            
            const graphWeights = this.index.get(word);
            graphWeights.set(graphId, (graphWeights.get(graphId) || 0) + weight);
        });
    }

    indexText(text, graphId, weight = 1) {
        if (!text) return;
        
        const sentences = text.split(/[.!?]+/);
        sentences.forEach(sentence => {
            this.addToIndex(sentence.trim(), graphId, weight);
        });
    }

    normalizeTerm(term) {
        return term
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^\w\s\u0980-\u09FF]/g, ' ') // Keep Bengali characters
            .replace(/\s+/g, ' ')
            .trim();
    }

    setupSearchListeners() {
        const searchInput = document.getElementById('mainSearchInput');
        const globalSearchInput = document.getElementById('globalSearchInput');
        
        if (searchInput) {
            searchInput.addEventListener('input', 
                this.app.debounce((e) => this.handleSearchInput(e), this.debounceDelay)
            );
            
            searchInput.addEventListener('focus', () => this.showSearchSuggestions(''));
        }
        
        if (globalSearchInput) {
            globalSearchInput.addEventListener('input',
                this.app.debounce((e) => this.handleGlobalSearchInput(e), this.debounceDelay)
            );
        }
        
        // Search button events
        const searchBtn = document.getElementById('searchButton');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.performSearch();
            }
        });
    }

    async handleSearchInput(event) {
        const query = event.target.value.trim();
        
        if (query.length >= this.config.minQueryLength) {
            await this.showSearchSuggestions(query);
        } else {
            this.hideSearchSuggestions();
        }
    }

    async handleGlobalSearchInput(event) {
        const query = event.target.value.trim();
        
        if (query.length >= this.config.minQueryLength) {
            await this.showGlobalSearchSuggestions(query);
        } else {
            this.hideGlobalSearchSuggestions();
        }
    }

    async showSearchSuggestions(query) {
        const suggestions = await this.getSuggestions(query);
        this.renderSearchSuggestions(suggestions, query);
    }

    async showGlobalSearchSuggestions(query) {
        const suggestions = await this.getSuggestions(query);
        this.renderGlobalSearchSuggestions(suggestions, query);
    }

    async getSuggestions(query) {
        // Check cache first
        const cacheKey = query.toLowerCase();
        if (this.suggestionsCache.has(cacheKey)) {
            return this.suggestionsCache.get(cacheKey);
        }

        const suggestions = {
            graphs: await this.searchGraphs(query, { limit: 5 }),
            popular: this.getPopularSearches(3),
            trending: this.getTrendingGraphs(2),
            categories: this.getCategorySuggestions(query)
        };

        // Cache the results
        this.suggestionsCache.set(cacheKey, suggestions);
        setTimeout(() => this.suggestionsCache.delete(cacheKey), 300000); // 5 minutes

        return suggestions;
    }

    async searchGraphs(query, options = {}) {
        const {
            limit = 10,
            filters = {},
            sortBy = 'relevance'
        } = options;

        const startTime = performance.now();
        
        try {
            const allGraphs = this.app.modules.graphManager.getAllGraphs();
            let results = this.performTextSearch(query, allGraphs);
            
            // Apply filters
            if (Object.keys(filters).length > 0) {
                results = this.applyFilters(results, filters);
            }
            
            // Sort results
            results = this.sortResults(results, sortBy, query);
            
            // Limit results
            results = results.slice(0, limit);
            
            const searchTime = performance.now() - startTime;
            
            // Track search analytics
            this.app.modules.analytics.trackEvent('search', 'perform', query, {
                results_count: results.length,
                search_time: searchTime,
                filters: Object.keys(filters)
            });
            
            return results;
            
        } catch (error) {
            console.error('Search error:', error);
            this.app.modules.analytics.trackEvent('error', 'search_failed', error.message);
            return [];
        }
    }

    performTextSearch(query, graphs) {
        if (!query || query.length < this.config.minQueryLength) {
            return graphs;
        }

        const scoredResults = graphs.map(graph => {
            const score = this.calculateRelevanceScore(graph, query);
            return { ...graph, _searchScore: score };
        });

        // Filter out low-scoring results and sort by score
        return scoredResults
            .filter(result => result._searchScore > 0)
            .sort((a, b) => b._searchScore - a._searchScore);
    }

    calculateRelevanceScore(graph, query) {
        let totalScore = 0;
        const queryTerms = this.normalizeTerm(query).split(/\s+/);
        
        // Exact matches get bonus points
        if (this.normalizeTerm(graph.title).includes(this.normalizeTerm(query))) {
            totalScore += 100;
        }
        
        // Check each field with weighted scores
        queryTerms.forEach(term => {
            // Title match
            if (this.normalizeTerm(graph.title).includes(term)) {
                totalScore += this.config.weightMultipliers.title;
            }
            
            // Aliases match
            graph.aliases?.forEach(alias => {
                if (this.normalizeTerm(alias).includes(term)) {
                    totalScore += this.config.weightMultipliers.aliases;
                }
            });
            
            // Tags match
            graph.tags?.forEach(tag => {
                if (this.normalizeTerm(tag).includes(term)) {
                    totalScore += this.config.weightMultipliers.tags;
                }
            });
            
            // Keywords match
            graph.keywords?.forEach(keyword => {
                if (this.normalizeTerm(keyword).includes(term)) {
                    totalScore += this.config.weightMultipliers.keywords;
                }
            });
            
            // Description match
            if (this.normalizeTerm(graph.description).includes(term)) {
                totalScore += this.config.weightMultipliers.description;
            }
            
            // Equation match
            if (graph.equation && this.normalizeTerm(graph.equation).includes(term)) {
                totalScore += this.config.weightMultipliers.equation;
            }
        });
        
        // Boost score for popular graphs
        totalScore += Math.log(graph.views + 1) * 0.1;
        totalScore += Math.log(graph.downloads + 1) * 0.2;
        
        // Boost for recent graphs
        if (graph.createdAt) {
            const daysSinceCreation = (Date.now() - new Date(graph.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceCreation < 7) {
                totalScore += 20; // New graph boost
            } else if (daysSinceCreation < 30) {
                totalScore += 10; // Recent graph boost
            }
        }
        
        return totalScore;
    }

    applyFilters(results, filters) {
        return results.filter(graph => {
            // Subject filter
            if (filters.subject && graph.subject !== filters.subject) {
                return false;
            }
            
            // Class filter
            if (filters.class && graph.class !== filters.class) {
                return false;
            }
            
            // Type filter
            if (filters.type && graph.type !== filters.type) {
                return false;
            }
            
            // Difficulty filter
            if (filters.difficulty && graph.difficulty !== filters.difficulty) {
                return false;
            }
            
            // Interactive filter
            if (filters.interactive !== undefined && graph.interactive !== filters.interactive) {
                return false;
            }
            
            return true;
        });
    }

    sortResults(results, sortBy, query) {
        switch (sortBy) {
            case 'relevance':
                return results.sort((a, b) => b._searchScore - a._searchScore);
                
            case 'popular':
                return results.sort((a, b) => b.views - a.views);
                
            case 'recent':
                return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
            case 'title':
                return results.sort((a, b) => a.title.localeCompare(b.title));
                
            case 'downloads':
                return results.sort((a, b) => b.downloads - a.downloads);
                
            default:
                return results;
        }
    }

    getPopularSearches(limit = 5) {
        // This would typically come from analytics data
        const popularSearches = [
            { term: 'Ohm\'s Law', count: 1245 },
            { term: 'Boyle\'s Law', count: 987 },
            { term: 'Thermodynamics', count: 876 },
            { term: 'Electromagnetism', count: 754 },
            { term: 'Chemical Reactions', count: 643 }
        ];
        
        return popularSearches.slice(0, limit);
    }

    getTrendingGraphs(limit = 3) {
        const allGraphs = this.app.modules.graphManager.getAllGraphs();
        return allGraphs
            .sort((a, b) => b.views - a.views)
            .slice(0, limit);
    }

    getCategorySuggestions(query) {
        const categories = [
            { name: 'Physics', icon: 'atom', count: 250 },
            { name: 'Chemistry', icon: 'flask', count: 180 },
            { name: 'Class 11', icon: 'graduation-cap', count: 215 },
            { name: 'Class 12', icon: 'graduation-cap', count: 215 }
        ];
        
        if (!query) return categories.slice(0, 4);
        
        return categories
            .filter(cat => 
                cat.name.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 2);
    }

    renderSearchSuggestions(suggestions, query) {
        const container = document.getElementById('searchSuggestionsPanel');
        if (!container) return;
        
        let html = '';
        
        // Recent searches
        if (this.searchHistory.size > 0 && !query) {
            html += this.renderRecentSearches();
        }
        
        // Graph suggestions
        if (suggestions.graphs.length > 0) {
            html += this.renderGraphSuggestions(suggestions.graphs);
        }
        
        // Popular searches
        if (suggestions.popular.length > 0 && !query) {
            html += this.renderPopularSearches(suggestions.popular);
        }
        
        // Category suggestions
        if (suggestions.categories.length > 0) {
            html += this.renderCategorySuggestions(suggestions.categories);
        }
        
        if (html) {
            container.innerHTML = html;
            container.style.display = 'block';
        } else {
            this.hideSearchSuggestions();
        }
    }

    renderRecentSearches() {
        const recentSearches = Array.from(this.searchHistory).slice(0, 5);
        
        return `
            <div class="suggestions-section">
                <h4>Recent Searches</h4>
                <div class="suggestions-list">
                    ${recentSearches.map(term => `
                        <div class="suggestion-item" data-term="${term}">
                            <i class="fas fa-history" aria-hidden="true"></i>
                            <span>${term}</span>
                            <button class="remove-suggestion" aria-label="Remove from history">
                                <i class="fas fa-times" aria-hidden="true"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderGraphSuggestions(graphs) {
        return `
            <div class="suggestions-section">
                <h4>Matching Graphs</h4>
                <div class="suggestions-list">
                    ${graphs.map(graph => `
                        <div class="suggestion-item graph-suggestion" data-graph-id="${graph.id}">
                            <i class="fas fa-chart-line" aria-hidden="true"></i>
                            <div class="suggestion-content">
                                <strong>${graph.title}</strong>
                                <span class="suggestion-meta">${graph.subject} • ${graph.class}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderPopularSearches(popularSearches) {
        return `
            <div class="suggestions-section">
                <h4>Popular Searches</h4>
                <div class="suggestions-list">
                    ${popularSearches.map(search => `
                        <div class="suggestion-item" data-term="${search.term}">
                            <i class="fas fa-fire" aria-hidden="true"></i>
                            <span>${search.term}</span>
                            <span class="search-count">${this.app.formatNumber(search.count)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderCategorySuggestions(categories) {
        return `
            <div class="suggestions-section">
                <h4>Categories</h4>
                <div class="category-suggestions">
                    ${categories.map(category => `
                        <div class="category-suggestion" data-category="${category.name.toLowerCase()}">
                            <i class="fas fa-${category.icon}" aria-hidden="true"></i>
                            <span>${category.name}</span>
                            <span class="category-count">${category.count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    hideSearchSuggestions() {
        const container = document.getElementById('searchSuggestionsPanel');
        if (container) {
            container.style.display = 'none';
        }
    }

    hideGlobalSearchSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (container) {
            container.style.display = 'none';
        }
    }

    async performSearch(query = null, filters = {}) {
        const searchQuery = query || document.getElementById('mainSearchInput')?.value;
        
        if (!searchQuery || searchQuery.length < this.config.minQueryLength) {
            this.app.showWarning('Please enter at least 2 characters to search');
            return;
        }
        
        // Add to search history
        this.addToSearchHistory(searchQuery);
        
        // Show loading state
        this.showSearchLoading();
        
        try {
            const results = await this.searchGraphs(searchQuery, { filters });
            this.displaySearchResults(results, searchQuery);
            
            // Update URL for shareable searches
            this.updateSearchURL(searchQuery, filters);
            
        } catch (error) {
            this.app.showError('Search failed. Please try again.');
            console.error('Search error:', error);
        } finally {
            this.hideSearchLoading();
        }
    }

    displaySearchResults(results, query) {
        // Update results count
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = `${results.length} graphs found for "${query}"`;
        }
        
        // Render results in gallery
        this.app.modules.graphManager.displayGraphs(results);
        
        // Hide suggestions
        this.hideSearchSuggestions();
    }

    addToSearchHistory(term) {
        this.searchHistory.add(term);
        
        // Limit history size
        if (this.searchHistory.size > this.config.maxHistory) {
            const oldest = Array.from(this.searchHistory).shift();
            this.searchHistory.delete(oldest);
        }
        
        this.saveSearchHistory();
    }

    saveSearchHistory() {
        try {
            localStorage.setItem('graphz_search_history', 
                JSON.stringify(Array.from(this.searchHistory))
            );
        } catch (error) {
            console.warn('Failed to save search history:', error);
        }
    }

    loadSearchHistory() {
        try {
            const history = localStorage.getItem('graphz_search_history');
            if (history) {
               this.searchHistory = new Set(JSON.parse(history));
            }
        } catch (error) {
            console.warn('Failed to load search history:', error);
        }
    }

    showSearchLoading() {
        // Implement loading state for search
        const searchBtn = document.getElementById('searchButton');
        if (searchBtn) {
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';
            searchBtn.disabled = true;
        }
    }

    hideSearchLoading() {
        const searchBtn = document.getElementById('searchButton');
        if (searchBtn) {
            searchBtn.innerHTML = '<i class="fas fa-search" aria-hidden="true"></i>';
            searchBtn.disabled = false;
        }
    }

    updateSearchURL(query, filters) {
        const params = new URLSearchParams();
        params.set('q', query);
        
        if (Object.keys(filters).length > 0) {
            params.set('filters', JSON.stringify(filters));
        }
        
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
    }

    openSearch() {
        const searchInput = document.getElementById('mainSearchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    // Voice search functionality
    async startVoiceSearch() {
        if (!('webkitSpeechRecognition' in window)) {
            this.app.showWarning('Voice search is not supported in your browser');
            return;
        }
        
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            this.app.showInfo('Listening... Speak now');
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('mainSearchInput').value = transcript;
            this.performSearch(transcript);
        };
        
        recognition.onerror = (event) => {
            this.app.showError(`Voice recognition error: ${event.error}`);
        };
        
        recognition.onend = () => {
            this.app.showInfo('Voice search ended');
        };
        
        recognition.start();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchEngine;
          }
