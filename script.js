// script.js - Graphz Complete Functionality

class GraphzApp {
    constructor() {
        this.graphs = [];
        this.filteredGraphs = [];
        this.isAdmin = false;
        this.currentPassword = "admin123";
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.loadSampleGraphs();
        this.renderGraphs();
        this.setupServiceWorker();
    }

    // Event Listeners
    initializeEventListeners() {
        // Mobile Menu
        document.getElementById('hamburgerMenu').addEventListener('click', () => this.toggleMobileMenu());
        document.getElementById('closeMenu').addEventListener('click', () => this.toggleMobileMenu());
        
        // Search Functionality
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('searchInput').addEventListener('focus', () => this.showSearchSuggestions());
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Admin Panel
        document.getElementById('adminPanelBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.openAdminModal();
        });
        document.getElementById('closeAdminModal').addEventListener('click', () => this.closeAdminModal());
        document.getElementById('loginBtn').addEventListener('click', () => this.handleAdminLogin());
        document.getElementById('addGraphBtn').addEventListener('click', () => this.showAddGraphForm());

        // Explore Button
        document.getElementById('exploreBtn').addEventListener('click', () => {
            document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth' });
        });

        // Close modal when clicking outside
        document.getElementById('adminModal').addEventListener('click', (e) => {
            if (e.target.id === 'adminModal') this.closeAdminModal();
        });

