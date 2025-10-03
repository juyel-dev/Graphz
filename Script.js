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
// user-manager.js
class UserManager {
    constructor(app) {
        this.app = app;
        this.currentUser = null;
        this.users = new Map();
        this.sessions = new Map();
        this.userPreferences = {};
        
        this.config = {
            sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
            maxLoginAttempts: 5,
            lockoutTime: 15 * 60 * 1000, // 15 minutes
            passwordMinLength: 8,
            requireEmailVerification: false
        };
    }

    async init() {
        await this.loadUsers();
        await this.restoreSession();
        this.setupEventListeners();
        this.initializeAuthUI();
    }

    async loadUsers() {
        try {
            const usersData = localStorage.getItem('graphz_users');
            if (usersData) {
                const users = JSON.parse(usersData);
                users.forEach(user => this.users.set(user.email, user));
            }

            // Load default admin user if none exists
            if (!this.users.has('admin@graphz.com')) {
                const adminUser = {
                    id: this.generateId(),
                    email: 'admin@graphz.com',
                    password: this.hashPassword('Admin123!'),
                    name: 'System Administrator',
                    role: 'admin',
                    createdAt: new Date().toISOString(),
                    isVerified: true,
                    permissions: ['all']
                };
                this.users.set(adminUser.email, adminUser);
                this.saveUsers();
            }

        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    setupEventListeners() {
        // Auth modal triggers
        document.addEventListener('click', (e) => {
            if (e.target.closest('#loginBtn') || e.target.closest('#userMenuButton')) {
                this.showAuthModal('login');
            }
            if (e.target.closest('#registerBtn')) {
                this.showAuthModal('register');
            }
        });

        // Auth form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLogin(e.target);
            }
            if (e.target.id === 'registerForm') {
                e.preventDefault();
                this.handleRegistration(e.target);
            }
            if (e.target.id === 'resetPasswordForm') {
                e.preventDefault();
                this.handlePasswordReset(e.target);
            }
        });

