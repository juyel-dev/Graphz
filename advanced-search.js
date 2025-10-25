// advanced-search.js - Enhanced Search System

class AdvancedSearch {
    constructor() {
        this.filters = {
            subject: 'all',
            tags: [],
            dateRange: 'all',
            minViews: 0,
            sortBy: 'newest'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSearchIndex();
    }

    setupEventListeners() {
        // Advanced search toggle
        document.getElementById('advancedSearchToggle')?.addEventListener('click', () => {
            this.toggleAdvancedSearch();
        });

        // Filter changes
        document.getElementById('subjectFilter')?.addEventListener('change', (e) => {
            this.filters.subject = e.target.value;
            this.applyFilters();
        });

        document.getElementById('dateRangeFilter')?.addEventListener('change', (e) => {
            this.filters.dateRange = e.target.value;
            this.applyFilters();
        });

        document.getElementById('viewsFilter')?.addEventListener('change', (e) => {
            this.filters.minViews = parseInt(e.target.value);
            this.applyFilters();
        });

        document.getElementById('sortFilter')?.addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.applyFilters();
        });

        // Tag filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-filter')) {
                this.toggleTagFilter(e.target.dataset.tag);
            }
        });
    }

    setupSearchIndex() {
        // Create search index for better performance
        this.searchIndex = {
            tags: new Set(),
            subjects: new Set()
        };
        
        // This will be populated when graphs are loaded
    }

    updateSearchIndex(graphs) {
        graphs.forEach(graph => {
            // Add tags to index
            if (graph.tags) {
                graph.tags.forEach(tag => this.searchIndex.tags.add(tag));
            }
            
            // Add subjects to index
            this.searchIndex.subjects.add(graph.subject);
        });

        this.updateTagFilters();
    }

    updateTagFilters() {
        const container = document.getElementById('tagFiltersContainer');
        if (!container) return;

        container.innerHTML = Array.from(this.searchIndex.tags)
            .sort()
            .map(tag => `
                <button class="tag-filter ${this.filters.tags.includes(tag) ? 'active' : ''}" 
                        data-tag="${tag}">
                    ${tag}
                </button>
            `).join('');
    }

    toggleTagFilter(tag) {
        const index = this.filters.tags.indexOf(tag);
        if (index > -1) {
            this.filters.tags.splice(index, 1);
        } else {
            this.filters.tags.push(tag);
        }
        this.applyFilters();
    }

    toggleAdvancedSearch() {
        const panel = document.getElementById('advancedSearchPanel');
        const toggleBtn = document.getElementById('advancedSearchToggle');
        
        panel.classList.toggle('active');
        toggleBtn.textContent = panel.classList.contains('active') ? 
            'Advanced Search ▲' : 'Advanced Search ▼';
    }

    applyFilters() {
        let filteredGraphs = [...allGraphs];

        // Subject filter
        if (this.filters.subject !== 'all') {
            filteredGraphs = filteredGraphs.filter(graph => 
                graph.subject === this.filters.subject
            );
        }

        // Tag filter
        if (this.filters.tags.length > 0) {
            filteredGraphs = filteredGraphs.filter(graph =>
                graph.tags && this.filters.tags.some(tag => graph.tags.includes(tag))
            );
        }

        // Date range filter
        if (this.filters.dateRange !== 'all') {
            const now = new Date();
            let cutoffDate = new Date();

            switch (this.filters.dateRange) {
                case 'week':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    cutoffDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            filteredGraphs = filteredGraphs.filter(graph => {
                const graphDate = graph.createdAt?.toDate();
                return graphDate && graphDate >= cutoffDate;
            });
        }

        // Views filter
        if (this.filters.minViews > 0) {
            filteredGraphs = filteredGraphs.filter(graph => 
                (graph.views || 0) >= this.filters.minViews
            );
        }

        // Sorting
        filteredGraphs = this.sortGraphs(filteredGraphs, this.filters.sortBy);

        currentGraphs = filteredGraphs;
        displayGraphs(currentGraphs);
        updateResultCount(currentGraphs.length);
        this.updateActiveFiltersDisplay();
    }

    sortGraphs(graphs, sortBy) {
        return graphs.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0);
                case 'oldest':
                    return (a.createdAt?.toDate() || 0) - (b.createdAt?.toDate() || 0);
                case 'mostViews':
                    return (b.views || 0) - (a.views || 0);
                case 'leastViews':
                    return (a.views || 0) - (b.views || 0);
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
    }

    updateActiveFiltersDisplay() {
        const activeFilters = document.getElementById('activeFilters');
        if (!activeFilters) return;

        const activeFiltersList = [];

        if (this.filters.subject !== 'all') {
            activeFiltersList.push(`Subject: ${this.filters.subject}`);
        }

        if (this.filters.tags.length > 0) {
            activeFiltersList.push(`Tags: ${this.filters.tags.join(', ')}`);
        }

        if (this.filters.dateRange !== 'all') {
            activeFiltersList.push(`Date: ${this.filters.dateRange}`);
        }

        if (this.filters.minViews > 0) {
            activeFiltersList.push(`Min Views: ${this.filters.minViews}`);
        }

        activeFiltersList.push(`Sort: ${this.filters.sortBy}`);

        activeFilters.innerHTML = activeFiltersList.map(filter => 
            `<span class="active-filter">${filter}</span>`
        ).join('');

        activeFilters.style.display = activeFiltersList.length > 0 ? 'block' : 'none';
    }

    clearAllFilters() {
        this.filters = {
            subject: 'all',
            tags: [],
            dateRange: 'all',
            minViews: 0,
            sortBy: 'newest'
        };

        // Reset form elements
        document.getElementById('subjectFilter').value = 'all';
        document.getElementById('dateRangeFilter').value = 'all';
        document.getElementById('viewsFilter').value = '0';
        document.getElementById('sortFilter').value = 'newest';

        this.updateTagFilters();
        this.applyFilters();
    }
}

// Initialize advanced search
const advancedSearch = new AdvancedSearch();
