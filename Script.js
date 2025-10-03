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

// graph-manager.js
class GraphManager {
    constructor(app) {
        this.app = app;
        this.graphs = new Map();
        this.categories = new Set();
        this.tags = new Set();
        this.filters = {
            subject: '',
            class: '',
            type: '',
            difficulty: '',
            chapter: '',
            interactive: null
        };
        this.currentPage = 1;
        this.itemsPerPage = 24;
        this.totalGraphs = 0;
        
        this.config = {
            cacheDuration: 5 * 60 * 1000, // 5 minutes
            maxGraphsPerPage: 96,
            defaultSort: 'recent',
            enableLazyLoading: true,
            preloadAdjacent: true
        };
    }

    async init() {
        await this.loadGraphsData();
        this.setupEventListeners();
        this.initializeGallery();
        this.setupFilterSystem();
    }

    async loadGraphsData() {
        try {
            // Try to load from cache first
            const cached = this.loadFromCache();
            if (cached) {
                this.graphs = cached.graphs;
                this.categories = cached.categories;
                this.tags = cached.tags;
                this.totalGraphs = cached.totalGraphs;
                console.log('Loaded graphs from cache');
                return;
            }

            // Load from API or local data
            await this.loadFromAPI();
            
        } catch (error) {
            console.error('Failed to load graphs data:', error);
            // Fallback to sample data
            await this.loadSampleData();
        }
    }