        // Logout
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logoutBtn')) {
                this.handleLogout();
            }
        });

        // Admin access
        document.addEventListener('click', (e) => {
            if (e.target.closest('#adminAccessBtn')) {
                this.showAdminAccessModal();
            }
        });
    }

    initializeAuthUI() {
        this.updateAuthUI();
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe') === 'on';

        try {
            // Validate input
            if (!this.validateEmail(email)) {
                throw new Error('Invalid email format');
            }

            if (!password) {
                throw new Error('Password is required');
            }

            // Check login attempts
            if (this.isAccountLocked(email)) {
                throw new Error('Account temporarily locked. Please try again later.');
            }

            // Authenticate user
            const user = await this.authenticateUser(email, password);
            if (!user) {
                this.recordFailedAttempt(email);
                throw new Error('Invalid email or password');
            }

            // Create session
            await this.createUserSession(user, rememberMe);

            // Update UI
            this.updateAuthUI();

            // Show success message
            this.app.showSuccess(`Welcome back, ${user.name}!`);

            // Close auth modal
            this.closeAuthModal();

            // Track analytics
            this.app.modules.analytics.trackEvent('auth', 'login_success', user.role);

        } catch (error) {
            console.error('Login failed:', error);
            this.app.showError(error.message);
            this.app.modules.analytics.trackEvent('auth', 'login_failed', error.message);
        }
    }

    async handleRegistration(form) {
        const formData = new FormData(form);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            userType: formData.get('userType')
        };

        try {
            // Validate input
            this.validateRegistrationData(userData);

            // Check if user already exists
            if (this.users.has(userData.email)) {
                throw new Error('User with this email already exists');
            }

            // Validate password strength
            const passwordStrength = this.validatePasswordStrength(userData.password);
            if (!passwordStrength.isStrong) {
                throw new Error(`Weak password: ${passwordStrength.errors.join(', ')}`);
            }

            // Create new user
            const user = await this.createUser(userData);

            // Auto-login if email verification is not required
            if (!this.config.requireEmailVerification) {
                await this.createUserSession(user, true);
                this.app.showSuccess('Registration successful! Welcome to Graphz.');
                this.closeAuthModal();
            } else {
                await this.sendVerificationEmail(user);
                this.app.showSuccess('Registration successful! Please check your email for verification.');
                this.showAuthModal('login');
            }

            // Track analytics
            this.app.modules.analytics.trackEvent('auth', 'register_success', user.userType);

        } catch (error) {
            console.error('Registration failed:', error);
            this.app.showError(error.message);
            this.app.modules.analytics.trackEvent('auth', 'register_failed', error.message);
        }
    }

    validateRegistrationData(userData) {
        const errors = [];

        if (!userData.firstName || userData.firstName.length < 2) {
            errors.push('First name must be at least 2 characters');
        }

        if (!userData.lastName || userData.lastName.length < 2) {
            errors.push('Last name must be at least 2 characters');
        }

        if (!this.validateEmail(userData.email)) {
            errors.push('Invalid email format');
        }

        if (!userData.password) {
            errors.push('Password is required');
        }

        if (!userData.userType) {
            errors.push('Please select user type');
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }

    validatePasswordStrength(password) {
        const errors = [];
        const requirements = {
            minLength: password.length >= this.config.passwordMinLength,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };

        if (!requirements.minLength) {
            errors.push(`Password must be at least ${this.config.passwordMinLength} characters`);
        }
        if (!requirements.hasUpperCase) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!requirements.hasLowerCase) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!requirements.hasNumbers) {
            errors.push('Password must contain at least one number');
        }
        if (!requirements.hasSpecialChar) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isStrong: errors.length === 0,
            errors: errors
        };
    }

    async createUser(userData) {
        const user = {
            id: this.generateId(),
            email: userData.email,
            password: this.hashPassword(userData.password),
            name: `${userData.firstName} ${userData.lastName}`,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'user',
            userType: userData.userType,
            createdAt: new Date().toISOString(),
            isVerified: !this.config.requireEmailVerification,
            preferences: {
                theme: 'auto',
                language: 'bn',
                notifications: true
            },
            stats: {
                graphsViewed: 0,
                quizzesCompleted: 0,
                totalLearningTime: 0,
                achievements: []
            }
        };

        this.users.set(user.email, user);
        await this.saveUsers();

        return user;
    }

    async authenticateUser(email, password) {
        const user = this.users.get(email);
        if (!user) {
            return null;
        }

        // Check if account is locked
        if (this.isAccountLocked(email)) {
            return null;
        }

        // Verify password
        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            return null;
        }

        // Check if email is verified
        if (this.config.requireEmailVerification && !user.isVerified) {
            throw new Error('Please verify your email before logging in');
        }

        return user;
    }

    async createUserSession(user, rememberMe = false) {
        const session = {
            id: this.generateSessionId(),
            userId: user.id,
            email: user.email,
            role: user.role,
            createdAt: Date.now(),
            expiresAt: Date.now() + (rememberMe ? this.config.sessionDuration : 24 * 60 * 60 * 1000), // 24 hours or longer
            userAgent: navigator.userAgent,
            ip: await this.getClientIP()
        };

        this.sessions.set(session.id, session);
        this.currentUser = user;

        // Store session in localStorage
        localStorage.setItem('graphz_session', JSON.stringify({
            sessionId: session.id,
            rememberMe: rememberMe
        }));

        // Update app state
        this.app.state.currentUser = user;
        this.app.state.adminLoggedIn = user.role === 'admin';

        // Load user preferences
        await this.loadUserPreferences();

        return session;
    }

    async restoreSession() {
        try {
            const sessionData = localStorage.getItem('graphz_session');
            if (!sessionData) return;

            const { sessionId, rememberMe } = JSON.parse(sessionData);
            const session = this.sessions.get(sessionId);

            if (!session || session.expiresAt < Date.now()) {
                this.clearSession();
                return;
            }

            const user = Array.from(this.users.values()).find(u => u.id === session.userId);
            if (!user) {
                this.clearSession();
                return;
            }

            this.currentUser = user;
            this.app.state.currentUser = user;
            this.app.state.adminLoggedIn = user.role === 'admin';

            // Extend session if remember me is enabled
            if (rememberMe) {
                session.expiresAt = Date.now() + this.config.sessionDuration;
            }

            await this.loadUserPreferences();

        } catch (error) {
            console.error('Failed to restore session:', error);
            this.clearSession();
        }
    }

    async loadUserPreferences() {
        if (!this.currentUser) return;

        this.userPreferences = this.currentUser.preferences || {};

        // Apply user preferences
        if (this.userPreferences.theme) {
            this.app.applyTheme(this.userPreferences.theme);
        }

        // Update UI based on preferences
        this.updateUserPreferencesUI();
    }

    updateUserPreferencesUI() {
        // Update theme toggle
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.classList.toggle('active', 
                option.dataset.theme === this.userPreferences.theme
            );
        });

        // Update language selector
        const languageSelect = document.getElementById('footerLanguage');
        if (languageSelect && this.userPreferences.language) {
            languageSelect.value = this.userPreferences.language;
        }
    }

    async handleLogout() {
        try {
            // Track analytics
            this.app.modules.analytics.trackEvent('auth', 'logout', this.currentUser.role);

            // Clear session
            this.clearSession();

            // Update UI
            this.updateAuthUI();

            // Show message
            this.app.showSuccess('Successfully logged out');

        } catch (error) {
            console.error('Logout failed:', error);
            this.app.showError('Logout failed');
        }
    }

    clearSession() {
        this.currentUser = null;
        this.app.state.currentUser = null;
        this.app.state.adminLoggedIn = false;

        localStorage.removeItem('graphz_session');
        this.sessions.clear();

        this.updateAuthUI();
    }

    updateAuthUI() {
        const userMenu = document.getElementById('userDropdown');
        const adminLink = document.getElementById('adminLink');

        if (this.currentUser) {
            // User is logged in
            if (userMenu) {
                userMenu.innerHTML = `
                    <div class="user-info">
                        <span class="user-name">${this.currentUser.name}</span>
                        <span class="user-status">${this.currentUser.role}</span>
                    </div>
                    <div class="user-actions">
                        <button class="user-action-btn" id="profileBtn">
                            <i class="fas fa-user" aria-hidden="true"></i>
                            Profile
                        </button>
                        <button class="user-action-btn" id="settingsBtn">
                            <i class="fas fa-cog" aria-hidden="true"></i>
                            Settings
                        </button>
                        <button class="user-action-btn" id="logoutBtn">
                            <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
                            Logout
                        </button>
                    </div>
                `;
            }

            // Show admin link if user is admin
            if (adminLink && this.currentUser.role === 'admin') {
                adminLink.style.display = 'block';
            }

        } else {
            // User is not logged in
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

            // Hide admin link
            if (adminLink) {
                adminLink.style.display = 'none';
            }
        }
    }

    showAuthModal(tab = 'login') {
        const modal = document.getElementById('authModal');
        if (!modal) return;

        // Show the modal
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');

        // Switch to specified tab
        this.switchAuthTab(tab);

        // Add overlay
        this.showModalOverlay('authModal');
    }

    switchAuthTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.auth-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
            content.setAttribute('aria-hidden', content.id !== `${tabName}Tab`);
        });
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
        this.hideModalOverlay('authModal');
    }

    showAdminAccessModal() {
        const modal = document.getElementById('adminAccessModal');
        if (!modal) return;

        // Update last access info
        this.updateAdminAccessInfo();

        // Show modal
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        this.showModalOverlay('adminAccessModal');
    }

    updateAdminAccessInfo() {
        const lastAccessElement = document.getElementById('lastAdminAccess');
        if (lastAccessElement) {
            const lastAccess = localStorage.getItem('graphz_last_admin_access');
            lastAccessElement.textContent = lastAccess || 'No recent access';
        }
    }

    async handleAdminLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            // Authenticate admin
            const user = await this.authenticateUser(email, password);
            if (!user || user.role !== 'admin') {
                throw new Error('Invalid admin credentials');
            }

            // Create admin session
            await this.createUserSession(user, true);

            // Record admin access
            localStorage.setItem('graphz_last_admin_access', 
                new Date().toLocaleString('bn-BD')
            );

            // Show success and open admin panel
            this.app.showSuccess('Admin access granted');
            this.closeAdminAccessModal();
            
            // Open admin panel
            this.app.modules.adminPanel.show();

        } catch (error) {
            console.error('Admin login failed:', error);
            this.app.showError('Admin access denied: ' + error.message);
        }
    }

    closeAdminAccessModal() {
        const modal = document.getElementById('adminAccessModal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
        this.hideModalOverlay('adminAccessModal');
    }

    // Utility methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    hashPassword(password) {
        // In a real application, use a proper hashing library like bcrypt
        // This is a simple demonstration only
        return btoa(password + 'graphz_salt_2024');
    }

    generateId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
    }

    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    recordFailedAttempt(email) {
        const attemptsKey = `login_attempts_${email}`;
        const lockoutKey = `lockout_${email}`;
        
        let attempts = parseInt(localStorage.getItem(attemptsKey) || '0');
        attempts++;
        
        localStorage.setItem(attemptsKey, attempts.toString());
        
        if (attempts >= this.config.maxLoginAttempts) {
            localStorage.setItem(lockoutKey, (Date.now() + this.config.lockoutTime).toString());
        }
    }

    isAccountLocked(email) {
        const lockoutKey = `lockout_${email}`;
        const lockoutUntil = localStorage.getItem(lockoutKey);
        
        if (lockoutUntil && Date.now() < parseInt(lockoutUntil)) {
            return true;
        }
        
        // Clear lockout if time has passed
        if (lockoutUntil && Date.now() >= parseInt(lockoutUntil)) {
            localStorage.removeItem(lockoutKey);
            localStorage.removeItem(`login_attempts_${email}`);
        }
        
        return false;
    }

    async sendVerificationEmail(user) {
        // In a real application, this would send an actual email
        console.log('Verification email sent to:', user.email);
        
        // For demo purposes, we'll simulate email verification
        setTimeout(() => {
            user.isVerified = true;
            this.users.set(user.email, user);
            this.saveUsers();
            this.app.showInfo('Email verified successfully!');
        }, 3000);
    }

    async handlePasswordReset(form) {
        const formData = new FormData(form);
        const email = formData.get('email');

        try {
            if (!this.validateEmail(email)) {
                throw new Error('Invalid email format');
            }

            if (!this.users.has(email)) {
                // Don't reveal whether email exists for security
                this.app.showSuccess('If the email exists, a reset link has been sent.');
                return;
            }

            // Send reset email (simulated)
            await this.sendPasswordResetEmail(email);
            this.app.showSuccess('Password reset link sent to your email');
            this.switchAuthTab('login');

        } catch (error) {
            this.app.showError('Failed to send reset email: ' + error.message);
        }
    }

    async sendPasswordResetEmail(email) {
        // In a real application, this would send an actual email
        console.log('Password reset email sent to:', email);
        
        // Simulate email sending
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    async saveUsers() {
        try {
            const usersArray = Array.from(this.users.values());
            localStorage.setItem('graphz_users', JSON.stringify(usersArray));
        } catch (error) {
            console.error('Failed to save users:', error);
        }
    }

    showModalOverlay(modalId) {
        const overlay = document.querySelector(`#${modalId} .modal-overlay`);
        if (overlay) {
            overlay.style.display = 'block';
        }
    }

    hideModalOverlay(modalId) {
        const overlay = document.querySelector(`#${modalId} .modal-overlay`);
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // User profile management
    async updateUserProfile(userId, updates) {
        const user = Array.from(this.users.values()).find(u => u.id === userId);
        if (!user) {
            throw new Error('User not found');
        }

        Object.assign(user, updates);
        this.users.set(user.email, user);
        await this.saveUsers();

        // Update current user if it's the same user
        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = user;
            this.app.state.currentUser = user;
        }

        return user;
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = Array.from(this.users.values()).find(u => u.id === userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password
        const currentPasswordHash = this.hashPassword(currentPassword);
        if (user.password !== currentPasswordHash) {
            throw new Error('Current password is incorrect');
        }

        // Validate new password
        const passwordStrength = this.validatePasswordStrength(newPassword);
        if (!passwordStrength.isStrong) {
            throw new Error(`New password is weak: ${passwordStrength.errors.join(', ')}`);
        }

        // Update password
        user.password = this.hashPassword(newPassword);
        this.users.set(user.email, user);
        await this.saveUsers();

        return true;
    }

    // User statistics and progress
    trackUserActivity(activityType, metadata = {}) {
        if (!this.currentUser) return;

        // Update user stats
        switch (activityType) {
            case 'graph_view':
                this.currentUser.stats.graphsViewed++;
                break;
            case 'quiz_complete':
                this.currentUser.stats.quizzesCompleted++;
                break;
            case 'learning_time':
                this.currentUser.stats.totalLearningTime += metadata.duration || 0;
                break;
        }

        // Save updated user data
        this.users.set(this.currentUser.email, this.currentUser);
        this.saveUsers();

        // Track analytics
        this.app.modules.analytics.trackEvent('user', activityType, metadata);
    }

    getUserStats() {
        return this.currentUser ? this.currentUser.stats : null;
    }

    // Feedback submission
    async submitFeedback(feedback) {
        if (!this.currentUser) {
            throw new Error('Please log in to submit feedback');
        }

        const feedbackData = {
            id: this.generateId(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            type: feedback.type,
            graphId: feedback.graphId,
            message: feedback.message,
            rating: feedback.rating,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        // Save feedback to localStorage (in a real app, this would go to a backend)
        const existingFeedback = JSON.parse(localStorage.getItem('graphz_feedback') || '[]');
        existingFeedback.push(feedbackData);
        localStorage.setItem('graphz_feedback', JSON.stringify(existingFeedback));

        // Track analytics
        this.app.modules.analytics.trackEvent('feedback', 'submit', feedback.type);

        return feedbackData;
    }

    // Admin methods
    getAllUsers() {
        return Array.from(this.users.values());
    }

    async updateUserRole(userId, newRole) {
        const user = Array.from(this.users.values()).find(u => u.id === userId);
        if (!user) {
            throw new Error('User not found');
        }

        user.role = newRole;
        this.users.set(user.email, user);
        await this.saveUsers();

        return user;
    }

    async deleteUser(userId) {
        const user = Array.from(this.users.values()).find(u => u.id === userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Cannot delete current user
        if (this.currentUser && this.currentUser.id === userId) {
            throw new Error('Cannot delete your own account');
        }

        this.users.delete(user.email);
        await this.saveUsers();

        return true;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManager;
}

// admin-panel.js
class AdminPanel {
    constructor(app) {
        this.app = app;
        this.isOpen = false;
        this.currentTab = 'dashboard';
        this.graphs = new Map();
        this.users = new Map();
        this.feedback = [];
        this.analytics = {};
        
        this.config = {
            itemsPerPage: 10,
            maxBulkUpload: 100,
            backupInterval: 24 * 60 * 60 * 1000, // 24 hours
            sessionTimeout: 60 * 60 * 1000 // 1 hour
        };
    }

    async init() {
        await this.loadAdminData();
        this.setupEventListeners();
        this.initializeAdminUI();
        this.startSessionTimer();
    }

    async loadAdminData() {
        try {
            // Load graphs data
            const graphsData = this.app.modules.graphManager.getAllGraphs();
            graphsData.forEach(graph => this.graphs.set(graph.id, graph));

            // Load users data
            this.users = this.app.modules.userManager.getAllUsers().reduce((map, user) => {
                map.set(user.id, user);
                return map;
            }, new Map());

            // Load feedback
            const feedbackData = localStorage.getItem('graphz_feedback');
            if (feedbackData) {
                this.feedback = JSON.parse(feedbackData);
            }

            // Load analytics data
            await this.loadAnalytics();

        } catch (error) {
            console.error('Failed to load admin data:', error);
        }
    }

    async loadAnalytics() {
        // Sample analytics data
        this.analytics = {
            totalGraphs: this.graphs.size,
            totalUsers: this.users.size,
            totalDownloads: this.calculateTotalDownloads(),
            dailyActiveUsers: this.calculateDAU(),
            popularGraphs: this.getPopularGraphs(5),
            userGrowth: this.calculateUserGrowth(),
            trafficSources: this.getTrafficSources()
        };
    }

    setupEventListeners() {
        // Admin panel toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#adminLink') || e.target.closest('#adminAccessBtn')) {
                this.show();
            }
        });

        // Tab navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.admin-nav-btn')) {
                const tab = e.target.closest('.admin-nav-btn').dataset.tab;
                this.switchTab(tab);
            }
        });

        // Close admin panel
        document.addEventListener('click', (e) => {
            if (e.target.closest('#closeAdminPanel') || e.target.closest('#adminPanelOverlay')) {
                this.hide();
            }
        });

        // Graph management
        document.addEventListener('click', (e) => {
            if (e.target.closest('#addGraphBtn')) {
                this.showAddGraphForm();
            }
            if (e.target.closest('#bulkUploadBtn')) {
                this.showBulkUploadForm();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'graphUploadForm') {
                e.preventDefault();
                this.handleGraphUpload(e.target);
            }
            if (e.target.id === 'bulkUploadForm') {
                e.preventDefault();
                this.handleBulkUpload(e.target);
            }
        });
    }

    initializeAdminUI() {
        this.initializeDashboard();
        this.initializeGraphManagement();
        this.initializeUserManagement();
    }

    show() {
        if (!this.app.state.adminLoggedIn) {
            this.app.showWarning('Admin access required');
            return;
        }

        const panel = document.getElementById('adminPanel');
        if (panel) {
            panel.style.display = 'block';
            panel.setAttribute('aria-hidden', 'false');
            this.isOpen = true;

            // Load current tab data
            this.refreshCurrentTab();

            // Update session timer
            this.resetSessionTimer();
        }
    }

    hide() {
        const panel = document.getElementById('adminPanel');
        if (panel) {
            panel.style.display = 'none';
            panel.setAttribute('aria-hidden', 'true');
            this.isOpen = false;
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
            content.setAttribute('aria-hidden', content.id !== `${tabName}Tab`);
        });

        // Load tab data
        this.refreshCurrentTab();
    }

    refreshCurrentTab() {
        switch (this.currentTab) {
            case 'dashboard':
                this.refreshDashboard();
                break;
            case 'graph-management':
                this.refreshGraphManagement();
                break;
            case 'content-upload':
                this.refreshContentUpload();
                break;
            case 'user-management':
                this.refreshUserManagement();
                break;
            case 'feedback-management':
                this.refreshFeedbackManagement();
                break;
            case 'analytics':
                this.refreshAnalytics();
                break;
        }
    }

    // Dashboard Tab
    initializeDashboard() {
        this.setupDashboardCharts();
        this.setupQuickActions();
    }

    refreshDashboard() {
        this.updateDashboardStats();
        this.updateActivityLog();
        this.updateSystemHealth();
    }

    updateDashboardStats() {
        const stats = {
            'totalGraphsAdmin': this.analytics.totalGraphs,
            'totalUsersAdmin': this.analytics.totalUsers,
            'totalDownloadsAdmin': this.analytics.totalDownloads,
            'pendingFeedback': this.feedback.filter(f => f.status === 'pending').length
        };

        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    setupDashboardCharts() {
        // Initialize charts for analytics visualization
        // This would use Chart.js or similar library
        console.log('Initializing dashboard charts...');
    }

    setupQuickActions() {
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('.quick-action-btn').dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    handleQuickAction(action) {
        switch (action) {
            case 'add-graph':
                this.switchTab('content-upload');
                break;
            case 'manage-users':
                this.switchTab('user-management');
                break;
            case 'view-analytics':
                this.switchTab('analytics');
                break;
            case 'backup-data':
                this.createBackup();
                break;
        }
    }

    // Graph Management Tab
    initializeGraphManagement() {
        this.setupGraphTable();
        this.setupGraphFilters();
    }

    refreshGraphManagement() {
        this.updateGraphsTable();
        this.updateGraphFilters();
    }

    setupGraphTable() {
        // Initialize DataTables or similar for graph management
        this.updateGraphsTable();
    }

    updateGraphsTable() {
        const tableBody = document.getElementById('graphsTableBody');
        if (!tableBody) return;

        const graphs = Array.from(this.graphs.values());
        
        tableBody.innerHTML = graphs.map(graph => `
            <tr data-graph-id="${graph.id}">
                <td>
                    <input type="checkbox" class="graph-checkbox" value="${graph.id}">
                </td>
                <td>${graph.title}</td>
                <td>${graph.subject}</td>
                <td>${graph.class}</td>
                <td>${graph.type}</td>
                <td>
                    <span class="status-badge ${graph.status || 'published'}">
                        ${graph.status || 'published'}
                    </span>
                </td>
                <td>${this.app.formatNumber(graph.views || 0)}</td>
                <td>${this.app.formatNumber(graph.downloads || 0)}</td>
                <td>${this.formatDate(graph.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action edit-graph" data-graph-id="${graph.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action delete-graph" data-graph-id="${graph.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-action preview-graph" data-graph-id="${graph.id}" title="Preview">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners for action buttons
        this.setupGraphActionHandlers();
    }

    setupGraphActionHandlers() {
        document.querySelectorAll('.edit-graph').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const graphId = e.target.closest('.edit-graph').dataset.graphId;
                this.editGraph(graphId);
            });
        });

        document.querySelectorAll('.delete-graph').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const graphId = e.target.closest('.delete-graph').dataset.graphId;
                this.deleteGraph(graphId);
            });
        });

        document.querySelectorAll('.preview-graph').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const graphId = e.target.closest('.preview-graph').dataset.graphId;
                this.previewGraph(graphId);
            });
        });
    }

    async editGraph(graphId) {
        const graph = this.graphs.get(graphId);
        if (!graph) {
            this.app.showError('Graph not found');
            return;
        }

        // Switch to content upload tab with graph data
        this.switchTab('content-upload');
        this.populateGraphForm(graph);
    }

    populateGraphForm(graph) {
        // Populate form fields with graph data
        const form = document.getElementById('graphUploadForm');
        if (!form) return;

        Object.keys(graph).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = graph[key];
                } else {
                    input.value = graph[key];
                }
            }
        });

        // Update form title
        const formTitle = form.querySelector('h4') || form.querySelector('h3');
        if (formTitle) {
            formTitle.textContent = 'Edit Graph';
        }

        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth' });
    }

    async deleteGraph(graphId) {
        if (!confirm('Are you sure you want to delete this graph? This action cannot be undone.')) {
            return;
        }

        try {
            this.graphs.delete(graphId);
            await this.saveGraphs();
            this.refreshGraphManagement();
            this.app.showSuccess('Graph deleted successfully');
        } catch (error) {
            console.error('Failed to delete graph:', error);
            this.app.showError('Failed to delete graph');
        }
    }

    previewGraph(graphId) {
        this.app.modules.graphManager.openGraphModal(graphId);
        this.hide(); // Hide admin panel to show graph modal
    }

    // Content Upload Tab
    refreshContentUpload() {
        this.setupFileUpload();
        this.setupFormValidation();
    }

    setupFileUpload() {
        // Initialize file upload areas
        const uploadAreas = ['imageUploadArea', 'bulkUploadArea'];
        
        uploadAreas.forEach(areaId => {
            const area = document.getElementById(areaId);
            if (area) {
                this.initializeUploadArea(area);
            }
        });
    }

    initializeUploadArea(uploadArea) {
        const fileInput = uploadArea.querySelector('input[type="file"]');
        if (!fileInput) return;

        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                this.handleFileSelection(files[0], uploadArea);
            }
        });

        // Click to browse
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File selection change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelection(e.target.files[0], uploadArea);
            }
        });
    }

    handleFileSelection(file, uploadArea) {
        const fileInfo = uploadArea.querySelector('.file-info');
        if (fileInfo) {
            fileInfo.innerHTML = `
                <div class="file-info-content">
                    <i class="fas fa-file"></i>
                    <div>
                        <strong>${file.name}</strong>
                        <span>${this.formatFileSize(file.size)}</span>
                    </div>
                </div>
            `;
        }

        // Show preview for images
        if (file.type.startsWith('image/')) {
            this.showImagePreview(file, uploadArea);
        }
    }

    showImagePreview(file, uploadArea) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = uploadArea.querySelector('.image-preview') || 
                           this.createImagePreview(uploadArea);
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }

    createImagePreview(uploadArea) {
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        uploadArea.appendChild(preview);
        return preview;
    }

    async handleGraphUpload(form) {
        const formData = new FormData(form);
        
        try {
            // Validate form data
            await this.validateGraphForm(formData);

            // Create graph object
            const graph = await this.createGraphFromFormData(formData);

            // Add to graphs
            this.graphs.set(graph.id, graph);
            await this.saveGraphs();

            // Update main app graph manager
            this.app.modules.graphManager.graphs.set(graph.id, graph);

            // Reset form
            form.reset();
            this.clearFilePreviews();

            // Show success
            this.app.showSuccess('Graph uploaded successfully');

            // Refresh graph management table
            this.refreshGraphManagement();

        } catch (error) {
            console.error('Graph upload failed:', error);
            this.app.showError('Upload failed: ' + error.message);
        }
    }

    async validateGraphForm(formData) {
        const title = formData.get('title');
        const subject = formData.get('subject');
        const graphClass = formData.get('class');
        const imageFile = formData.get('image');

        if (!title || title.length < 2) {
            throw new Error('Graph title must be at least 2 characters');
        }

        if (!subject) {
            throw new Error('Please select a subject');
        }

        if (!graphClass) {
            throw new Error('Please select a class');
        }

        if (!imageFile || imageFile.size === 0) {
            throw new Error('Please select an image file');
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(imageFile.type)) {
            throw new Error('Please select a valid image file (JPEG, PNG, WebP, or SVG)');
        }

        // Validate file size (10MB max)
        if (imageFile.size > 10 * 1024 * 1024) {
            throw new Error('Image file size must be less than 10MB');
        }
    }

    async createGraphFromFormData(formData) {
        const imageFile = formData.get('image');
        const imageUrl = await this.uploadImage(imageFile);

        return {
            id: this.generateGraphId(),
            title: formData.get('title'),
            description: formData.get('description'),
            subject: formData.get('subject'),
            class: formData.get('class'),
            chapter: formData.get('chapter'),
            type: formData.get('type') || 'static',
            difficulty: formData.get('difficulty') || 'medium',
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
            keywords: formData.get('keywords') ? formData.get('keywords').split(',').map(kw => kw.trim()) : [],
            aliases: formData.get('aliases') ? formData.get('aliases').split(',').map(alias => alias.trim()) : [],
            equation: formData.get('equation'),
            source: formData.get('source'),
            staticImage: imageUrl,
            interactive: formData.get('interactive') === 'on',
            status: formData.get('status') || 'published',
            featured: formData.get('featured') === 'on',
            views: 0,
            downloads: 0,
            rating: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    async uploadImage(file) {
        // In a real application, this would upload to a server
        // For demo purposes, we'll create a blob URL
        return URL.createObjectURL(file);
    }

    async handleBulkUpload(form) {
        const formData = new FormData(form);
        const file = formData.get('bulkFile');

        try {
            if (!file) {
                throw new Error('Please select a file');
            }

            const data = await this.parseBulkFile(file);
            await this.processBulkData(data);

            this.app.showSuccess(`Successfully uploaded ${data.length} graphs`);

        } catch (error) {
            console.error('Bulk upload failed:', error);
            this.app.showError('Bulk upload failed: ' + error.message);
        }
    }

    async parseBulkFile(file) {
        return new Promise((resolve, reject) => {
            if (file.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        resolve(data);
                    } catch (error) {
                        reject(new Error('Invalid JSON file'));
                    }
                };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsText(file);
            } else if (file.type === 'text/csv') {
                Papa.parse(file, {
                    complete: (results) => {
                        if (results.errors.length > 0) {
                            reject(new Error('CSV parsing error: ' + results.errors[0].message));
                        } else {
                            resolve(this.csvToGraphs(results.data));
                        }
                    },
                    error: (error) => reject(new Error('CSV parsing failed: ' + error.message))
                });
            } else {
                reject(new Error('Unsupported file format. Please use JSON or CSV.'));
            }
        });
    }

    csvToGraphs(csvData) {
        // Convert CSV data to graph objects
        // This is a simplified implementation
        const headers = csvData[0];
        return csvData.slice(1).map(row => {
            const graph = {};
            headers.forEach((header, index) => {
                graph[header] = row[index];
            });
            return graph;
        });
    }

    async processBulkData(data) {
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format. Expected an array of graphs.');
        }

        if (data.length > this.config.maxBulkUpload) {
            throw new Error(`Too many graphs. Maximum allowed: ${this.config.maxBulkUpload}`);
        }

        const progressElement = document.getElementById('bulkUploadProgress');
        if (progressElement) {
            progressElement.style.display = 'block';
        }

        for (let i = 0; i < data.length; i++) {
            const graphData = data[i];
            
            try {
                const graph = await this.createGraphFromBulkData(graphData);
                this.graphs.set(graph.id, graph);

                // Update progress
                const progress = ((i + 1) / data.length) * 100;
                this.updateBulkProgress(progress, i + 1, data.length);

            } catch (error) {
                console.error(`Failed to process graph ${i + 1}:`, error);
            }
        }

        await this.saveGraphs();
        
        if (progressElement) {
            progressElement.style.display = 'none';
        }
    }

    updateBulkProgress(percent, current, total) {
        const progressFill = document.getElementById('bulkProgressFill');
        const progressText = document.getElementById('bulkProgressText');
        const progressPercent = document.getElementById('bulkProgressPercent');

        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
        if (progressText) {
            progressText.textContent = `Processing ${current} of ${total} graphs`;
        }
        if (progressPercent) {
            progressPercent.textContent = `${Math.round(percent)}%`;
        }
    }

    // Utility methods
    generateGraphId() {
        return 'graph_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('bn-BD');
    }

    calculateTotalDownloads() {
        return Array.from(this.graphs.values()).reduce((total, graph) => 
            total + (graph.downloads || 0), 0
        );
    }

    calculateDAU() {
        // Simplified DAU calculation
        return Math.floor(this.users.size * 0.1); // 10% of total users
    }

    getPopularGraphs(limit = 5) {
        return Array.from(this.graphs.values())
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, limit);
    }

    calculateUserGrowth() {
        // Simplified user growth calculation
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsers = Array.from(this.users.values()).filter(user => 
            new Date(user.createdAt) > oneWeekAgo
        ).length;
        
        return {
            weekly: newUsers,
            growthRate: ((newUsers / this.users.size) * 100).toFixed(1)
        };
    }

    getTrafficSources() {
        // Sample traffic sources
        return {
            direct: 45,
            search: 30,
            social: 15,
            referral: 10
        };
    }

    clearFilePreviews() {
        document.querySelectorAll('.image-preview').forEach(preview => {
            preview.innerHTML = '';
        });
        document.querySelectorAll('.file-info').forEach(info => {
            info.innerHTML = '';
        });
    }

    async saveGraphs() {
        try {
            const graphsArray = Array.from(this.graphs.values());
            localStorage.setItem('graphz_admin_graphs', JSON.stringify(graphsArray));
        } catch (error) {
            console.error('Failed to save graphs:', error);
            throw error;
        }
    }

    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            if (this.isOpen) {
                this.sessionDuration--;
                this.updateSessionTimer();
                
                if (this.sessionDuration <= 0) {
                    this.handleSessionTimeout();
                }
            }
        }, 1000);
    }

    resetSessionTimer() {
        this.sessionDuration = this.config.sessionTimeout / 1000;
        this.updateSessionTimer();
    }

    updateSessionTimer() {
        const timerElement = document.getElementById('adminSessionTime');
        if (timerElement) {
            const hours = Math.floor(this.sessionDuration / 3600);
            const minutes = Math.floor((this.sessionDuration % 3600) / 60);
            const seconds = this.sessionDuration % 60;
            timerElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    handleSessionTimeout() {
        this.app.showWarning('Admin session timed out');
        this.hide();
        this.app.modules.userManager.handleLogout();
    }

    async createBackup() {
        try {
            const backupData = {
                graphs: Array.from(this.graphs.values()),
                users: Array.from(this.users.values()),
                feedback: this.feedback,
                analytics: this.analytics,
                timestamp: new Date().toISOString(),
                version: this.app.version
            };

            const blob = new Blob([JSON.stringify(backupData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `graphz_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();

            URL.revokeObjectURL(url);
            
            this.app.showSuccess('Backup created successfully');
        } catch (error) {
            console.error('Backup failed:', error);
            this.app.showError('Backup creation failed');
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminPanel;
        }

// analytics-engine.js
class AnalyticsEngine {
    constructor(app) {
        this.app = app;
        this.events = new Map();
        this.userJourney = [];
        this.metrics = {
            pageViews: 0,
            uniqueVisitors: 0,
            graphViews: 0,
            quizCompletions: 0,
            downloads: 0,
            averageSessionTime: 0
        };
        
        this.config = {
            trackUserJourney: true,
            trackPerformance: true,
            trackErrors: true,
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            batchInterval: 10000, // 10 seconds
            maxEventsPerBatch: 50
        };
    }

    async init() {
        this.setupTracking();
        this.setupPerformanceMonitoring();
        this.setupErrorTracking();
        this.startBatchProcessing();
        this.loadHistoricalData();
    }

    setupTracking() {
        // Page view tracking
        this.trackPageView();

        // User interaction tracking
        this.setupInteractionTracking();

        // Session tracking
        this.setupSessionTracking();

        // Graph specific tracking
        this.setupGraphTracking();

        // Quiz tracking
        this.setupQuizTracking();
    }

    trackPageView() {
        const pageData = {
            url: window.location.href,
            referrer: document.referrer,
            title: document.title,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            language: navigator.language
        };

        this.trackEvent('page', 'view', pageData);
        this.metrics.pageViews++;

        // Track time on page
        window.addEventListener('beforeunload', () => {
            this.trackEvent('page', 'unload', {
                timeOnPage: Date.now() - pageData.timestamp
            });
        });
    }

    setupInteractionTracking() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target;
            const interactiveElement = target.closest('button, a, [data-track]');
            
            if (interactiveElement) {
                this.trackInteraction(interactiveElement);
            }
        });

        // Track form interactions
        document.addEventListener('submit', (e) => {
            this.trackEvent('form', 'submit', {
                formId: e.target.id,
                formAction: e.target.action
            });
        });

        // Track search queries
        const searchInput = document.getElementById('mainSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', 
                this.app.debounce((e) => {
                    if (e.target.value.length >= 2) {
                        this.trackEvent('search', 'query', {
                            query: e.target.value,
                            length: e.target.value.length
                        });
                    }
                }, 1000)
            );
        }
    }

    trackInteraction(element) {
        const trackData = {
            element: element.tagName,
            text: element.textContent?.trim().substring(0, 100),
            id: element.id,
            classes: element.className,
            href: element.href,
            type: element.type
        };

        this.trackEvent('interaction', 'click', trackData);
    }

    setupSessionTracking() {
        this.sessionStartTime = Date.now();
        this.lastActivityTime = Date.now();

        // Track user activity
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(eventType => {
            document.addEventListener(eventType, 
                this.app.throttle(() => {
                    this.lastActivityTime = Date.now();
                }, 5000)
            );
        });

        // Check session timeout
        setInterval(() => {
            if (Date.now() - this.lastActivityTime > this.config.sessionTimeout) {
                this.endSession();
                this.startNewSession();
            }
        }, 10000);
    }

    startNewSession() {
        this.sessionStartTime = Date.now();
        this.lastActivityTime = Date.now();
        this.metrics.uniqueVisitors++;
        
        this.trackEvent('session', 'start', {
            sessionId: this.generateSessionId(),
            startTime: this.sessionStartTime
        });
    }

    endSession() {
        const sessionDuration = Date.now() - this.sessionStartTime;
        this.trackEvent('session', 'end', {
            sessionId: this.currentSessionId,
            duration: sessionDuration
        });

        // Update average session time
        this.updateAverageSessionTime(sessionDuration);
    }

    setupGraphTracking() {
        // Track graph views
        this.app.modules.graphManager.on('graphView', (graphId) => {
            this.trackGraphView(graphId);
        });

        // Track graph downloads
        this.app.modules.graphManager.on('graphDownload', (graphId) => {
            this.trackGraphDownload(graphId);
        });

        // Track graph interactions
        this.app.modules.graphManager.on('graphInteraction', (graphId, interactionType) => {
            this.trackGraphInteraction(graphId, interactionType);
        });
    }

    setupQuizTracking() {
        // Track quiz starts and completions
        this.app.modules.quizEngine.on('quizStart', (quizId) => {
            this.trackQuizStart(quizId);
        });

        this.app.modules.quizEngine.on('quizComplete', (quizId, score) => {
            this.trackQuizComplete(quizId, score);
        });

        this.app.modules.quizEngine.on('quizAnswer', (quizId, questionId, isCorrect) => {
            this.trackQuizAnswer(quizId, questionId, isCorrect);
        });
    }

    setupPerformanceMonitoring() {
        if (!this.config.trackPerformance) return;

        // Track page load performance
        window.addEventListener('load', () => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;

            this.trackEvent('performance', 'page_load', {
                loadTime: loadTime,
                domReadyTime: domReadyTime,
                readyStart: perfData.fetchStart - perfData.navigationStart,
                redirectTime: perfData.redirectEnd - perfData.redirectStart,
                appCacheTime: perfData.domainLookupStart - perfData.fetchStart,
                dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
                tcpTime: perfData.connectEnd - perfData.connectStart,
                requestTime: perfData.responseEnd - perfData.requestStart,
                initDomTreeTime: perfData.domInteractive - perfData.responseEnd,
                loadEventTime: perfData.loadEventEnd - perfData.loadEventStart
            });
        });

        // Track resource loading performance
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                this.trackEvent('performance', 'resource_load', {
                    name: entry.name,
                    duration: entry.duration,
                    size: entry.transferSize,
                    type: entry.entryType
                });
            });
        });

        observer.observe({ entryTypes: ['resource'] });

        // Track Core Web Vitals
        this.trackCoreWebVitals();
    }

    trackCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.trackEvent('performance', 'LCP', {
                value: lastEntry.renderTime || lastEntry.loadTime
            });
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                this.trackEvent('performance', 'FID', {
                    value: entry.processingStart - entry.startTime
                });
            });
        }).observe({ type: 'first-input', buffered: true });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.trackEvent('performance', 'CLS', { value: clsValue });
        }).observe({ type: 'layout-shift', buffered: true });
    }

    setupErrorTracking() {
        if (!this.config.trackErrors) return;

        // Track JavaScript errors
        window.addEventListener('error', (e) => {
            this.trackError('javascript', e.error?.message || e.message, {
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                stack: e.error?.stack
            });
        });

        // Track promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError('promise', e.reason?.message || 'Unhandled promise rejection', {
                stack: e.reason?.stack
            });
        });

        // Track console errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.trackError('console', args.join(' '));
            originalConsoleError.apply(console, args);
        };
    }

    // Core tracking methods
    trackEvent(category, action, data = {}) {
        const event = {
            id: this.generateEventId(),
            category,
            action,
            data,
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
            userId: this.app.state.currentUser?.id,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.events.set(event.id, event);
        
        if (this.config.trackUserJourney) {
            this.userJourney.push(event);
        }

        // Limit user journey size
        if (this.userJourney.length > 1000) {
            this.userJourney = this.userJourney.slice(-500);
        }

        // Update metrics based on event
        this.updateMetrics(event);

        return event.id;
    }

    trackGraphView(graphId) {
        const graph = this.app.modules.graphManager.getGraphById(graphId);
        if (graph) {
            this.trackEvent('graph', 'view', {
                graphId: graphId,
                graphTitle: graph.title,
                subject: graph.subject,
                class: graph.class,
                type: graph.type
            });
            this.metrics.graphViews++;
        }
    }

    trackGraphDownload(graphId) {
        const graph = this.app.modules.graphManager.getGraphById(graphId);
        if (graph) {
            this.trackEvent('graph', 'download', {
                graphId: graphId,
                graphTitle: graph.title,
                format: 'original'
            });
            this.metrics.downloads++;
        }
    }

    trackGraphInteraction(graphId, interactionType) {
        this.trackEvent('graph', 'interaction', {
            graphId: graphId,
            interactionType: interactionType
        });
    }

    trackQuizStart(quizId) {
        this.trackEvent('quiz', 'start', {
            quizId: quizId
        });
    }

    trackQuizComplete(quizId, score) {
        this.trackEvent('quiz', 'complete', {
            quizId: quizId,
            score: score,
            passed: score >= 60
        });
        this.metrics.quizCompletions++;
    }

    trackQuizAnswer(quizId, questionId, isCorrect) {
        this.trackEvent('quiz', 'answer', {
            quizId: quizId,
            questionId: questionId,
            isCorrect: isCorrect
        });
    }

    trackError(type, message, details = {}) {
        this.trackEvent('error', type, {
            message: message,
            ...details
        });
    }

    updateMetrics(event) {
        switch (event.category) {
            case 'page':
                if (event.action === 'view') {
                    this.metrics.pageViews++;
                }
                break;
            case 'graph':
                if (event.action === 'view') {
                    this.metrics.graphViews++;
                } else if (event.action === 'download') {
                    this.metrics.downloads++;
                }
                break;
            case 'quiz':
                if (event.action === 'complete') {
                    this.metrics.quizCompletions++;
                }
                break;
        }
    }

    // Batch processing for efficient data sending
    startBatchProcessing() {
        setInterval(() => {
            this.processBatch();
        }, this.config.batchInterval);
    }

    async processBatch() {
        if (this.events.size === 0) return;

        const batch = Array.from(this.events.values())
            .slice(0, this.config.maxEventsPerBatch);

        try {
            await this.sendBatchToServer(batch);
            
            // Remove sent events from the map
            batch.forEach(event => {
                this.events.delete(event.id);
            });

        } catch (error) {
            console.warn('Failed to send analytics batch:', error);
            // Retry logic could be implemented here
        }
    }

    async sendBatchToServer(batch) {
        // In a real application, this would send to your analytics server
        // For demo purposes, we'll store in localStorage
        
        const analyticsKey = 'graphz_analytics_queue';
        const existing = JSON.parse(localStorage.getItem(analyticsKey) || '[]');
        const updated = [...existing, ...batch];
        
        localStorage.setItem(analyticsKey, JSON.stringify(updated));
        
        // Simulate network delay
        return new Promise(resolve => setTimeout(resolve, 100));
    }

    // Reporting and insights
    getDashboardData(timeRange = '7d') {
        const range = this.getTimeRange(timeRange);
        const eventsInRange = this.getEventsInRange(range);
        
        return {
            summary: this.getSummaryMetrics(eventsInRange),
            popularGraphs: this.getPopularGraphs(eventsInRange),
            userActivity: this.getUserActivity(eventsInRange),
            performance: this.getPerformanceMetrics(eventsInRange),
            conversions: this.getConversionMetrics(eventsInRange)
        };
    }

    getSummaryMetrics(events) {
        const graphViews = events.filter(e => 
            e.category === 'graph' && e.action === 'view'
        ).length;

        const quizCompletions = events.filter(e => 
            e.category === 'quiz' && e.action === 'complete'
        ).length;

        const downloads = events.filter(e => 
            e.category === 'graph' && e.action === 'download'
        ).length;

        const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;

        return {
            graphViews,
            quizCompletions,
            downloads,
            uniqueUsers,
            totalEvents: events.length
        };
    }

    getPopularGraphs(events) {
        const graphViews = events.filter(e => 
            e.category === 'graph' && e.action === 'view'
        );

        const graphCounts = graphViews.reduce((acc, event) => {
            const graphId = event.data.graphId;
            acc[graphId] = (acc[graphId] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(graphCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([graphId, count]) => ({
                graphId,
                views: count,
                graph: this.app.modules.graphManager.getGraphById(graphId)
            }));
    }

    getUserActivity(events) {
        const activityByHour = new Array(24).fill(0);
        
        events.forEach(event => {
            const hour = new Date(event.timestamp).getHours();
            activityByHour[hour]++;
        });

        return activityByHour;
    }

    getPerformanceMetrics(events) {
        const perfEvents = events.filter(e => e.category === 'performance');
        
        return {
            averageLoadTime: this.calculateAverage(perfEvents, 'loadTime'),
            averageLCP: this.calculateAverage(perfEvents.filter(e => e.action === 'LCP'), 'value'),
            averageFID: this.calculateAverage(perfEvents.filter(e => e.action === 'FID'), 'value'),
            averageCLS: this.calculateAverage(perfEvents.filter(e => e.action === 'CLS'), 'value')
        };
    }

    getConversionMetrics(events) {
        const searchEvents = events.filter(e => 
            e.category === 'search' && e.action === 'query'
        );
        
        const graphViewEvents = events.filter(e => 
            e.category === 'graph' && e.action === 'view'
        );

        const downloadEvents = events.filter(e => 
            e.category === 'graph' && e.action === 'download'
        );

        return {
            searchToViewRate: graphViewEvents.length / Math.max(searchEvents.length, 1),
            viewToDownloadRate: downloadEvents.length / Math.max(graphViewEvents.length, 1),
            totalConversions: downloadEvents.length + events.filter(e => 
                e.category === 'quiz' && e.action === 'complete'
            ).length
        };
    }

    // Utility methods
    generateEventId() {
        return 'evt_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    generateSessionId() {
        this.currentSessionId = 'sess_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
        return this.currentSessionId;
    }

    getTimeRange(range) {
        const now = Date.now();
        switch (range) {
            case '24h':
                return { start: now - (24 * 60 * 60 * 1000), end: now };
            case '7d':
                return { start: now - (7 * 24 * 60 * 60 * 1000), end: now };
            case '30d':
                return { start: now - (30 * 24 * 60 * 60 * 1000), end: now };
            default:
                return { start: now - (7 * 24 * 60 * 60 * 1000), end: now };
        }
    }

    getEventsInRange(range) {
        return Array.from(this.events.values()).filter(event => 
            event.timestamp >= range.start && event.timestamp <= range.end
        );
    }

    calculateAverage(events, field) {
        if (events.length === 0) return 0;
        
        const sum = events.reduce((total, event) => 
            total + (event.data[field] || 0), 0
        );
        
        return sum / events.length;
    }

    updateAverageSessionTime(newSessionTime) {
        this.metrics.averageSessionTime = 
            (this.metrics.averageSessionTime + newSessionTime) / 2;
    }

    loadHistoricalData() {
        try {
            const stored = localStorage.getItem('graphz_analytics_metrics');
            if (stored) {
                const data = JSON.parse(stored);
                Object.assign(this.metrics, data);
            }
        } catch (error) {
            console.warn('Failed to load historical analytics data:', error);
        }
    }

    saveHistoricalData() {
        try {
            localStorage.setItem('graphz_analytics_metrics', 
                JSON.stringify(this.metrics)
            );
        } catch (error) {
            console.warn('Failed to save analytics data:', error);
        }
    }

    // GDPR compliance methods
    getUserEvents(userId) {
        return Array.from(this.events.values()).filter(event => 
            event.userId === useId
        );
    }

    deleteUserData(userId) {
        // Remove events for this user
        this.events.forEach((event, id) => {
            if (event.userId === userId) {
                this.events.delete(id);
            }
        });

        // Remove from user journey
        this.userJourney = this.userJourney.filter(event => 
            event.userId !== userId
        );

        this.saveHistoricalData();
    }

    exportUserData(userId) {
        const userEvents = this.getUserEvents(userId);
        return {
            events: userEvents,
            metrics: this.metrics,
            exportedAt: new Date().toISOString()
        };
    }

    // Event system for module communication
    on(event, callback) {
        if (!this.eventListeners) {
            this.eventListeners = new Map();
        }
        
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        
        this.eventListeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.eventListeners && this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsEngine;
    }

// chart-renderer.js
class ChartRenderer {
    constructor(app) {
        this.app = app;
        this.activeCharts = new Map();
        this.chartTemplates = new Map();
        this.interactiveStates = new Map();
        
        this.config = {
            defaultTheme: 'light',
            animationDuration: 1000,
            responsive: true,
            maintainAspectRatio: false,
            enableZoom: true,
            enableDownload: true
        };
    }

    async init() {
        await this.loadChartTemplates();
        this.setupGlobalChartConfig();
        this.setupEventListeners();
    }

    async loadChartTemplates() {
        // Define chart templates for different graph types
        this.chartTemplates.set('line', this.getLineChartTemplate());
        this.chartTemplates.set('bar', this.getBarChartTemplate());
        this.chartTemplates.set('scatter', this.getScatterChartTemplate());
        this.chartTemplates.set('pie', this.getPieChartTemplate());
        this.chartTemplates.set('radar', this.getRadarChartTemplate());
    }

    getLineChartTemplate() {
        return {
            type: 'line',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Line Chart'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'X Axis'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Y Axis'
                        }
                    }
                }
            }
        };
    }

    getBarChartTemplate() {
        return {
            type: 'bar',
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Bar Chart'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Categories'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Values'
                        }
                    }
                }
            }
        };
    }

    getScatterChartTemplate() {
        return {
            type: 'scatter',
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Scatter Plot'
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'X Values'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Y Values'
                        }
                    }
                }
            }
        };
    }

    setupGlobalChartConfig() {
        // Configure Chart.js global settings
        Chart.defaults.font.family = "'Inter', 'Segoe UI', 'Roboto', sans-serif";
        Chart.defaults.color = this.getThemeColor('text-secondary');
        Chart.defaults.plugins.tooltip.backgroundColor = this.getThemeColor('background-secondary');
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
    }

    setupEventListeners() {
        // Theme change listener
        this.app.modules.settings.on('themeChange', (theme) => {
            this.updateAllChartsTheme();
        });

        // Window resize listener
        window.addEventListener('resize', 
            this.app.throttle(() => this.handleResize(), 250)
        );
    }

    async renderGraph(graphId, containerId, options = {}) {
        try {
            const graph = this.app.modules.graphManager.getGraphById(graphId);
            if (!graph) {
                throw new Error(`Graph not found: ${graphId}`);
            }

            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container not found: ${containerId}`);
            }

            // Clear previous chart if exists
            this.destroyChart(containerId);

            // Determine chart type and configuration
            const chartConfig = await this.prepareChartConfig(graph, options);
            
            // Create canvas element
            const canvas = document.createElement('canvas');
            container.innerHTML = '';
            container.appendChild(canvas);

            // Create and store chart instance
            const chart = new Chart(canvas, chartConfig);
            this.activeCharts.set(containerId, chart);

            // Setup interactive controls if needed
            if (graph.interactive) {
                this.setupInteractiveControls(graph, containerId, chart);
            }

            // Track rendering
            this.app.modules.analytics.trackEvent('chart', 'render', graph.title, {
                type: chartConfig.type,
                interactive: graph.interactive
            });

            return chart;

        } catch (error) {
            console.error('Failed to render graph:', error);
            this.showError(containerId, error.message);
            throw error;
        }
    }

    async prepareChartConfig(graph, options) {
        let chartConfig;

        if (graph.chartConfig) {
            // Use predefined chart configuration
            chartConfig = this.mergeConfigs(
                this.chartTemplates.get(graph.chartConfig.type) || {},
                graph.chartConfig
            );
        } else if (graph.equation) {
            // Generate chart from equation
            chartConfig = await this.generateChartFromEquation(graph.equation, options);
        } else {
            // Default to line chart
            chartConfig = this.chartTemplates.get('line');
        }

        // Apply theme
        chartConfig = this.applyTheme(chartConfig);

        // Apply custom options
        chartConfig = this.mergeConfigs(chartConfig, options);

        return chartConfig;
    }

    async generateChartFromEquation(equation, options) {
        // Parse equation and generate data points
        const data = await this.equationToData(equation, options);
        
        return {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: equation,
                    data: data.values,
                    borderColor: this.getDefaultColor(0),
                    backgroundColor: this.getDefaultColor(0, 0.1),
                    tension: 0.1
                }]
            },
            options: {
                ...this.chartTemplates.get('line').options,
                plugins: {
                    title: {
                        display: true,
                        text: equation
                    }
                }
            }
        };
    }

    async equationToData(equation, options) {
        const range = options.range || { min: -10, max: 10, step: 0.5 };
        const data = {
            labels: [],
            values: []
        };

        try {
            // Simple equation parser (would be more sophisticated in real app)
            for (let x = range.min; x <= range.max; x += range.step) {
                const y = this.evaluateEquation(equation, x);
                data.labels.push(x.toFixed(1));
                data.values.push(y);
            }
        } catch (error) {
            console.error('Equation evaluation failed:', error);
            throw new Error('Invalid equation format');
        }

        return data;
    }

    evaluateEquation(equation, x) {
        // Replace variables with values
        let expression = equation
            .replace(/x/gi, x)
            .replace(/y\s*=/gi, '') // Remove y= prefix if present
            .replace(/\^/g, '**'); // Convert ^ to **

        try {
            // Safe evaluation (in real app, use a proper math parser)
            return Function(`"use strict"; return (${expression})`)();
        } catch (error) {
            throw new Error(`Failed to evaluate equation: ${equation}`);
        }
    }

    setupInteractiveControls(graph, containerId, chart) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Create controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'chart-controls';
        controlsContainer.innerHTML = this.getInteractiveControlsHTML(graph);

        container.appendChild(controlsContainer);

        // Setup event listeners for controls
        this.setupControlListeners(graph, containerId, chart, controlsContainer);
    }

    getInteractiveControlsHTML(graph) {
        if (graph.equation && graph.equation.includes('=')) {
            return this.getEquationControlsHTML(graph);
        } else if (graph.chartConfig && graph.chartConfig.interactive) {
            return this.getDatasetControlsHTML(graph);
        }

        return '<div class="no-controls">No interactive controls available</div>';
    }

    getEquationControlsHTML(graph) {
        // Extract parameters from equation
        const params = this.extractParameters(graph.equation);
        
        return `
            <div class="control-group">
                <h4>Equation Parameters</h4>
                ${params.map((param, index) => `
                    <div class="control-item">
                        <label for="param-${param}">${param}:</label>
                        <input type="range" id="param-${param}" 
                               min="0.1" max="10" step="0.1" value="1"
                               class="param-slider">
                        <span class="param-value">1</span>
                    </div>
                `).join('')}
                <div class="control-actions">
                    <button class="btn btn-sm btn-primary update-chart">Update</button>
                    <button class="btn btn-sm btn-outline reset-chart">Reset</button>
                </div>
            </div>
        `;
    }

    getDatasetControlsHTML(graph) {
        return `
            <div class="control-group">
                <h4>Chart Controls</h4>
                <div class="control-item">
                    <label for="chart-type">Chart Type:</label>
                    <select id="chart-type" class="form-control">
                        <option value="line">Line</option>
                        <option value="bar">Bar</option>
                        <option value="scatter">Scatter</option>
                    </select>
                </div>
                <div class="control-item">
                    <label>
                        <input type="checkbox" id="show-grid" checked>
                        Show Grid
                    </label>
                </div>
                <div class="control-item">
                    <label>
                        <input type="checkbox" id="smooth-line" checked>
                        Smooth Line
                    </label>
                </div>
            </div>
        `;
    }

    extractParameters(equation) {
        // Simple parameter extraction (would be more robust in real app)
        const matches = equation.match(/[a-zA-Z]+(?![^(]*\))/g) || [];
        return matches.filter(param => !['x', 'y', 'sin', 'cos', 'tan', 'log', 'ln'].includes(param.toLowerCase()));
    }

    setupControlListeners(graph, containerId, chart, controlsContainer) {
        // Parameter sliders
        controlsContainer.querySelectorAll('.param-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const valueDisplay = e.target.nextElementSibling;
                valueDisplay.textContent = e.target.value;
            });
        });

        // Update button
        const updateBtn = controlsContainer.querySelector('.update-chart');
        if (updateBtn) {
            updateBtn.addEventListener('click', async () => {
                await this.updateChartWithParameters(graph, containerId, chart, controlsContainer);
            });
        }

        // Reset button
        const resetBtn = controlsContainer.querySelector('.reset-chart');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetChartParameters(controlsContainer);
                updateBtn.click();
            });
        }

        // Chart type selector
        const typeSelector = controlsContainer.querySelector('#chart-type');
        if (typeSelector) {
            typeSelector.addEventListener('change', (e) => {
                chart.config.type = e.target.value;
                chart.update();
            });
        }

        // Other control listeners...
    }

    async updateChartWithParameters(graph, containerId, chart, controlsContainer) {
        const params = {};
        controlsContainer.querySelectorAll('.param-slider').forEach(slider => {
            const paramName = slider.id.replace('param-', '');
            params[paramName] = parseFloat(slider.value);
        });

        try {
            // Update equation with new parameters
            let updatedEquation = graph.equation;
            Object.entries(params).forEach(([param, value]) => {
                updatedEquation = updatedEquation.replace(
                    new RegExp(param, 'g'), 
                    value.toString()
                );
            });

            // Regenerate chart data
            const newConfig = await this.prepareChartConfig(
                { ...graph, equation: updatedEquation },
                { range: { min: -10, max: 10, step: 0.5 } }
            );

            // Update chart
            chart.data = newConfig.data;
            chart.update();

            // Track interaction
            this.app.modules.analytics.trackEvent('chart', 'parameter_change', graph.title, {
                parameters: params
            });

        } catch (error) {
            console.error('Failed to update chart:', error);
            this.app.showError('Failed to update chart');
        }
    }

    resetChartParameters(controlsContainer) {
        controlsContainer.querySelectorAll('.param-slider').forEach(slider => {
            slider.value = 1;
            const valueDisplay = slider.nextElementSibling;
            valueDisplay.textContent = '1';
        });
    }

    // Theme management
    applyTheme(chartConfig) {
        const isDark = this.app.state.currentTheme === 'dark';
        
        if (!chartConfig.options) chartConfig.options = {};
        if (!chartConfig.options.plugins) chartConfig.options.plugins = {};

        // Apply theme colors
        chartConfig.options.color = this.getThemeColor('text-secondary');
        chartConfig.options.backgroundColor = this.getThemeColor('background-primary');
        
        // Scale configurations
        if (!chartConfig.options.scales) chartConfig.options.scales = {};
        
        ['x', 'y'].forEach(axis => {
            if (!chartConfig.options.scales[axis]) chartConfig.options.scales[axis] = {};
            
            chartConfig.options.scales[axis].grid = {
                color: this.getThemeColor('border')
            };
            chartConfig.options.scales[axis].ticks = {
                color: this.getThemeColor('text-secondary')
            };
        });

        return chartConfig;
    }

    getThemeColor(type) {
        const colors = {
            light: {
                'background-primary': '#ffffff',
                'background-secondary': '#f8fafc',
                'text-primary': '#1e293b',
                'text-secondary': '#64748b',
                'border': '#e2e8f0'
            },
            dark: {
                'background-primary': '#0f172a',
                'background-secondary': '#1e293b',
                'text-primary': '#f1f5f9',
                'text-secondary': '#94a3b8',
                'border': '#334155'
            }
        };

        const theme = this.app.state.currentTheme;
        return colors[theme]?.[type] || colors.light[type];
    }

    getDefaultColor(index, alpha = 1) {
        const colors = [
            'rgba(59, 130, 246, ALPHA)',  // blue
            'rgba(239, 68, 68, ALPHA)',   // red
            'rgba(34, 197, 94, ALPHA)',   // green
            'rgba(245, 158, 11, ALPHA)',  // yellow
            'rgba(139, 92, 246, ALPHA)',  // purple
            'rgba(14, 165, 233, ALPHA)',  // cyan
        ];

        const color = colors[index % colors.length];
        return color.replace('ALPHA', alpha);
    }

    updateAllChartsTheme() {
        this.activeCharts.forEach((chart, containerId) => {
            const newConfig = this.applyTheme(chart.config);
            chart.options = newConfig.options;
            chart.update();
        });
    }

    // Utility methods
    mergeConfigs(baseConfig, overrideConfig) {
        const merge = (target, source) => {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    merge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
            return target;
        };

        return merge(JSON.parse(JSON.stringify(baseConfig)), overrideConfig);
    }

    destroyChart(containerId) {
        if (this.activeCharts.has(containerId)) {
            this.activeCharts.get(containerId).destroy();
            this.activeCharts.delete(containerId);
        }

        // Remove interactive state
        this.interactiveStates.delete(containerId);
    }

    destroyAllCharts() {
        this.activeCharts.forEach((chart, containerId) => {
            chart.destroy();
        });
        this.activeCharts.clear();
        this.interactiveStates.clear();
    }

    handleResize() {
        this.activeCharts.forEach(chart => {
            chart.resize();
        });
    }

    showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="chart-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                    <button class="btn btn-sm btn-outline retry-btn">Retry</button>
                </div>
            `;

            // Add retry functionality
            container.querySelector('.retry-btn').addEventListener('click', () => {
                this.retryRender(containerId);
            });
        }
    }

    async retryRender(containerId) {
        const graphId = this.interactiveStates.get(containerId)?.graphId;
        if (graphId) {
            await this.renderGraph(graphId, containerId);
        }
    }

    // Export and download
    async exportChart(containerId, format = 'png') {
        const chart = this.activeCharts.get(containerId);
        if (!chart) {
            throw new Error('No active chart found');
        }

        const image = chart.toBase64Image(`image/${format}`);
        return this.downloadImage(image, `chart-${Date.now()}.${format}`);
    }

    downloadImage(imageData, filename) {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = filename;
        link.click();
    }

    getChartData(containerId) {
        const chart = this.activeCharts.get(containerId);
        if (!chart) return null;

        return {
            labels: chart.data.labels,
            datasets: chart.data.datasets.map(dataset => ({
                label: dataset.label,
                data: dataset.data
            }))
        };
    }

    // Performance optimization
    pauseAnimations() {
        this.activeCharts.forEach(chart => {
            chart.options.animation = false;
        });
    }

    resumeAnimations() {
        this.activeCharts.forEach(chart => {
            chart.options.animation = { duration: this.config.animationDuration };
        });
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartRenderer;
        }

