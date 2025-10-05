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

        // Load from localStorage or use samples
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
                <div class="graph-preview">
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600;">
                        ${graph.equation}
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
    }

    viewGraphDetails(graphId) {
        const graph = this.graphs.find(g => g.id === graphId);
        if (!graph) return;

        // Create modal for graph details
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

        // Close modal events
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Admin Panel Functions
    openAdminModal() {
        document.getElementById('adminModal').classList.add('active');
        // Reset login state
        this.isAdmin = false;
        document.getElementById('adminLogin').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('adminPassword').value = '';
    }

    closeAdminModal() {
        document.getElementById('adminModal').classList.remove('active');
    }

    handleAdminLogin() {
        const password = document.getElementById('adminPassword').value;
        
        if (password === this.currentPassword) {
            this.isAdmin = true;
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            this.loadAdminGraphsList();
        } else {
            alert('Incorrect password! Please try again.');
            document.getElementById('adminPassword').value = '';
            document.getElementById('adminPassword').focus();
        }
    }

    loadAdminGraphsList() {
        const container = document.getElementById('adminGraphsList');
        container.innerHTML = `
            <div style="margin-top: 1rem;">
                <h5>Current Graphs (${this.graphs.length})</h5>
                <div style="max-height: 200px; overflow-y: auto; margin-top: 1rem;">
                    ${this.graphs.map(graph => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid var(--border-color);">
                            <span>${graph.name}</span>
                            <button class="btn btn-danger" onclick="app.deleteGraph('${graph.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showAddGraphForm() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add New Graph</h3>
                    <button class="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="addGraphForm" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div>
                            <label>Graph Name *</label>
                            <input type="text" id="graphName" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                        </div>
                        
                        <div>
                            <label>Aliases (comma separated)</label>
                            <input type="text" id="graphAliases" placeholder="ohms law, voltage current" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                        </div>
                        
                        <div>
                            <label>Equation *</label>
                            <input type="text" id="graphEquation" placeholder="V = I × R" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                        </div>
                        
                        <div>
                            <label>Subject *</label>
                            <select id="graphSubject" required style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                                <option value="">Select Subject</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Statistics">Statistics</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Computer Science">Computer Science</option>
                            </select>
                        </div>
                        
                        <div>
                            <label>Tags (comma separated)</label>
                            <input type="text" id="graphTags" placeholder="electricity, circuits, law" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                        </div>
                        
                        <div>
                            <label>Description *</label>
                            <textarea id="graphDescription" required rows="3" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); resize: vertical;"></textarea>
                        </div>
                        
                        <div>
                            <label>Graph Code (JavaScript)</label>
                            <textarea id="graphCode" rows="4" placeholder="function plotGraph() { ... }" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); resize: vertical; font-family: monospace;"></textarea>
                        </div>
                        
                        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Graph</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Form submission
        modal.querySelector('#addGraphForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewGraph();
            document.body.removeChild(modal);
        });

        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    saveNewGraph() {
        const form = document.getElementById('addGraphForm');
        const formData = new FormData(form);

        const newGraph = {
            id: Date.now().toString(),
            name: document.getElementById('graphName').value,
            aliases: document.getElementById('graphAliases').value.split(',').map(a => a.trim()).filter(a => a),
            equation: document.getElementById('graphEquation').value,
            subject: document.getElementById('graphSubject').value,
            tags: document.getElementById('graphTags').value.split(',').map(t => t.trim()).filter(t => t),
            description: document.getElementById('graphDescription').value,
            graphCode: document.getElementById('graphCode').value || "function plotGraph() { return 'Custom Graph'; }",
            createdAt: new Date().toISOString()
        };

        this.graphs.unshift(newGraph);
        this.saveGraphs();
        this.filteredGraphs = [...this.graphs];
        this.renderGraphs();
        this.loadAdminGraphsList();

        // Show success message
        this.showNotification('Graph added successfully!', 'success');
    }

    deleteGraph(graphId) {
        if (!confirm('Are you sure you want to delete this graph?')) return;

        this.graphs = this.graphs.filter(graph => graph.id !== graphId);
        this.filteredGraphs = this.filteredGraphs.filter(graph => graph.id !== graphId);
        this.saveGraphs();
        this.renderGraphs();
        this.loadAdminGraphsList();

        this.showNotification('Graph deleted successfully!', 'success');
    }

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

    // PWA Setup
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed'));
        }
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

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GraphzApp();
});

// Make app globally available for onclick handlers
window.app = app;