    async loadFromAPI() {
        // This would be your actual API call
        const response = await fetch('/api/graphs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        this.processGraphsData(data);
        this.saveToCache(data);
    }

    async loadSampleData() {
        // Sample data for demonstration
        const sampleGraphs = [
            {
                id: '1',
                title: "Ohm's Law",
                aliases: ["ওহমের সূত্র", "V=IR", "Voltage Current Relation"],
                description: "Shows the relationship between voltage, current, and resistance in an electrical circuit.",
                subject: "physics",
                class: "11",
                chapter: "Electricity",
                type: "interactive",
                difficulty: "easy",
                tags: ["electricity", "current", "voltage", "resistance"],
                keywords: ["V=IR", "circuit", "electrical"],
                equation: "V = I × R",
                source: "NCERT Physics Part 1, Page 45",
                views: 1500,
                downloads: 340,
                rating: 4.8,
                interactive: true,
                createdAt: "2024-01-15",
                updatedAt: "2024-01-15",
                staticImage: "/images/graphs/ohms-law.png",
                chartConfig: {
                    type: "line",
                    data: {
                        labels: ["1", "2", "3", "4", "5"],
                        datasets: [{
                            label: "Current (I)",
                            data: [1, 2, 3, 4, 5],
                            borderColor: "#2563eb",
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                title: { display: true, text: "Voltage (V)" }
                            },
                            y: {
                                title: { display: true, text: "Current (I)" }
                            }
                        }
                    }
                }
            },
            // More sample graphs would be here...
        ];

        this.processGraphsData(sampleGraphs);
    }

    processGraphsData(graphs) {
        this.graphs.clear();
        this.categories.clear();
        this.tags.clear();

        graphs.forEach(graph => {
            // Add to graphs map
            this.graphs.set(graph.id, graph);
            
            // Add to categories
            if (graph.subject) this.categories.add(graph.subject);
            if (graph.class) this.categories.add(`class${graph.class}`);
            
            // Add tags
            if (graph.tags) {
                graph.tags.forEach(tag => this.tags.add(tag));
            }
        });

        this.totalGraphs = this.graphs.size;
        this.updateFilterOptions();
    }

    updateFilterOptions() {
        // Update subject filter
        const subjectFilter = document.getElementById('filterSubject');
        if (subjectFilter) {
            const currentValue = subjectFilter.value;
            subjectFilter.innerHTML = '<option value="">সব বিষয়</option>';
            
            this.categories.forEach(category => {
                if (['physics', 'chemistry'].includes(category)) {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category === 'physics' ? 'পদার্থবিজ্ঞান' : 'রসায়ন';
                    subjectFilter.appendChild(option);
                }
            });
            
            subjectFilter.value = currentValue;
        }

        // Update tag suggestions
        this.updateTagSuggestions();
    }

    updateTagSuggestions() {
        const tagInput = document.getElementById('tagInput');
        if (tagInput) {
            tagInput.setAttribute('list', 'tagSuggestions');
            
            const datalist = document.getElementById('tagSuggestions') || 
                            document.createElement('datalist');
            datalist.id = 'tagSuggestions';
            
            datalist.innerHTML = '';
            this.tags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                datalist.appendChild(option);
            });
            
            if (!document.getElementById('tagSuggestions')) {
                document.body.appendChild(datalist);
            }
        }
    }

    setupEventListeners() {
        // Filter changes
        const filterElements = [
            'filterSubject', 'filterClass', 'filterType', 
            'filterDifficulty', 'filterChapter'
        ];
        
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.handleFilterChange());
            }
        });

        // View type changes
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleViewChange(e));
        });

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreGraphs());
        }

        // Graph card interactions
        document.addEventListener('click', (e) => this.handleGraphCardClick(e));

        // Infinite scroll
        if (this.config.enableLazyLoading) {
            window.addEventListener('scroll', 
                this.app.throttle(() => this.handleScroll(), 100)
            );
        }
    }

    handleFilterChange() {
        this.updateFiltersFromUI();
        this.currentPage = 1;
        this.refreshGallery();
        this.updateFilterCounts();
    }

    updateFiltersFromUI() {
        this.filters = {
            subject: document.getElementById('filterSubject')?.value || '',
            class: document.getElementById('filterClass')?.value || '',
            type: document.getElementById('filterType')?.value || '',
            difficulty: document.getElementById('filterDifficulty')?.value || '',
            chapter: document.getElementById('filterChapter')?.value || '',
            interactive: document.getElementById('filterInteractive')?.checked || null
        };
    }

    handleViewChange(event) {
        const viewType = event.target.closest('.view-btn').dataset.view;
        this.setViewType(viewType);
    }

    setViewType(viewType) {
        this.state.currentView = viewType;
        
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewType);
        });
        
        // Show/hide containers
        const grid = document.getElementById('graphGrid');
        const list = document.getElementById('graphList');
        
        if (grid) grid.style.display = viewType === 'grid' ? 'block' : 'none';
        if (list) list.style.display = viewType === 'list' ? 'block' : 'none';
        
        // Save preference
        this.app.modules.settings.savePreference('view', viewType);
        
        // Refresh display
        this.refreshGallery();
    }

    handleGraphCardClick(event) {
        const card = event.target.closest('.graph-card');
        if (!card) return;

        const graphId = card.dataset.graphId;
        const action = event.target.closest('button')?.dataset.action;

        if (action === 'view') {
            this.openGraphModal(graphId);
        } else if (action === 'download') {
            this.downloadGraph(graphId);
        } else if (action === 'favorite') {
            this.toggleFavorite(graphId);
        } else if (action === 'share') {
            this.shareGraph(graphId);
        } else {
            // Default action - open modal
            this.openGraphModal(graphId);
        }
    }

    async openGraphModal(graphId) {
        try {
            const graph = this.getGraphById(graphId);
            if (!graph) {
                throw new Error('Graph not found');
            }

            // Track view
            this.trackGraphView(graphId);

            // Show modal
            this.showGraphModal(graph);

            // Load interactive graph if available
            if (graph.interactive && graph.chartConfig) {
                await this.loadInteractiveGraph(graph);
            }

        } catch (error) {
            console.error('Failed to open graph modal:', error);
            this.app.showError('Failed to load graph details');
        }
    }

    showGraphModal(graph) {
        const modal = document.getElementById('graphDetailModal');
        if (!modal) return;

        // Populate modal content
        this.populateModalContent(graph);

        // Show modal
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');

        // Add overlay
        this.showModalOverlay();

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    populateModalContent(graph) {
        // Set basic info
        document.getElementById('graphModalTitle').textContent = graph.title;
        document.getElementById('modalGraphImage').src = graph.staticImage;
        document.getElementById('modalGraphImage').alt = graph.title;

        // Set badges
        this.updateModalBadges(graph);

        // Set information
        this.updateModalInfo(graph);

        // Set description and content
        this.updateModalContent(graph);

        // Set stats
        this.updateModalStats(graph);
    }

    updateModalBadges(graph) {
        const badgesContainer = document.getElementById('graphModalBadges');
        if (!badgesContainer) return;

        badgesContainer.innerHTML = `
            <span class="badge subject-badge ${graph.subject}">
                ${graph.subject === 'physics' ? 'পদার্থবিজ্ঞান' : 'রসায়ন'}
            </span>
            <span class="badge class-badge">ক্লাস ${graph.class}</span>
            <span class="badge type-badge">${graph.type}</span>
            <span class="badge difficulty-badge ${graph.difficulty}">
                ${this.getDifficultyText(graph.difficulty)}
            </span>
        `;
    }

    updateModalInfo(graph) {
        const infoMap = {
            'infoSubject': graph.subject === 'physics' ? 'পদার্থবিজ্ঞান' : 'রসায়ন',
            'infoClass': `ক্লাস ${graph.class}`,
            'infoChapter': graph.chapter || '-',
            'infoDifficulty': this.getDifficultyText(graph.difficulty),
            'infoEquation': graph.equation || '-',
            'infoSource': graph.source || '-'
        };

        Object.entries(infoMap).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Update aliases
        this.updateModalAliases(graph.aliases);
        
        // Update tags
        this.updateModalTags(graph.tags);
    }

    updateModalAliases(aliases) {
        const container = document.getElementById('modalAliasesList');
        if (!container) return;

        if (aliases && aliases.length > 0) {
            container.innerHTML = aliases.map(alias => 
                `<span class="alias-tag">${alias}</span>`
            ).join('');
        } else {
            container.innerHTML = '<span class="no-data">No alternative names</span>';
        }
    }

    updateModalTags(tags) {
        const container = document.getElementById('modalTagsList');
        if (!container) return;

        if (tags && tags.length > 0) {
            container.innerHTML = tags.map(tag => 
                `<span class="tag">${tag}</span>`
            ).join('');
        } else {
            container.innerHTML = '<span class="no-data">No tags</span>';
        }
    }

    updateModalContent(graph) {
        // Update explanation tab
        const explanationContent = document.getElementById('graphExplanation');
        if (explanationContent) {
            explanationContent.innerHTML = this.generateExplanation(graph);
        }

        // Update key points
        const keyPointsList = document.getElementById('keyPointsList');
        if (keyPointsList) {
            keyPointsList.innerHTML = this.generateKeyPoints(graph);
        }

        // Update applications
        const applicationsContent = document.getElementById('realLifeApplications');
        if (applicationsContent) {
            applicationsContent.innerHTML = this.generateApplications(graph);
        }

        // Update related graphs
        this.updateRelatedGraphs(graph);
    }

    generateExplanation(graph) {
        // This would be more sophisticated in a real app
        return `
            <p>${graph.description}</p>
            ${graph.equation ? `<div class="equation">${graph.equation}</div>` : ''}
            <p>এই গ্রাফটি ${graph.subject === 'physics' ? 'পদার্থবিজ্ঞান' : 'রসায়ন'} বিষয়ের 
            ${graph.chapter} অধ্যায়ের অন্তর্গত।</p>
        `;
    }

    generateKeyPoints(graph) {
        const keyPoints = [
            `এটি একটি ${this.getDifficultyText(graph.difficulty)} লেভেলের গ্রাফ`,
            `${graph.subject === 'physics' ? 'পদার্থবিজ্ঞান' : 'রসায়ন'} বিষয়ের গুরুত্বপূর্ণ কনসেপ্ট`,
            'ইন্টারেক্টিভভাবে এক্সপ্লোর করা যাবে'
        ];

        return keyPoints.map(point => `<li>${point}</li>`).join('');
    }

    generateApplications(graph) {
        // Sample applications based on graph type
        const applications = {
            "Ohm's Law": [
                "বৈদ্যুতিক সার্কিট ডিজাইন",
                "রেজিস্টর সিলেকশন",
                "পাওয়ার সাপ্লাই ক্যালকুলেশন"
            ],
            "Boyle's Law": [
                "গ্যাসের আচরণ স্টাডি",
                "প্রেশার ভেসেল ডিজাইন",
                "এয়ার কম্প্রেশন সিস্টেম"
            ]
        };

        const appList = applications[graph.title] || [
            "রিয়েল-লাইফ ফেনোমেনা বুঝতে",
            "এক্সপেরিমেন্টাল ডেটা অ্যানালিসিস",
            "সায়েন্টিফিক রিসার্চ"
        ];

        return `
            <p>এই গ্রাফের গুরুত্বপূর্ণ অ্যাপ্লিকেশনসমূহ:</p>
            <ul>
                ${appList.map(app => `<li>${app}</li>`).join('')}
            </ul>
        `;
    }

    updateRelatedGraphs(graph) {
        const container = document.getElementById('relatedGraphsGrid');
        if (!container) return;

        // Find related graphs (same subject and class)
        const relatedGraphs = Array.from(this.graphs.values())
            .filter(g => 
                g.id !== graph.id && 
                g.subject === graph.subject && 
                g.class === graph.class
            )
            .slice(0, 6);

        if (relatedGraphs.length > 0) {
            container.innerHTML = relatedGraphs.map(relatedGraph => `
                <div class="related-graph-card" data-graph-id="${relatedGraph.id}">
                    <img src="${relatedGraph.staticImage}" alt="${relatedGraph.title}">
                    <h5>${relatedGraph.title}</h5>
                    <span class="related-graph-meta">${relatedGraph.chapter}</span>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>No related graphs found</p>';
        }
    }

    updateModalStats(graph) {
        document.getElementById('modalViewCount').textContent = 
            this.app.formatNumber(graph.views);
        document.getElementById('modalDownloadCount').textContent = 
            this.app.formatNumber(graph.downloads);
        document.getElementById('modalAddedDate').textContent = 
            this.formatDate(graph.createdAt);
    }

    async loadInteractiveGraph(graph) {
        const container = document.getElementById('interactiveGraphContainer');
        if (!container || !graph.chartConfig) return;

        try {
            // Show loading state
            container.innerHTML = '<div class="graph-loading">লোড হচ্ছে...</div>';

            // Initialize Chart.js
            const ctx = document.createElement('canvas');
            container.innerHTML = '';
            container.appendChild(ctx);

            new Chart(ctx, graph.chartConfig);

            // Setup interactive controls if needed
            this.setupInteractiveControls(graph);

        } catch (error) {
            console.error('Failed to load interactive graph:', error);
            container.innerHTML = '<div class="graph-error">ইন্টারেক্টিভ গ্রাফ লোড করতে ব্যর্থ</div>';
        }
    }

    setupInteractiveControls(graph) {
        const controls = document.getElementById('interactiveControls');
        if (!controls) return;

        // Add parameter sliders based on graph type
        if (graph.equation && graph.equation.includes('=')) {
            this.createParameterControls(graph);
        }
    }

    createParameterControls(graph) {
        // This would create dynamic controls based on the equation
        // For demonstration, we'll create a simple slider
        const controlGroup = document.querySelector('.control-group');
        if (controlGroup) {
            controlGroup.innerHTML = `
                <label for="parameterSlider">প্যারামিটার:</label>
                <input type="range" id="parameterSlider" class="parameter-slider" 
                       min="1" max="100" value="50">
                <span id="parameterValue">50</span>
            `;

            const slider = document.getElementById('parameterSlider');
            const valueDisplay = document.getElementById('parameterValue');

            slider.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value;
                this.updateInteractiveGraph(parseInt(e.target.value));
            });
        }
    }

    updateInteractiveGraph(value) {
        // This would update the chart based on the parameter value
        // Implementation depends on the specific graph type
        console.log('Updating graph with value:', value);
       }

    initializeGallery() {
        this.refreshGallery();
        this.updateFilterCounts();
    }

    refreshGallery() {
        const filteredGraphs = this.getFilteredGraphs();
        const paginatedGraphs = this.getPaginatedGraphs(filteredGraphs);
        
        this.renderGallery(paginatedGraphs);
        this.updatePagination(filteredGraphs.length);
        this.updateEmptyState(filteredGraphs.length);
    }

    getFilteredGraphs() {
        let filtered = Array.from(this.graphs.values());

        // Apply filters
        if (this.filters.subject) {
            filtered = filtered.filter(graph => graph.subject === this.filters.subject);
        }

        if (this.filters.class) {
            filtered = filtered.filter(graph => graph.class === this.filters.class);
        }

        if (this.filters.type) {
            filtered = filtered.filter(graph => graph.type === this.filters.type);
        }

        if (this.filters.difficulty) {
            filtered = filtered.filter(graph => graph.difficulty === this.filters.difficulty);
        }

        if (this.filters.chapter) {
            filtered = filtered.filter(graph => 
                graph.chapter?.toLowerCase().includes(this.filters.chapter.toLowerCase())
            );
        }

        if (this.filters.interactive !== null) {
            filtered = filtered.filter(graph => graph.interactive === this.filters.interactive);
        }

        return filtered;
    }

    getPaginatedGraphs(graphs) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return graphs.slice(startIndex, endIndex);
    }

    renderGallery(graphs) {
        this.renderGridGallery(graphs);
        this.renderListGallery(graphs);
    }

    renderGridGallery(graphs) {
        const container = document.getElementById('graphGrid');
        if (!container) return;

        if (graphs.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = graphs.map(graph => this.createGraphCard(graph)).join('');
    }

    renderListGallery(graphs) {
        const container = document.getElementById('graphList');
        if (!container) return;

        if (graphs.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = graphs.map(graph => this.createGraphListItem(graph)).join('');
    }

    createGraphCard(graph) {
        return `
            <div class="graph-card" data-graph-id="${graph.id}" 
                 data-category="${graph.subject}" data-difficulty="${graph.difficulty}">
                <div class="card-header">
                    <div class="graph-badges">
                        <span class="badge subject-badge ${graph.subject}">
                            ${graph.subject === 'physics' ? 'পদার্থবিজ্ঞান' : 'রসায়ন'}
                        </span>
                        <span class="badge class-badge">ক্লাস ${graph.class}</span>
                        ${graph.interactive ? '<span class="badge type-badge interactive">ইন্টারেক্টিভ</span>' : ''}
                        <span class="badge difficulty-badge ${graph.difficulty}">
                            ${this.getDifficultyText(graph.difficulty)}
                        </span>
                    </div>
                    <button class="card-menu-btn" aria-label="Graph options">
                        <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                    </button>
                    <div class="card-dropdown-menu">
                        <button class="dropdown-item favorite-btn" data-action="favorite">
                            <i class="far fa-heart" aria-hidden="true"></i>
                            ফেভারিটে অ্যাড করুন
                        </button>
                        <button class="dropdown-item download-btn" data-action="download">
                            <i class="fas fa-download" aria-hidden="true"></i>
                            ডাউনলোড করুন
                        </button>
                        <button class="dropdown-item share-btn" data-action="share">
                            <i class="fas fa-share-alt" aria-hidden="true"></i>
                            শেয়ার করুন
                        </button>
                    </div>
                </div>

                <div class="card-preview">
                    <div class="graph-image-container">
                        <img class="graph-image" src="${graph.staticImage}" alt="${graph.title}" loading="lazy">
                        <div class="graph-overlay">
                            <button class="preview-btn view-btn" data-action="view" aria-label="View graph">
                                <i class="fas fa-expand" aria-hidden="true"></i>
                            </button>
                            ${graph.interactive ? '
                                <button class="preview-btn interactive-btn" data-action="interactive" aria-label="Open interactive mode">
                                    <i class="fas fa-play" aria-hidden="true"></i>
                                </button>
                            ' : ''}
                        </div>
                    </div>
                    <div class="graph-stats">
                        <span class="stat">
                            <i class="fas fa-eye" aria-hidden="true"></i>
                            <span class="stat-count views-count">${this.app.formatNumber(graph.views)}</span>
                        </span>
                        <span class="stat">
                            <i class="fas fa-download" aria-hidden="true"></i>
                            <span class="stat-count downloads-count">${this.app.formatNumber(graph.downloads)}</span>
                        </span>
                        <span class="stat">
                            <i class="fas fa-star" aria-hidden="true"></i>
                            <span class="stat-count rating-count">${graph.rating}</span>
                        </span>
                    </div>
                </div>

                <div class="card-content">
                    <h3 class="graph-title">${graph.title}</h3>
                    <p class="graph-description">${this.truncateText(graph.description, 100)}</p>
                    
                    <div class="graph-meta">
                        <div class="meta-item">
                            <i class="fas fa-book" aria-hidden="true"></i>
                            <span class="chapter-name">${graph.chapter || 'সাধারণ'}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-clock" aria-hidden="true"></i>
                            <span class="duration">${this.formatDate(graph.createdAt)}</span>
                        </div>
                    </div>

                    ${graph.tags && graph.tags.length > 0 ? `
                        <div class="graph-tags">
                            ${graph.tags.slice(0, 3).map(tag => 
                                `<span class="tag">${tag}</span>`
                            ).join('')}
                            ${graph.tags.length > 3 ? 
                                `<span class="tag-more">+${graph.tags.length - 3} more</span>` : ''
                            }
                        </div>
                    ` : ''}

                    ${graph.aliases && graph.aliases.length > 0 ? `
                        <div class="graph-aliases">
                            <span class="aliases-label">আরও নাম:</span>
                            <div class="aliases-list">
                                ${graph.aliases.slice(0, 2).map(alias => 
                                    `<span class="alias">${alias}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="card-actions">
                    <button class="btn btn-primary btn-sm open-graph-btn" data-action="view">
                        <i class="fas fa-chart-line" aria-hidden="true"></i>
                        ওপেন করুন
                    </button>
                    <button class="btn btn-outline btn-sm quick-view-btn" data-action="quickview">
                        <i class="fas fa-eye" aria-hidden="true"></i>
                        কুইক ভিউ
                    </button>
                </div>
            </div>
        `;
    }

    createGraphListItem(graph) {
        return `
            <div class="graph-list-item" data-graph-id="${graph.id}">
                <div class="list-item-preview">
                    <img src="${graph.staticImage}" alt="${graph.title}" loading="lazy">
                </div>
                <div class="list-item-content">
                    <h3 class="graph-title">${graph.title}</h3>
                    <p class="graph-description">${graph.description}</p>
                    <div class="list-item-meta">
                        <span class="meta-badge subject">${graph.subject}</span>
                        <span class="meta-badge class">Class ${graph.class}</span>
                        <span class="meta-badge chapter">${graph.chapter}</span>
                        <span class="meta-stat">
                            <i class="fas fa-eye"></i> ${this.app.formatNumber(graph.views)}
                        </span>
                        <span class="meta-stat">
                            <i class="fas fa-download"></i> ${this.app.formatNumber(graph.downloads)}
                        </span>
                    </div>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-primary btn-sm" data-action="view">Open</button>
                    <button class="btn btn-outline btn-sm" data-action="download">Download</button>
                </div>
            </div>
        `;
    }

    // Utility methods
    getDifficultyText(difficulty) {
        const difficultyMap = {
            'easy': 'সহজ',
            'medium': 'মধ্যম',
            'hard': 'কঠিন'
        };
        return difficultyMap[difficulty] || difficulty;
    }

    truncateText(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('bn-BD');
    }

    trackGraphView(graphId) {
        const graph = this.getGraphById(graphId);
        if (graph) {
            graph.views = (graph.views || 0) + 1;
            this.app.modules.analytics.trackEvent('graph', 'view', graph.title);
        }
    }

    async downloadGraph(graphId) {
        try {
            const graph = this.getGraphById(graphId);
            if (!graph) throw new Error('Graph not found');

            // Track download
            graph.downloads = (graph.downloads || 0) + 1;
            this.app.modules.analytics.trackEvent('graph', 'download', graph.title);

            // Create download link
            const link = document.createElement('a');
            link.href = graph.staticImage;
            link.download = `${graph.title.replace(/\s+/g, '_')}.png`;
            link.click();

            this.app.showSuccess('গ্রাফ ডাউনলোড শুরু হয়েছে');

        } catch (error) {
            console.error('Download failed:', error);
            this.app.showError('ডাউনলোড করতে ব্যর্থ');
        }
    }

    toggleFavorite(graphId) {
        // Implementation for favorite functionality
        this.app.showInfo('ফেভারিটে অ্যাড করা হয়েছে');
    }

    shareGraph(graphId) {
        const graph = this.getGraphById(graphId);
        if (navigator.share) {
            navigator.share({
                title: graph.title,
                text: graph.description,
                url: window.location.href + `?graph=${graphId}`
            });
        } else {
            // Fallback copy to clipboard
            navigator.clipboard.writeText(window.location.href + `?graph=${graphId}`);
            this.app.showSuccess('লিংক কপি করা হয়েছে');
        }
    }

    getGraphById(id) {
        return this.graphs.get(id);
    }

    getAllGraphs() {
        return Array.from(this.graphs.values());
    }

    getTotalGraphs() {
        return this.totalGraphs;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GraphManager;
    }

// quiz-engine.js
class QuizEngine {
    constructor(app) {
        this.app = app;
        this.quizzes = new Map();
        this.currentQuiz = null;
        this.userProgress = new Map();
        this.quizHistory = [];
        
        this.config = {
            questionTimeLimit: 30, // seconds
            maxQuestionsPerQuiz: 10,
            reviewMode: true,
            showExplanations: true,
            adaptiveDifficulty: true
        };
    }

    async init() {
        await this.loadQuizzes();
        await this.loadUserProgress();
        this.setupEventListeners();
        this.initializeQuizUI();
    }

    async loadQuizzes() {
        // Sample quiz data
        const sampleQuizzes = [
            {
                id: 'daily-challenge',
                title: 'ডেইলি চ্যালেঞ্জ',
                description: 'রোজকার নতুন ৫টি প্রশ্ন',
                type: 'daily',
                difficulty: 'mixed',
                questions: [
                    {
                        id: '1',
                        question: 'ওহমের সূত্র অনুসারে, ভোল্টেজ এবং কারেন্টের সম্পর্ক কী?',
                        type: 'multiple_choice',
                        options: [
                            'সরাসরি সমানুপাতিক',
                            'বিপরীতভাবে সমানুপাতিক',
                            'কোন সম্পর্ক নেই',
                            'ঘাত সম্পর্ক'
                        ],
                        correctAnswer: 0,
                        explanation: 'ওহমের সূত্র অনুযায়ী, V = IR, অর্থাৎ ভোল্টেজ এবং কারেন্ট সরাসরি সমানুপাতিক।',
                        topic: 'Electricity',
                        difficulty: 'easy',
                        timeLimit: 30
                    }
                    // More questions...
                ],
                timeLimit: 300, // 5 minutes
                passingScore: 60
            }
            // More quizzes...
        ];

        sampleQuizzes.forEach(quiz => {
            this.quizzes.set(quiz.id, quiz);
        });
    }

    async loadUserProgress() {
        try {
            const progress = localStorage.getItem('graphz_quiz_progress');
            if (progress) {
                this.userProgress = new Map(JSON.parse(progress));
            }
        } catch (error) {
            console.warn('Failed to load quiz progress:', error);
        }
    }

    setupEventListeners() {
        // Quiz start buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.start-quiz-btn')) {
                const quizId = e.target.closest('.start-quiz-btn').dataset.quizId;
                this.startQuiz(quizId);
            }
        });

        // Quiz navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('#nextQuestionBtn')) {
                this.nextQuestion();
            }
            if (e.target.closest('#submitAnswerBtn')) {
                this.submitAnswer();
            }
            if (e.target.closest('#retryQuizBtn')) {
                this.retryQuiz();
            }
        });
    }

    async startQuiz(quizId) {
        try {
            const quiz = this.quizzes.get(quizId);
            if (!quiz) {
                throw new Error('Quiz not found');
            }

            this.currentQuiz = {
                ...quiz,
                currentQuestionIndex: 0,
                score: 0,
                startTime: Date.now(),
                answers: [],
                timeSpent: 0
            };

            this.showQuizInterface();
            this.displayCurrentQuestion();
            this.startTimer();

            this.app.modules.analytics.trackEvent('quiz', 'start', quiz.title);

        } catch (error) {
            console.error('Failed to start quiz:', error);
            this.app.showError('কুইজ শুরু করতে ব্যর্থ');
        }
    }

    showQuizInterface() {
        // Hide quiz selection, show active quiz
        document.getElementById('quizSelection').style.display = 'none';
        document.getElementById('activeQuiz').style.display = 'block';
        document.getElementById('quizResults').style.display = 'none';
    }

    displayCurrentQuestion() {
        if (!this.currentQuiz) return;

        const question = this.currentQuiz.questions[this.currentQuiz.currentQuestionIndex];
        const questionElement = document.getElementById('quizQuestion');
        const optionsElement = document.getElementById('quizOptions');

        if (questionElement && optionsElement) {
            // Update question text
            questionElement.textContent = question.question;

            // Update options
            optionsElement.innerHTML = question.options.map((option, index) => `
                <label class="quiz-option">
                    <input type="radio" name="quizAnswer" value="${index}">
                    <span class="option-text">${option}</span>
                </label>
            `).join('');

            // Update progress
            this.updateQuizProgress();
        }
    }

    updateQuizProgress() {
        if (!this.currentQuiz) return;

        const progress = ((this.currentQuiz.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;
        const progressFill = document.getElementById('quizProgressFill');
        const progressText = document.getElementById('quizProgressText');

        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        if (progressText) {
            progressText.textContent = 
                `প্রশ্ন ${this.currentQuiz.currentQuestionIndex + 1}/${this.currentQuiz.questions.length}`;
        }
    }

    startTimer() {
        if (!this.currentQuiz) return;

        const timerElement = document.getElementById('timerValue');
        if (!timerElement) return;

        let timeLeft = this.config.questionTimeLimit;
        
        this.timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    handleTimeUp() {
        clearInterval(this.timerInterval);
        this.submitAnswer(); // Auto-submit when time's up
    }

    async submitAnswer() {
        if (!this.currentQuiz) return;

        const selectedOption = document.querySelector('input[name="quizAnswer"]:checked');
        if (!selectedOption) {
            this.app.showWarning('দয়া করে একটি উত্তর সিলেক্ট করুন');
            return;
        }

        clearInterval(this.timerInterval);

        const question = this.currentQuiz.questions[this.currentQuiz.currentQuestionIndex];
        const userAnswer = parseInt(selectedOption.value);
        const isCorrect = userAnswer === question.correctAnswer;

        // Record answer
        this.currentQuiz.answers.push({
            questionId: question.id,
            userAnswer,
            isCorrect,
            timeSpent: this.config.questionTimeLimit - parseInt(document.getElementById('timerValue').textContent)
        });

        if (isCorrect) {
            this.currentQuiz.score += 100 / this.currentQuiz.questions.length;
        }

        // Show feedback
        this.showQuestionFeedback(question, isCorrect, userAnswer);

        this.app.modules.analytics.trackEvent('quiz', 'answer', question.topic, {
            correct: isCorrect,
            time_spent: this.currentQuiz.answers[this.currentQuiz.answers.length - 1].timeSpent
        });
    }

    showQuestionFeedback(question, isCorrect, userAnswer) {
        const feedbackElement = document.getElementById('quizFeedback');
        if (!feedbackElement) return;

        feedbackElement.style.display = 'block';
        feedbackElement.setAttribute('aria-hidden', 'false');

        const feedbackTitle = document.getElementById('feedbackTitle');
        const feedbackDescription = document.getElementById('feedbackDescription');

        if (feedbackTitle && feedbackDescription) {
            feedbackTitle.textContent = isCorrect ? 'সঠিক উত্তর!' : 'ভুল উত্তর';
            feedbackTitle.className = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
            
            feedbackDescription.innerHTML = `
                <p>${question.explanation}</p>
                ${!isCorrect ? `
                    <p><strong>সঠিক উত্তর:</strong> ${question.options[question.correctAnswer]}</p>
                ` : ''}
            `;
        }

        // Disable options
        document.querySelectorAll('.quiz-option input').forEach(input => {
            input.disabled = true;
        });
    }

    nextQuestion() {
        if (!this.currentQuiz) return;

        this.currentQuiz.currentQuestionIndex++;

        if (this.currentQuiz.currentQuestionIndex < this.currentQuiz.questions.length) {
            this.displayCurrentQuestion();
            this.startTimer();
            document.getElementById('quizFeedback').style.display = 'none';
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        if (!this.currentQuiz) return;

        clearInterval(this.timerInterval);

        const finalScore = Math.round(this.currentQuiz.score);
        const timeSpent = Math.round((Date.now() - this.currentQuiz.startTime) / 1000);
        const passed = finalScore >= this.currentQuiz.passingScore;

        // Save progress
        this.saveQuizProgress(finalScore, timeSpent, passed);

        // Show results
        this.showQuizResults(finalScore, timeSpent, passed);

        this.app.modules.analytics.trackEvent('quiz', 'complete', this.currentQuiz.title, {
            score: finalScore,
            time_spent: timeSpent,
            passed: passed
        });
    }

    showQuizResults(score, timeSpent, passed) {
        document.getElementById('activeQuiz').style.display = 'none';
        document.getElementById('quizResults').style.display = 'block';

        // Update result stats
        document.getElementById('finalScore').textContent = score;
        document.getElementById('correctAnswers').textContent = 
            Math.round((score / 100) * this.currentQuiz.questions.length);
        document.getElementById('timeSpent').textContent = `${Math.round(timeSpent / 60)}m ${timeSpent % 60}s`;
        document.getElementById('accuracyRate').textContent = `${score}%`;

        // Show pass/fail message
        const resultsHeader = document.querySelector('.results-header');
        if (resultsHeader) {
            resultsHeader.innerHTML = passed ? 
                '<i class="fas fa-trophy"></i><h3>কুইজ সম্পন্ন!</h3><p>অভিনন্দন! আপনি পাস করেছেন।</p>' :
                '<i class="fas fa-redo"></i><h3>আবার চেষ্টা করুন</h3><p>আপনি পাস করতে পারেননি। আরো প্র্যাকটিস প্রয়োজন।</p>';
        }
    }

    saveQuizProgress(score, timeSpent, passed) {
        if (!this.currentQuiz) return;

        const progress = {
            quizId: this.currentQuiz.id,
            score,
            timeSpent,
            passed,
            completedAt: new Date().toISOString(),
            answers: this.currentQuiz.answers
        };

        this.quizHistory.push(progress);
        this.updateUserStats();

        try {
            localStorage.setItem('graphz_quiz_progress', 
                JSON.stringify(Array.from(this.userProgress.entries()))
            );
        } catch (error) {
            console.warn('Failed to save quiz progress:', error);
        }
    }

    updateUserStats() {
        const totalQuizzes = this.quizHistory.length;
        const passedQuizzes = this.quizHistory.filter(q => q.passed).length;
        const averageScore = this.quizHistory.reduce((sum, q) => sum + q.score, 0) / totalQuizzes;

        // Update UI elements
        const elements = {
            'quizStreak': this.calculateStreak(),
            'quizAccuracy': `${Math.round(averageScore)}%`,
            'quizzesCompleted': totalQuizzes,
            'quizRank': this.calculateRank(averageScore)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    calculateStreak() {
        // Calculate consecutive days with quiz completion
        let streak = 0;
        const today = new Date().toDateString();
        
        for (let i = this.quizHistory.length - 1; i >= 0; i--) {
            const quizDate = new Date(this.quizHistory[i].completedAt).toDateString();
            if (quizDate === today) {
                streak++;
                // Move to previous day for next iteration
                today.setDate(today.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }

    calculateRank(averageScore) {
        if (averageScore >= 90) return 'Expert';
        if (averageScore >= 75) return 'Advanced';
        if (averageScore >= 60) return 'Intermediate';
        return 'Beginner';
    }

    retryQuiz() {
        if (this.currentQuiz) {
            this.startQuiz(this.currentQuiz.id);
        }
    }

    getQuizRecommendations() {
        // Get personalized quiz recommendations based on user performance
        const weakTopics = this.identifyWeakTopics();
        return this.findQuizzesByTopics(weakTopics).slice(0, 3);
    }

    identifyWeakTopics() {
        const topicPerformance = new Map();
        
        this.quizHistory.forEach(quiz => {
            quiz.answers.forEach(answer => {
                const question = this.getQuestionById(answer.questionId);
                if (question) {
                    const topic = question.topic;
                    const current = topicPerformance.get(topic) || { correct: 0, total: 0 };
                    current.total++;
                    if (answer.isCorrect) current.correct++;
                    topicPerformance.set(topic, current);
                }
            });
        });

        // Return topics with less than 70% accuracy
        return Array.from(topicPerformance.entries())
            .filter(([topic, stats]) => (stats.correct / stats.total) < 0.7)
            .map(([topic]) => topic);
    }

    findQuizzesByTopics(topics) {
        return Array.from(this.quizzes.values()).filter(quiz =>
            quiz.questions.some(q => topics.includes(q.topic))
        );
    }

    getQuestionById(questionId) {
        for (const quiz of this.quizzes.values()) {
            const question = quiz.questions.find(q => q.id === questionId);
            if (question) return question;
        }
        return null;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizEngine;
    }