// file-handler.js
class FileHandler {
    constructor(app) {
        this.app = app;
        this.uploadQueue = new Map();
        this.downloadQueue = new Map();
        this.processingFiles = new Set();
        
        this.config = {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
            allowedDataTypes: ['text/csv', 'application/json'],
            maxConcurrentUploads: 3,
            chunkSize: 1024 * 1024, // 1MB chunks
            retryAttempts: 3,
            timeout: 30000 // 30 seconds
        };
    }

    async init() {
        this.setupEventListeners();
        this.setupDropZones();
        this.initializeWorkers();
    }

    setupEventListeners() {
        // File input change events
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file') {
                this.handleFileSelection(e.target);
            }
        });

        // Paste event for file pasting
        document.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });

        // Drag and drop events
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.handleDragOver(e);
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleDrop(e);
        });
    }

    setupDropZones() {
        // Initialize all drop zones
        document.querySelectorAll('.file-upload-area').forEach(area => {
            this.initializeDropZone(area);
        });
    }

    initializeDropZone(dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            this.handleDropZoneDrop(e, dropZone);
        });

        // Click to browse
        dropZone.addEventListener('click', () => {
            const fileInput = dropZone.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.click();
            }
        });
    }

    async handleFileSelection(fileInput) {
        const files = Array.from(fileInput.files);
        
        for (const file of files) {
            try {
                await this.processFile(file, fileInput);
            } catch (error) {
                console.error('File processing failed:', error);
                this.app.showError(`Failed to process ${file.name}: ${error.message}`);
            }
        }

        // Reset file input
        fileInput.value = '';
    }

    async processFile(file, fileInput) {
        // Validate file
        await this.validateFile(file);

        // Create file info
        const fileInfo = this.createFileInfo(file, fileInput);

        // Show preview if applicable
        if (this.isImageFile(file)) {
            await this.showImagePreview(file, fileInfo);
        }

        // Add to upload queue
        this.addToUploadQueue(fileInfo);

        // Start processing if not already running
        this.processUploadQueue();
    }

    async validateFile(file) {
        // Check file size
        if (file.size > this.config.maxFileSize) {
            throw new Error(`File size exceeds ${this.formatFileSize(this.config.maxFileSize)} limit`);
        }

        // Check file type
        const allowedTypes = [
            ...this.config.allowedImageTypes,
            ...this.config.allowedDataTypes
        ];

        if (!allowedTypes.includes(file.type)) {
            throw new Error('File type not supported');
        }

        // Additional validation based on file type
        if (this.isImageFile(file)) {
            await this.validateImageFile(file);
        } else if (file.type === 'text/csv') {
            await this.validateCSVFile(file);
        } else if (file.type === 'application/json') {
            await this.validateJSONFile(file);
        }
    }

    async validateImageFile(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                
                // Check dimensions
                if (img.width > 5000 || img.height > 5000) {
                    reject(new Error('Image dimensions too large (max 5000x5000)'));
                    return;
                }

                resolve();
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Invalid image file'));
            };

            img.src = url;
        });
    }

    async validateCSVFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const csvText = e.target.result;
                    const lines = csvText.split('\n');
                    
                    if (lines.length < 2) {
                        reject(new Error('CSV file must contain at least header and one data row'));
                        return;
                    }

                    // Basic CSV structure validation
                    const header = lines[0].split(',');
                    if (header.length < 2) {
                        reject(new Error('CSV must have at least 2 columns'));
                        return;
                    }

                    resolve();
                } catch (error) {
                    reject(new Error('Invalid CSV file format'));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read CSV file'));
            reader.readAsText(file);
        });
    }

    async validateJSONFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    JSON.parse(e.target.result);
                    resolve();
                } catch (error) {
                    reject(new Error('Invalid JSON file format'));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read JSON file'));
            reader.readAsText(file);
        });
    }

    createFileInfo(file, fileInput) {
        return {
            id: this.generateFileId(),
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadProgress: 0,
            status: 'pending',
            uploadStartTime: null,
            uploadSpeed: 0,
            retryCount: 0,
            element: fileInput.closest('.file-upload-area'),
            callback: fileInput.getAttribute('data-upload-callback')
        };
    }

    async showImagePreview(file, fileInfo) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const preview = fileInfo.element.querySelector('.image-preview') || 
                              this.createImagePreview(fileInfo.element);
                
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <div class="preview-actions">
                        <button class="btn-remove-preview" title="Remove image">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;

                // Add remove button listener
                preview.querySelector('.btn-remove-preview').addEventListener('click', () => {
                    this.removeFileFromQueue(fileInfo.id);
                });

                resolve();
            };

            reader.readAsDataURL(file);
        });
    }

    createImagePreview(container) {
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        container.appendChild(preview);
        return preview;
    }

    addToUploadQueue(fileInfo) {
        this.uploadQueue.set(fileInfo.id, fileInfo);
        this.updateFileInfoDisplay(fileInfo);
    }

    updateFileInfoDisplay(fileInfo) {
        const fileInfoElement = fileInfo.element.querySelector('.file-info') || 
                               this.createFileInfoElement(fileInfo.element);

        fileInfoElement.innerHTML = `
            <div class="file-info-content">
                <div class="file-icon">
                    <i class="fas ${this.getFileIcon(fileInfo.type)}"></i>
                </div>
                <div class="file-details">
                    <div class="file-name">${fileInfo.name}</div>
                    <div class="file-meta">
                        <span class="file-size">${this.formatFileSize(fileInfo.size)}</span>
                        <span class="file-status ${fileInfo.status}">${fileInfo.status}</span>
                    </div>
                    <div class="upload-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${fileInfo.uploadProgress}%"></div>
                        </div>
                        <span class="progress-text">${fileInfo.uploadProgress}%</span>
                    </div>
                </div>
                <div class="file-actions">
                    ${fileInfo.status === 'uploading' ? `
                        <button class="btn-pause-upload" data-file-id="${fileInfo.id}">
                            <i class="fas fa-pause"></i>
                        </button>
                    ` : ''}
                    <button class="btn-remove-file" data-file-id="${fileInfo.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        this.setupFileActionListeners(fileInfoElement, fileInfo);
    }

    createFileInfoElement(container) {
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        container.appendChild(fileInfo);
        return fileInfo;
    }

    setupFileActionListeners(fileInfoElement, fileInfo) {
        // Remove file button
        const removeBtn = fileInfoElement.querySelector('.btn-remove-file');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.removeFileFromQueue(fileInfo.id);
            });
        }

        // Pause/resume button
        const pauseBtn = fileInfoElement.querySelector('.btn-pause-upload');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.toggleUploadPause(fileInfo.id);
            });
        }
    }

    async processUploadQueue() {
        // Check if we can process more files
        const activeUploads = Array.from(this.uploadQueue.values())
            .filter(file => file.status === 'uploading').length;

        if (activeUploads >= this.config.maxConcurrentUploads) {
            return;
        }

        // Get next pending file
        const nextFile = Array.from(this.uploadQueue.values())
            .find(file => file.status === 'pending');

        if (!nextFile) {
            return; // No more files to process
        }

        // Start upload
        await this.startFileUpload(nextFile);
    }

    async startFileUpload(fileInfo) {
        fileInfo.status = 'uploading';
        fileInfo.uploadStartTime = Date.now();
        this.updateFileInfoDisplay(fileInfo);

        try {
            if (fileInfo.size > this.config.chunkSize) {
                await this.uploadFileInChunks(fileInfo);
            } else {
                await this.uploadFile(fileInfo);
            }

            fileInfo.status = 'completed';
            this.updateFileInfoDisplay(fileInfo);

            // Execute callback if provided
            if (fileInfo.callback) {
                this.executeUploadCallback(fileInfo);
            }

            // Remove from queue after delay
            setTimeout(() => {
                this.removeFileFromQueue(fileInfo.id);
            }, 3000);

        } catch (error) {
            console.error('Upload failed:', error);
            
            if (fileInfo.retryCount < this.config.retryAttempts) {
                fileInfo.retryCount++;
                fileInfo.status = 'retrying';
                this.updateFileInfoDisplay(fileInfo);

                // Retry after delay
                setTimeout(() => {
                    this.startFileUpload(fileInfo);
                }, 2000 * fileInfo.retryCount);
            } else {
                fileInfo.status = 'failed';
                this.updateFileInfoDisplay(fileInfo);
                this.app.showError(`Upload failed: ${fileInfo.name}`);
            }
        }

        // Process next file
        this.processUploadQueue();
    }

    async uploadFile(fileInfo) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('file', fileInfo.file);

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = (e.loaded / e.total) * 100;
                    fileInfo.uploadProgress = Math.round(progress);
                    
                    // Calculate upload speed
                    const timeElapsed = (Date.now() - fileInfo.uploadStartTime) / 1000;
                    fileInfo.uploadSpeed = e.loaded / timeElapsed;
                    
                    this.updateFileInfoDisplay(fileInfo);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(`Upload failed: ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload'));
            });

            xhr.addEventListener('timeout', () => {
                reject(new Error('Upload timeout'));
            });

            xhr.timeout = this.config.timeout;
            xhr.open('POST', '/api/upload');
            xhr.send(formData);
        });
    }

    async uploadFileInChunks(fileInfo) {
        const chunkSize = this.config.chunkSize;
        const totalChunks = Math.ceil(fileInfo.size / chunkSize);
        const chunkProgress = 100 / totalChunks;

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * chunkSize;
            const end = Math.min(start + chunkSize, fileInfo.size);
            const chunk = fileInfo.file.slice(start, end);

            try {
                await this.uploadChunk(fileInfo, chunk, chunkIndex, totalChunks);
                
                // Update overall progress
                fileInfo.uploadProgress = Math.round((chunkIndex + 1) * chunkProgress);
                this.updateFileInfoDisplay(fileInfo);

            } catch (error) {
                throw new Error(`Chunk ${chunkIndex + 1} upload failed: ${error.message}`);
            }
        }
    }

    async uploadChunk(fileInfo, chunk, chunkIndex, totalChunks) {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', chunkIndex);
        formData.append('totalChunks', totalChunks);
        formData.append('fileId', fileInfo.id);
        formData.append('fileName', fileInfo.name);

        const response = await fetch('/api/upload-chunk', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
    }

    executeUploadCallback(fileInfo) {
        try {
            const callback = new Function('fileInfo', fileInfo.callback);
            callback(fileInfo);
        } catch (error) {
            console.error('Upload callback execution failed:', error);
        }
    }

    removeFileFromQueue(fileId) {
        const fileInfo = this.uploadQueue.get(fileId);
        if (fileInfo) {
            // Clean up preview
            const preview = fileInfo.element.querySelector('.image-preview');
            if (preview) {
                preview.remove();
            }

            // Clean up file info
            const fileInfoElement = fileInfo.element.querySelector('.file-info');
            if (fileInfoElement) {
                fileInfoElement.remove();
            }

            this.uploadQueue.delete(fileId);
        }
    }

    toggleUploadPause(fileId) {
        const fileInfo = this.uploadQueue.get(fileId);
        if (fileInfo && fileInfo.status === 'uploading') {
            fileInfo.status = 'paused';
            this.updateFileInfoDisplay(fileInfo);
            // Implementation would pause the actual upload
        } else if (fileInfo && fileInfo.status === 'paused') {
            fileInfo.status = 'uploading';
            this.updateFileInfoDisplay(fileInfo);
            this.startFileUpload(fileInfo);
        }
    }

    // Utility methods
    generateFileId() {
        return 'file_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'fa-image';
        if (fileType === 'text/csv') return 'fa-file-csv';
        if (fileType === 'application/json') return 'fa-file-code';
        return 'fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    isImageFile(file) {
        return file.type.startsWith('image/');
    }

    // Handle paste event
    handlePaste(event) {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    this.processFile(file, { closest: () => document.activeElement });
                }
            }
        }
    }

    // Handle drag over
    handleDragOver(event) {
        event.preventDefault();
        // Could add visual feedback for entire document
    }

    // Handle drop
    handleDrop(event) {
        const files = Array.from(event.dataTransfer.files);
        files.forEach(file => {
            this.processFile(file, { closest: () => event.target });
        });
    }

    handleDropZoneDrop(event, dropZone) {
        const files = Array.from(event.dataTransfer.files);
        const fileInput = dropZone.querySelector('input[type="file"]');
        
        if (fileInput && files.length > 0) {
            fileInput.files = event.dataTransfer.files;
            this.handleFileSelection(fileInput);
        }
    }

    // Download functionality
    async downloadFile(url, filename, options = {}) {
        const downloadId = this.generateFileId();
        
        const downloadInfo = {
            id: downloadId,
            url: url,
            filename: filename,
            progress: 0,
            status: 'downloading'
        };

        this.downloadQueue.set(downloadId, downloadInfo);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Download failed: ${response.statusText}`);
            }

            const blob = await response.blob();
            this.downloadBlob(blob, filename);

            downloadInfo.status = 'completed';
            this.app.showSuccess(`Downloaded: ${filename}`);

        } catch (error) {
            console.error('Download failed:', error);
            downloadInfo.status = 'failed';
            this.app.showError(`Download failed: ${filename}`);
        }

        // Clean up after delay
        setTimeout(() => {
            this.downloadQueue.delete(downloadId);
        }, 5000);

        return downloadId;
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // File conversion
    async convertImageFormat(file, targetFormat, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(url);
                    
                    if (blob) {
                        const convertedFile = new File([blob], 
                            file.name.replace(/\.[^/.]+$/, '') + '.' + targetFormat,
                            { type: `image/${targetFormat}` }
                        );
                        resolve(convertedFile);
                    } else {
                        reject(new Error('Image conversion failed'));
                    }
                }, `image/${targetFormat}`, quality);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };

            img.src = url;
        });
    }

    // Bulk operations
    async processBulkFiles(files, processor) {
        const results = [];
        const totalFiles = files.length;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            try {
                const result = await processor(file, i, totalFiles);
                results.push({ file: file.name, success: true, result });
                
                // Update progress
                const progress = ((i + 1) / totalFiles) * 100;
                this.app.modules.notifications.show(
                    `Processing files... ${Math.round(progress)}%`,
                    'info',
                    1000
                );

            } catch (error) {
                results.push({ file: file.name, success: false, error: error.message });
            }
        }

        return results;
    }

    // File compression
    async compressImage(file, maxWidth = 2000, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(url);
                    
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: new Date().getTime()
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Image compression failed'));
                    }
                }, file.type, quality);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };

            img.src = url;
        });
    }

    initializeWorkers() {
        // Initialize web workers for heavy file processing
        if (window.Worker) {
            this.imageProcessingWorker = new Worker('/js/workers/image-processor.js');
            this.csvProcessingWorker = new Worker('/js/workers/csv-processor.js');
            
            this.setupWorkerListeners();
        }
    }

    setupWorkerListeners() {
        if (this.imageProcessingWorker) {
            this.imageProcessingWorker.onmessage = (e) => {
                this.handleWorkerMessage(e);
            };
        }

        if (this.csvProcessingWorker) {
            this.csvProcessingWorker.onmessage = (e) => {
                this.handleWorkerMessage(e);
            };
        }
    }

    handleWorkerMessage(event) {
        const { type, data, id } = event.data;
        
        switch (type) {
            case 'image_processed':
                this.handleImageProcessed(data, id);
                break;
            case 'csv_processed':
                this.handleCSVProcessed(data, id);
                break;
            case 'error':
                this.app.showError(`Processing failed: ${data.message}`);
                break;
        }
    }

    async processImageWithWorker(file, operations) {
        return new Promise((resolve, reject) => {
            const processingId = this.generateFileId();
            
            this.imageProcessingWorker.postMessage({
                type: 'process_image',
                file: file,
                operations: operations,
                id: processingId
            });

            // Store resolver for later
            this.processingFiles.set(processingId, { resolve, reject });
        });
    }

    handleImageProcessed(data, id) {
        const processor = this.processingFiles.get(id);
        if (processor) {
            processor.resolve(data.processedFile);
            this.processingFiles.delete(id);
        }
    }

    handleCSVProcessed(data, id) {
        const processor = this.processingFiles.get(id);
        if (processor) {
            processor.resolve(data.parsedData);
            this.processingFiles.delete(id);
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileHandler;
    }

// notification-system.js
class NotificationSystem {
    constructor(app) {
        this.app = app;
        this.notifications = new Map();
        this.position = 'top-right';
        this.maxNotifications = 5;
        this.autoCloseDelay = 5000;
        this.queue = [];
        
        this.config = {
            positions: {
                'top-right': { top: '20px', right: '20px' },
                'top-left': { top: '20px', left: '20px' },
                'bottom-right': { bottom: '20px', right: '20px' },
                'bottom-left': { bottom: '20px', left: '20px' },
                'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
                'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
            },
            types: {
                'info': { icon: 'info-circle', color: '#3b82f6', bgColor: '#dbeafe' },
                'success': { icon: 'check-circle', color: '#10b981', bgColor: '#d1fae5' },
                'warning': { icon: 'exclamation-triangle', color: '#f59e0b', bgColor: '#fef3c7' },
                'error': { icon: 'times-circle', color: '#ef4444', bgColor: '#fee2e2' },
                'loading': { icon: 'spinner', color: '#6b7280', bgColor: '#f3f4f6' }
            }
        };
    }

    async init() {
        this.createContainer();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    createContainer() {
        // Remove existing container if any
        const existingContainer = document.getElementById('notificationContainer');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Create new container
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = `notification-container ${this.position}`;
        
        // Apply position styles
        const positionStyles = this.config.positions[this.position];
        Object.assign(container.style, positionStyles);

        document.body.appendChild(container);
        this.container = container;
    }

    setupEventListeners() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.show('Connection restored', 'success', 3000);
        });

        window.addEventListener('offline', () => {
            this.show('You are offline', 'warning', 0); // Don't auto-close
        });

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAllTimers();
            } else {
                this.resumeAllTimers();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + N to show notification test
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                this.showTestNotification();
            }

            // Escape to close all notifications
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });
    }

    show(message, type = 'info', duration = null, options = {}) {
        const notificationId = this.generateNotificationId();
        
        // Use default duration if not specified
        if (duration === null) {
            duration = type === 'loading' ? 0 : this.autoCloseDelay;
        }

        const notification = {
            id: notificationId,
            message: message,
            type: type,
            duration: duration,
            createdAt: Date.now(),
            paused: false,
            remainingTime: duration,
            options: {
                title: options.title,
                action: options.action,
                progress: options.progress,
                dismissible: options.dismissible !== false,
                ...options
            }
        };

        // Check if we've reached the maximum notifications
        if (this.notifications.size >= this.maxNotifications) {
            this.queue.push(notification);
            return notificationId;
        }

        this.displayNotification(notification);
        return notificationId;
    }

    displayNotification(notification) {
        // Create notification element
        const element = this.createNotificationElement(notification);
        this.container.appendChild(element);

        // Add to notifications map
        this.notifications.set(notification.id, {
            ...notification,
            element: element,
            timer: null
        });

        // Animate in
        requestAnimationFrame(() => {
            element.classList.add('show');
        });

        // Start auto-close timer if duration > 0
        if (notification.duration > 0) {
            this.startAutoCloseTimer(notification.id);
        }

        // Track notification
        this.app.modules.analytics.trackEvent('notification', 'show', notification.type, {
            duration: notification.duration,
            hasAction: !!notification.options.action
        });
    }

    createNotificationElement(notification) {
        const typeConfig = this.config.types[notification.type];
        const element = document.createElement('div');
        
        element.className = `notification notification-${notification.type}`;
        element.setAttribute('role', 'alert');
        element.setAttribute('aria-live', 'polite');
        element.dataset.notificationId = notification.id;

        // Apply theme-based colors
        const styles = this.getNotificationStyles(notification.type);
        Object.assign(element.style, styles);

        element.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${typeConfig.icon} ${notification.type === 'loading' ? 'fa-spin' : ''}"></i>
            </div>
            <div class="notification-content">
                ${notification.options.title ? `
                    <h4 class="notification-title">${notification.options.title}</h4>
                ` : ''}
                <div class="notification-message">${this.formatMessage(notification.message)}</div>
                ${notification.options.progress !== undefined ? `
                    <div class="notification-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${notification.options.progress}%"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="notification-actions">
                ${notification.options.action ? `
                    <button class="notification-action-btn" data-action="custom">
                        ${notification.options.action.label}
                    </button>
                ` : ''}
                ${notification.options.dismissible ? `
                    <button class="notification-close" aria-label="Close notification">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </div>
        `;

        // Add event listeners
        this.setupNotificationEventListeners(element, notification);

        return element;
    }

    getNotificationStyles(type) {
        const typeConfig = this.config.types[type];
        const isDark = this.app.state.currentTheme === 'dark';
        
        if (isDark) {
            return {
                backgroundColor: this.adjustColorBrightness(typeConfig.bgColor, -40),
                borderColor: typeConfig.color,
                color: '#f8fafc'
            };
        }

        return {
            backgroundColor: typeConfig.bgColor,
            borderColor: typeConfig.color,
            color: '#1e293b'
        };
    }

    adjustColorBrightness(hex, percent) {
        // Simple color adjustment for dark theme
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }

    setupNotificationEventListeners(element, notification) {
        // Close button
        const closeBtn = element.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close(notification.id);
            });
        }

        // Action button
        const actionBtn = element.querySelector('.notification-action-btn');
        if (actionBtn && notification.options.action) {
            actionBtn.addEventListener('click', () => {
                this.handleNotificationAction(notification);
            });
        }

        // Pause on hover
        if (notification.duration > 0) {
            element.addEventListener('mouseenter', () => {
                this.pauseTimer(notification.id);
            });

            element.addEventListener('mouseleave', () => {
                this.resumeTimer(notification.id);
            });
        }

        // Click to close (if enabled)
        if (notification.options.clickToClose) {
            element.addEventListener('click', (e) => {
                if (!e.target.closest('.notification-action-btn')) {
                    this.close(notification.id);
                }
            });
        }
    }

    startAutoCloseTimer(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (!notification || notification.paused) return;

        notification.timer = setTimeout(() => {
            this.close(notificationId);
        }, notification.remainingTime);
    }

    pauseTimer(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (!notification || !notification.timer) return;

        clearTimeout(notification.timer);
        notification.paused = true;
        notification.remainingTime = notification.duration - (Date.now() - notification.createdAt);
    }

    resumeTimer(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (!notification || !notification.paused) return;

        notification.paused = false;
        notification.timer = setTimeout(() => {
            this.close(notificationId);
        }, notification.remainingTime);
    }

    pauseAllTimers() {
        this.notifications.forEach((notification, id) => {
            if (notification.timer) {
                this.pauseTimer(id);
            }
        });
    }

    resumeAllTimers() {
        this.notifications.forEach((notification, id) => {
            if (notification.paused) {
                this.resumeTimer(id);
            }
        });
    }

    close(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (!notification) return;

        // Clear timer
        if (notification.timer) {
            clearTimeout(notification.timer);
        }

        // Animate out
        if (notification.element) {
            notification.element.classList.remove('show');
            notification.element.classList.add('hide');

            // Remove from DOM after animation
            setTimeout(() => {
                if (notification.element && notification.element.parentNode) {
                    notification.element.parentNode.removeChild(notification.element);
                }
            }, 300);
        }

        // Remove from notifications map
        this.notifications.delete(notificationId);

        // Process queue
        this.processQueue();

        // Track closure
        this.app.modules.analytics.trackEvent('notification', 'close', notification.type);
    }

    closeAll() {
        this.notifications.forEach((notification, id) => {
            this.close(id);
        });
        this.queue = [];
    }

    processQueue() {
        if (this.queue.length === 0 || this.notifications.size >= this.maxNotifications) {
            return;
        }

        const nextNotification = this.queue.shift();
        this.displayNotification(nextNotification);
    }

    handleNotificationAction(notification) {
        if (notification.options.action && notification.options.action.callback) {
            try {
                notification.options.action.callback(notification);
                
                // Close notification if configured
                if (notification.options.action.closeOnClick !== false) {
                    this.close(notification.id);
                }

                // Track action
                this.app.modules.analytics.trackEvent('notification', 'action', notification.type, {
                    actionLabel: notification.options.action.label
                });

            } catch (error) {
                console.error('Notification action failed:', error);
                this.app.modules.analytics.trackEvent('error', 'notification_action', error.message);
            }
        }
    }

    // Specialized notification methods
    showSuccess(message, duration = null, options = {}) {
        return this.show(message, 'success', duration, options);
    }

    showError(message, duration = null, options = {}) {
        return this.show(message, 'error', duration, options);
    }

    showWarning(message, duration = null, options = {}) {
        return this.show(message, 'warning', duration, options);
    }

    showInfo(message, duration = null, options = {}) {
        return this.show(message, 'info', duration, options);
    }

    showLoading(message = 'Loading...', options = {}) {
        return this.show(message, 'loading', 0, { ...options, dismissible: false });
    }

    updateProgress(notificationId, progress, message = null) {
        const notification = this.notifications.get(notificationId);
        if (!notification) return;

        // Update progress bar
        const progressFill = notification.element?.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        // Update message if provided
        if (message) {
            const messageElement = notification.element?.querySelector('.notification-message');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }

        // Update notification object
        notification.options.progress = progress;
        if (message) {
            notification.message = message;
        }

        // Close if progress is 100%
        if (progress >= 100) {
            setTimeout(() => {
                this.close(notificationId);
            }, 1000);
        }
    }

    // Utility methods
    generateNotificationId() {
        return 'notif_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    formatMessage(message) {
        if (typeof message === 'string') {
            // Convert line breaks to <br>
            return message.replace(/\n/g, '<br>');
        }
        return message;
    }

    setPosition(position) {
        if (this.config.positions[position]) {
            this.position = position;
            this.createContainer(); // Recreate container with new position
        }
    }

    setMaxNotifications(max) {
        this.maxNotifications = Math.max(1, max);
        
        // Close excess notifications if necessary
        if (this.notifications.size > this.maxNotifications) {
            const excess = Array.from(this.notifications.keys())
                .slice(0, this.notifications.size - this.maxNotifications);
            
            excess.forEach(id => this.close(id));
        }
    }

    setAutoCloseDelay(delay) {
        this.autoCloseDelay = delay;
    }

    // Notification history (for debugging/analytics)
    getNotificationHistory(limit = 50) {
        return Array.from(this.notifications.values())
            .concat(this.queue)
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, limit);
    }

    // Test method
    showTestNotification() {
        const types = ['info', 'success', 'warning', 'error', 'loading'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const messages = {
            'info': 'This is an information message',
            'success': 'Operation completed successfully!',
            'warning': 'Please check your input values',
            'error': 'Something went wrong. Please try again.',
            'loading': 'Processing your request...'
        };

        this.show(messages[randomType], randomType, randomType === 'loading' ? 0 : 5000, {
            title: 'Test Notification',
            action: randomType !== 'loading' ? {
                label: 'View Details',
                callback: (notification) => {
                    console.log('Notification action clicked:', notification);
                }
            } : null
        });
    }

    // Queue management
    clearQueue() {
        this.queue = [];
    }

    getQueueLength() {
        return this.queue.length;
    }

    getActiveNotifications() {
        return this.notifications.size;
    }

    // Accessibility features
    announceToScreenReader(message, priority = 'polite') {
        // Create aria-live region for screen readers
        let liveRegion = document.getElementById('a11y-live-region');
        
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'a11y-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(liveRegion);
        }

        liveRegion.textContent = message;
        
        // Clear after a delay
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
                }

// app.js - Main Application Initialization

// Global app instance
let graphzApp;

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Show loading screen
        showLoadingScreen();
        
        // Initialize main application
        graphzApp = new GraphzApp();
        
        // Make app globally available
        window.graphzApp = graphzApp;
        
        // Initialize service worker for PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
        
    } catch (error) {
        console.error('Failed to initialize Graphz:', error);
        showErrorScreen(error);
    }
});

// Utility functions
function showLoadingScreen() {
    // Loading screen is shown by default in HTML
    // This function can be used for additional loading states
}

function showErrorScreen(error) {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div class="error-screen">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Failed to Load</h2>
                <p>${error.message}</p>
                <button onclick="window.location.reload()" class="btn btn-primary">
                    <i class="fas fa-redo"></i>
                    Reload Page
                </button>
            </div>
        `;
    }
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    
    if (graphzApp && graphzApp.modules.notifications) {
        graphzApp.modules.notifications.show(
            'An unexpected error occurred. Please refresh the page.',
            'error',
            5000
        );
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GraphzApp, graphzApp };
}