        // Graph click events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.graph-card')) {
                const graphId = e.target.closest('.graph-card').dataset.id;
                this.viewGraphDetails(graphId);
            }
        });
    }

    // Mobile Menu
    toggleMobileMenu() {
        document.getElementById('mobileMenu').classList.toggle('active');
    }

    // Search Functionality with AI-like Suggestions
    handleSearch(query) {
        if (query.length === 0) {
            this.hideSearchSuggestions();
            return;
        }

        const suggestions = this.getSearchSuggestions(query);
        this.showSearchSuggestions(suggestions);
    }

    getSearchSuggestions(query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        // Common typos and corrections
        const commonTypos = {
            'ohms': 'ohm',
            'parabolla': 'parabola',
            'sinus': 'sine',
            'cosinus': 'cosine',
            'algebric': 'algebraic',
            'trignometry': 'trigonometry',
            'calulus': 'calculus',
            'diffrential': 'differential'
        };

        // Check for common typos
        let correctedQuery = normalizedQuery;
        Object.keys(commonTypos).forEach(typo => {
            if (normalizedQuery.includes(typo)) {
                correctedQuery = normalizedQuery.replace(typo, commonTypos[typo]);
            }
        });

        // Get matching graphs
        const matches = this.graphs.filter(graph => 
            graph.name.toLowerCase().includes(correctedQuery) ||
            graph.aliases.some(alias => alias.toLowerCase().includes(correctedQuery)) ||
            graph.tags.some(tag => tag.toLowerCase().includes(correctedQuery)) ||
            graph.subject.toLowerCase().includes(correctedQuery) ||
            graph.equation.toLowerCase().includes(correctedQuery)
        );

        // Create suggestions
        const suggestions = [];
        
        if (matches.length > 0) {
            matches.slice(0, 5).forEach(graph => {
                suggestions.push({
                    type: 'graph',
                    text: `📊 ${graph.name}`,
                    graphId: graph.id
                });
            });
        }

        // Add correction suggestion if query was corrected
        if (correctedQuery !== normalizedQuery) {
            suggestions.unshift({
                type: 'correction',
                text: `🔍 Did you mean: "${correctedQuery}"?`,
                searchTerm: correctedQuery
            });
        }

        // Add subject-based suggestions
        const subjects = ['mathematics', 'physics', 'chemistry', 'engineering'];
        const subjectMatch = subjects.find(subject => subject.includes(correctedQuery));
        if (subjectMatch && matches.length === 0) {
            suggestions.push({
                type: 'subject',
                text: `📚 Browse ${subjectMatch} graphs`,
                subject: subjectMatch
            });
        }

        return suggestions;
    }

    showSearchSuggestions(suggestions = []) {
        const container = document.getElementById('searchSuggestions');
        container.innerHTML = '';

        if (suggestions.length === 0) {
            container.classList.remove('show');
            return;
        }

        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = suggestion.text;
            div.addEventListener('click', () => this.handleSuggestionClick(suggestion));
            container.appendChild(div);
        });

        container.classList.add('show');
    }

    hideSearchSuggestions() {
        document.getElementById('searchSuggestions').classList.remove('show');
    }

    handleSuggestionClick(suggestion) {
        const searchInput = document.getElementById('searchInput');
        
        switch (suggestion.type) {
            case 'correction':
                searchInput.value = suggestion.searchTerm;
                this.performSearch(suggestion.searchTerm);
                break;
            case 'graph':
                this.viewGraphDetails(suggestion.graphId);
                break;
            case 'subject':
                this.filterBySubject(suggestion.subject);
                break;
        }
        
        this.hideSearchSuggestions();
    }

    performSearch(searchTerm = null) {
        const query = searchTerm || document.getElementById('searchInput').value.trim();
        
        if (query.length === 0) {
            this.filteredGraphs = [...this.graphs];
            this.renderGraphs();
            return;
        }

        this.filteredGraphs = this.graphs.filter(graph => 
            graph.name.toLowerCase().includes(query.toLowerCase()) ||
            graph.aliases.some(alias => alias.toLowerCase().includes(query.toLowerCase())) ||
            graph.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
            graph.subject.toLowerCase().includes(query.toLowerCase()) ||
            graph.equation.toLowerCase().includes(query.toLowerCase())
        );

        this.renderGraphs();
        this.hideSearchSuggestions();
    }

    filterBySubject(subject) {
        this.filteredGraphs = this.graphs.filter(graph => 
            graph.subject.toLowerCase() === subject.toLowerCase()
        );
        this.renderGraphs();
    }

    // Graph Management
    loadSampleGraphs() {
        const sampleGraphs = [
            {
                id: '1',
                name: "Ohm's Law",
                aliases: ["ohms law", "voltage current relation"],
                equation: "V = I × R",
                subject: "Physics",
                tags: ["electricity", "circuits", "physics", "law"],
                description: "Shows the relationship between voltage (V), current (I), and resistance (R) in electrical circuits.",
                graphCode: "function plotOhmsLaw() { return 'Ohms Law Graph'; }",
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                name: "Quadratic Parabola",
                aliases: ["parabola", "quadratic function"],
                equation: "y = ax² + bx + c",
                subject: "Mathematics",
                tags: ["algebra", "parabola", "quadratic", "function"],
                description: "A symmetric curve representing quadratic functions, used in various mathematical applications.",
                graphCode: "function plotParabola() { return 'Parabola Graph'; }",
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                name: "Sine Wave",
                aliases: ["sine function", "sinusoidal wave"],
                equation: "y = A sin(ωt + φ)",
                subject: "Mathematics",
                tags: ["trigonometry", "wave", "periodic", "function"],
                description: "Represents periodic oscillations found in nature, from sound waves to alternating current.",
                graphCode: "function plotSineWave() { return 'Sine Wave Graph'; }",
                createdAt: new Date().toISOString()
            },
            {
                id: '4',
                name: "Exponential Growth",
                aliases: ["exponential function", "growth curve"],
                equation: "y = e^x",
                subject: "Mathematics",
                tags: ["exponential", "growth", "calculus", "function"],
                description: "Shows rapid growth patterns seen in population growth, compound interest, and nuclear reactions.",
                graphCode: "function plotExponential() { return 'Exponential Graph'; }",
                createdAt: new Date().toISOString()
            },
            {
                id: '5',
                name: "Normal Distribution",
                aliases: ["gaussian distribution", "bell curve"],
                equation: "f(x) = (1/σ√2π) e^(-(x-μ)²/2σ²)",
                subject: "Statistics",
                tags: ["probability", "statistics", "distribution", "gaussian"],
                description: "The famous bell curve describing the distribution of many natural phenomena and measurements.",
                graphCode: "function plotNormalDist() { return 'Normal Distribution Graph'; }",
                createdAt: new Date().toISOString()
            },
            {
                id: '6',
                name: "Circle Equation",
                aliases: ["circle", "circular function"],
                equation: "x² + y² = r²",
                subject: "Geometry",
                tags: ["geometry", "circle", "conic", "shapes"],
                description: "Represents all points equidistant from a center point, fundamental in geometry and trigonometry.",
                graphCode: "function plotCircle() { return 'Circle Graph'; }",
                createdAt: new Date().toISOString()
            }
        ];
      
        const savedGraphs = localStorage.getItem('graphz-graphs');
        if (savedGraphs) {
            this.graphs = JSON.parse(savedGraphs);
        } else {
            this.graphs = sampleGraphs;
            this.saveGraphs();
        }

        this.filteredGraphs = [...this.graphs];
    }

    saveGraphs() {
        localStorage.setItem('graphz-graphs', JSON.stringify(this.graphs));
    }

    // UPDATED renderGraphs()
    renderGraphs() {
        const grid = document.getElementById('graphsGrid');
        
        if (this.filteredGraphs.length === 0) {
            grid.innerHTML = `
                <div class="text-center" style="grid-column: 1/-1; padding: 3rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3>No graphs found</h3>
                    <p>Try searching with different keywords</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredGraphs.map(graph => `
            <div class="graph-card fade-in" data-id="${graph.id}">
                <div class="graph-preview" id="graph-${graph.id}">
                    <!-- Graph will be rendered here by JavaScript -->
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">
                        <i class="fas fa-spinner fa-spin"></i> Loading graph...
                    </div>
                </div>
                <div class="graph-info">
                    <h3>${graph.name}</h3>
                    <p>${graph.description}</p>
                    <div class="graph-meta">
                        <span class="graph-tag">${graph.subject}</span>
                        ${graph.tags.slice(0, 2).map(tag => `<span class="graph-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        this.filteredGraphs.forEach(graph => {
            const container = document.getElementById(`graph-${graph.id}`);
            if (container && graph.graphCode) {
                executeGraphCode(graph.graphCode, container);
            }
        });
    }

    viewGraphDetails(graphId) {
        const graph = this.graphs.find(g => g.id === graphId);
        if (!graph) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${graph.name}</h3>
                    <button class="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="graph-preview-large" style="height: 200px; background: var(--bg-secondary); border-radius: var(--radius-md); margin-bottom: 1rem; display: flex; align-items: center; justify-content: center;">
                        <div style="font-size: 1.5rem; font-weight: 600; color: var(--primary-color);">
                            ${graph.equation}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <strong>Equation:</strong> ${graph.equation}
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <strong>Subject:</strong> ${graph.subject}
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <strong>Description:</strong> ${graph.description}
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <strong>Tags:</strong> ${graph.tags.map(tag => `<span class="graph-tag">${tag}</span>`).join('')}
                    </div>
                    
                    <div>
                        <strong>Also known as:</strong> ${graph.aliases.join(', ')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Admin Panel Functions remain same...
    // (rest of the class code continues unchanged)
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('SW registered'))
                .catch(() => console.log('SW registration failed'));
        }
    }
}

// ✅ Graph Code Execution System
function executeGraphCode(graphCode, container) {
    try {
        const graphFunction = new Function('return ' + graphCode)();
        const result = graphFunction();

        if (result instanceof HTMLElement || result instanceof Node) {
            container.innerHTML = '';
            container.appendChild(result);
        } else if (result instanceof HTMLCanvasElement) {
            container.innerHTML = '';
            container.appendChild(result);
        } else if (typeof result === 'string') {
            container.innerHTML = `<div style="padding: 2rem; text-align: center; color: #6366f1; font-weight: bold;">${result}</div>`;
        } else {
            throw new Error('Invalid graph output');
        }
    } catch (error) {
        console.error('Graph execution error:', error);
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #ef4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Graph could not be rendered</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GraphzApp();
});
window.app = app;
                  
