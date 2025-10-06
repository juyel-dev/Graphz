// script.js - Graphz Complete Enhanced Version

class GraphzApp {
    constructor() {
        this.graphs = [];
        this.filteredGraphs = [];
        this.isAdmin = false;
        this.currentPassword = "admin123";
        this.currentTab = 'graphs';
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.loadAllData();
        this.renderGraphs();
        this.renderAdZone();
        this.renderAboutSection();
        this.updateFooter();
        this.setupServiceWorker();
    }

    // Load all data from localStorage
    loadAllData() {
        // Load graphs
        const savedGraphs = localStorage.getItem('graphz-graphs');
        this.graphs = savedGraphs ? JSON.parse(savedGraphs) : this.loadSampleGraphs();
        
        // Load ads
        const savedAds = localStorage.getItem('graphz-ads');
        this.ads = savedAds ? JSON.parse(savedAds) : [];
        
        // Load about content
        const savedAbout = localStorage.getItem('graphz-about');
        this.aboutContent = savedAbout || this.getDefaultAboutContent();
        
        // Load contact info
        const savedContact = localStorage.getItem('graphz-contact');
        this.contactInfo = savedContact ? JSON.parse(savedContact) : this.getDefaultContactInfo();
        
        // Load social links
        const savedSocial = localStorage.getItem('graphz-social');
        this.socialLinks = savedSocial ? JSON.parse(savedSocial) : this.getDefaultSocialLinks();

        this.filteredGraphs = [...this.graphs];
    }

    // Default data
    loadSampleGraphs() {
        return [
            {
                id: '1',
                name: "Ohm's Law",
                aliases: ["ohms law", "voltage current relation"],
                equation: "V = I × R",
                subject: "Physics",
                tags: ["electricity", "circuits", "physics", "law"],
                description: "Shows the relationship between voltage (V), current (I), and resistance (R) in electrical circuits.",
                graphCode: this.getSimpleGraphCode("Ohm's Law", "V = I × R", "#6366f1"),
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                name: "Sine Wave",
                aliases: ["sinx", "sine function", "sinusoidal wave"],
                equation: "y = sin(x)",
                subject: "Mathematics",
                tags: ["trigonometry", "wave", "periodic", "function"],
                description: "The fundamental sine wave showing periodic oscillation between -1 and 1.",
                graphCode: this.getSimpleGraphCode("Sine Wave", "y = sin(x)", "#8b5cf6"),
                createdAt: new Date().toISOString()
            }
        ];
    }

    getDefaultAboutContent() {
        return `<h2>About Graphz</h2>
        <p>Graphz is a comprehensive platform for exploring mathematical and scientific graphs. Our mission is to make learning interactive and engaging through visual representations.</p>
        <p>Students, teachers, and researchers can discover, create, and share graphs across various subjects including Mathematics, Physics, Chemistry, and Engineering.</p>`;
    }

    getDefaultContactInfo() {
        return {
            email: "contact@graphz.com",
            phone: "+880 XXXX-XXXXXX",
            address: "Bangladesh"
        };
    }

    getDefaultSocialLinks() {
        return {
            facebook: "#",
            twitter: "#",
            instagram: "#",
            linkedin: "#",
            youtube: "#",
            reddit: "#"
        };
    }

    getSimpleGraphCode(name, equation, color) {
        return `
        function plotGraph() {
            const container = document.createElement('div');
            container.style.cssText = \`
                width: 100%;
                height: 160px;
                background: linear-gradient(45deg, #f0f9ff, #fef7ff);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #e2e8f0;
            \`;
            
            container.innerHTML = \`
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: \${color}; margin-bottom: 8px;">
                        \${equation}
                    </div>
                    <div style="color: #64748b; font-size: 0.9rem;">
                        \${name}
                    </div>
                    <div style="margin-top: 12px; color: #94a3b8;">
                        <i class="fas fa-project-diagram" style="font-size: 2rem;"></i>
                    </div>
                </div>
            \`;
            
            return container;
        }`;
    }

    // Enhanced Event Listeners
    initializeEventListeners() {
        // Mobile Menu
        document.getElementById('hamburgerMenu').addEventListener('click', () => this.toggleMobileMenu());
        document.getElementById('closeMenu').addEventListener('click', () => this.toggleMobileMenu());
        
        // Search Functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            searchInput.addEventListener('focus', () => this.showSearchSuggestions());
            document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }

        // Admin Panel
        document.getElementById('adminPanelBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.openAdminModal();
        });
        document.getElementById('closeAdminModal').addEventListener('click', () => this.closeAdminModal());
        document.getElementById('loginBtn').addEventListener('click', () => this.handleAdminLogin());

        // Explore Button
        document.getElementById('exploreBtn').addEventListener('click', () => {
            document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth' });
        });

        // Learn More Button
        document.querySelector('.btn-secondary').addEventListener('click', () => {
            document.getElementById('aboutSection').scrollIntoView({ behavior: 'smooth' });
        });

        // Mobile Menu Items
        this.setupMobileMenuEvents();

        // Close modal when clicking outside
        document.getElementById('adminModal').addEventListener('click', (e) => {
            if (e.target.id === 'adminModal') this.closeAdminModal();
        });
    }

    setupMobileMenuEvents() {
        const menuItems = {
            'home': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
            'gallery': () => document.querySelector('.featured-section').scrollIntoView({ behavior: 'smooth' }),
            'subjects': () => this.showSubjectsModal(),
            'about': () => document.getElementById('aboutSection').scrollIntoView({ behavior: 'smooth' }),
            'contact': () => document.querySelector('.footer').scrollIntoView({ behavior: 'smooth' })
        };

        Object.keys(menuItems).forEach(key => {
            const element = document.querySelector(`[data-menu="${key}"]`);
            if (element) {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    menuItems[key]();
                    this.toggleMobileMenu();
                });
            }
        });
    }

    // Mobile Menu
    toggleMobileMenu() {
        document.getElementById('mobileMenu').classList.toggle('active');
    }

    // Search Functionality
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
        const commonTypos = {
            'ohms': 'ohm', 'parabolla': 'parabola', 'sinus': 'sine',
            'cosinus': 'cosine', 'algebric': 'algebraic', 'trignometry': 'trigonometry'
        };

        let correctedQuery = normalizedQuery;
        Object.keys(commonTypos).forEach(typo => {
            if (normalizedQuery.includes(typo)) {
                correctedQuery = normalizedQuery.replace(typo, commonTypos[typo]);
            }
        });

        const matches = this.graphs.filter(graph => 
            graph.name.toLowerCase().includes(correctedQuery) ||
            graph.aliases.some(alias => alias.toLowerCase().includes(correctedQuery)) ||
            graph.tags.some(tag => tag.toLowerCase().includes(correctedQuery))
        );

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

        if (correctedQuery !== normalizedQuery) {
            suggestions.unshift({
                type: 'correction',
                text: `🔍 Did you mean: "${correctedQuery}"?`,
                searchTerm: correctedQuery
            });
        }

        return suggestions;
    }

    showSearchSuggestions(suggestions = []) {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
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
        const container = document.getElementById('searchSuggestions');
        if (container) container.classList.remove('show');
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
            graph.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        this.renderGraphs();
        this.hideSearchSuggestions();
    }

    // Graph Management
    renderGraphs() {
        const grid = document.getElementById('graphsGrid');
        if (!grid) return;
        
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
                    ${this.executeGraphCode(graph.graphCode)}
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

        // Add click events
        this.filteredGraphs.forEach(graph => {
            const card = document.querySelector(`[data-id="${graph.id}"]`);
            if (card) {
                card.addEventListener('click', () => this.viewGraphDetails(graph.id));
            }
        });
    }

    executeGraphCode(graphCode) {
        try {
            const graphFunction = new Function('return ' + graphCode)();
            const result = graphFunction();
            if (result instanceof HTMLElement) {
                return result.outerHTML;
            }
            return '<div style="color: #ef4444;">Graph Error</div>';
        } catch (error) {
            return '<div style="color: #ef4444;">Graph Error</div>';
        }
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
                        ${this.executeGraphCode(graph.graphCode)}
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

    // Admin Panel Functions
    openAdminModal() {
        document.getElementById('adminModal').classList.add('active');
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
            this.showAdminTab('graphs');
        } else {
            alert('Incorrect password! Please try again.');
        }
    }

    showAdminTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Show selected tab
        document.getElementById(`${tabName}-tab`).style.display = 'block';
        
        // Update active tab button
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Load tab content
        switch(tabName) {
            case 'graphs':
                this.loadAdminGraphsList();
                break;
            case 'ads':
                this.loadAdsManagement();
                break;
            case 'about':
                this.loadAboutManagement();
                break;
            case 'contact':
                this.loadContactManagement();
                break;
            case 'social':
                this.loadSocialManagement();
                break;
        }
    }

    loadAdminGraphsList() {
        const container = document.getElementById('adminGraphsList');
        container.innerHTML = `
            <button class="btn btn-success" onclick="app.showAddGraphForm()">
                <i class="fas fa-plus"></i> Add New Graph
            </button>
            <div style="margin-top: 1rem;">
                <h5>Current Graphs (${this.graphs.length})</h5>
                <div style="max-height: 300px; overflow-y: auto; margin-top: 1rem;">
                    ${this.graphs.map(graph => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid var(--border-color);">
                            <div>
                                <strong>${graph.name}</strong>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">${graph.equation}</div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-primary" onclick="app.editGraph('${graph.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger" onclick="app.deleteGraph('${graph.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showAddGraphForm(graph = null) {
        const isEdit = !!graph;
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? 'Edit Graph' : 'Add New Graph'}</h3>
                    <button class="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="graphForm" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="form-group">
                            <label>Graph Name *</label>
                            <input type="text" id="graphName" value="${isEdit ? graph.name : ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Aliases (comma separated)</label>
                            <input type="text" id="graphAliases" value="${isEdit ? graph.aliases.join(', ') : ''}" placeholder="ohms law, voltage current">
                        </div>
                        
                        <div class="form-group">
                            <label>Equation *</label>
                            <input type="text" id="graphEquation" value="${isEdit ? graph.equation : ''}" placeholder="V = I × R" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Subject *</label>
                            <select id="graphSubject" required>
                                <option value="">Select Subject</option>
                                <option value="Mathematics" ${isEdit && graph.subject === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                                <option value="Physics" ${isEdit && graph.subject === 'Physics' ? 'selected' : ''}>Physics</option>
                                <option value="Chemistry" ${isEdit && graph.subject === 'Chemistry' ? 'selected' : ''}>Chemistry</option>
                                <option value="Statistics" ${isEdit && graph.subject === 'Statistics' ? 'selected' : ''}>Statistics</option>
                                <option value="Engineering" ${isEdit && graph.subject === 'Engineering' ? 'selected' : ''}>Engineering</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Tags (comma separated)</label>
                            <input type="text" id="graphTags" value="${isEdit ? graph.tags.join(', ') : ''}" placeholder="electricity, circuits, law">
                        </div>
                        
                        <div class="form-group">
                            <label>Description *</label>
                            <textarea id="graphDescription" required rows="3">${isEdit ? graph.description : ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Graph Code (JavaScript)</label>
                            <textarea id="graphCode" rows="4" placeholder="function plotGraph() { ... }">${isEdit ? graph.graphCode : ''}</textarea>
                        </div>
                        
                        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">${isEdit ? 'Update Graph' : 'Save Graph'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#graphForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (isEdit) {
                this.updateGraph(graph.id);
            } else {
                this.saveNewGraph();
            }
            document.body.removeChild(modal);
        });

        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    editGraph(graphId) {
        const graph = this.graphs.find(g => g.id === graphId);
        if (graph) {
            this.showAddGraphForm(graph);
        }
    }

    saveNewGraph() {
        const newGraph = {
            id: Date.now().toString(),
            name: document.getElementById('graphName').value,
            aliases: document.getElementById('graphAliases').value.split(',').map(a => a.trim()).filter(a => a),
            equation: document.getElementById('graphEquation').value,
            subject: document.getElementById('graphSubject').value,
            tags: document.getElementById('graphTags').value.split(',').map(t => t.trim()).filter(t => t),
            description: document.getElementById('graphDescription').value,
            graphCode: document.getElementById('graphCode').value || this.getSimpleGraphCode(
                document.getElementById('graphName').value,
                document.getElementById('graphEquation').value,
                '#6366f1'
            ),
            createdAt: new Date().toISOString()
        };

        this.graphs.unshift(newGraph);
        this.saveGraphs();
        this.filteredGraphs = [...this.graphs];
        this.renderGraphs();
        this.loadAdminGraphsList();
        this.showNotification('Graph added successfully!', 'success');
    }

    updateGraph(graphId) {
        const graphIndex = this.graphs.findIndex(g => g.id === graphId);
        if (graphIndex !== -1) {
            this.graphs[graphIndex] = {
                ...this.graphs[graphIndex],
                name: document.getElementById('graphName').value,
                aliases: document.getElementById('graphAliases').value.split(',').map(a => a.trim()).filter(a => a),
                equation: document.getElementById('graphEquation').value,
                subject: document.getElementById('graphSubject').value,
                tags: document.getElementById('graphTags').value.split(',').map(t => t.trim()).filter(t => t),
                description: document.getElementById('graphDescription').value,
                graphCode: document.getElementById('graphCode').value
            };

            this.saveGraphs();
            this.filteredGraphs = [...this.graphs];
            this.renderGraphs();
            this.loadAdminGraphsList();
            this.showNotification('Graph updated successfully!', 'success');
        }
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

    saveGraphs() {
        localStorage.setItem('graphz-graphs', JSON.stringify(this.graphs));
    }

    // Ad Zone Management
    renderAdZone() {
        const container = document.getElementById('adContainer');
        if (!container) return;

        if (this.ads.length === 0) {
            container.innerHTML = `
                <div class="ad-placeholder">
                    <i class="fas fa-bullhorn"></i>
                    <p>Advertisement Space</p>
                    <small>Admin panel থেকে ad manage করুন</small>
                </div>
            `;
        } else {
            container.innerHTML = this.ads.map(ad => `
                <div class="ad-content">
                    ${ad.type === 'banner' ? `
                        <div class="ad-banner">
                            <h4>${ad.title}</h4>
                            <p>${ad.content}</p>
                            ${ad.link ? `<a href="${ad.link}" target="_blank" style="color: var(--primary-color);">Learn More</a>` : ''}
                        </div>
                    ` : `
                        <div class="ad-text">
                            <p>${ad.content}</p>
                        </div>
                    `}
                </div>
            `).join('');
        }
    }

    loadAdsManagement() {
        const container = document.getElementById('ads-tab');
        container.innerHTML = `
            <h4>Ad Management</h4>
            <button class="btn btn-success" onclick="app.showAddAdForm()">
                <i class="fas fa-plus"></i> Add New Ad
            </button>
            <div style="margin-top: 1rem;">
                <h5>Current Ads (${this.ads.length})</h5>
                <div style="max-height: 300px; overflow-y: auto; margin-top: 1rem;">
                    ${this.ads.map((ad, index) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid var(--border-color);">
                            <div>
                                <strong>${ad.title || 'Text Ad'}</strong>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">${ad.type} • ${ad.content.substring(0, 50)}...</div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-danger" onclick="app.deleteAd(${index})" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showAddAdForm() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add New Advertisement</h3>
                    <button class="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="adForm" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="form-group">
                            <label>Ad Type *</label>
                            <select id="adType" required>
                                <option value="text">Text Advertisement</option>
                                <option value="banner">Banner Advertisement</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Title (for banner ads)</label>
                            <input type="text" id="adTitle" placeholder="Advertisement Title">
                        </div>
                        
                        <div class="form-group">
                            <label>Content *</label>
                            <textarea id="adContent" required rows="3" placeholder="Enter your advertisement content..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Link (optional)</label>
                            <input type="url" id="adLink" placeholder="https://example.com">
                        </div>
                        
                        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Ad</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#adForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewAd();
            document.body.removeChild(modal);
        });

        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    saveNewAd() {
        const newAd = {
            type: document.getElementById('adType').value,
            title: document.getElementById('adTitle').value,
            content: document.getElementById('adContent').value,
            link: document.getElementById('adLink').value
        };

        this.ads.push(newAd);
        localStorage.setItem('graphz-ads', JSON.stringify(this.ads));
        this.renderAdZone();
        this.loadAdsManagement();
        this.showNotification('Advertisement added successfully!', 'success');
    }

    deleteAd(adIndex) {
        if (!confirm('Are you sure you want to delete this advertisement?')) return;

        this.ads.splice(adIndex, 1);
        localStorage.setItem('graphz-ads', JSON.stringify(this.ads));
        this.renderAdZone();
        this.loadAdsManagement();
        this.showNotification('Advertisement deleted successfully!', 'success');
    }

    // About Section Management
    renderAboutSection() {
        const container = document.getElementById('aboutContent');
        if (container) {
            container.innerHTML = this.aboutContent;
        }
    }

    loadAboutManagement() {
        const container = document.getElementById('about-tab');
        container.innerHTML = `
            <h4>About Section Management</h4>
            <form id="aboutForm" class="contact-form">
                <div class="form-group">
                    <label>About Content (HTML allowed) *</label>
                    <textarea id="aboutContentInput" required rows="10">${this.aboutContent}</textarea>
                </div>
                <button type="submit" class="btn btn-primary">Save About Content</button>
            </form>
        `;

        container.querySelector('#aboutForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAboutContent();
        });
    }

    saveAboutContent() {
        this.aboutContent = document.getElementById('aboutContentInput').value;
        localStorage.setItem('graphz-about', this.aboutContent);
        this.renderAboutSection();
        this.showNotification('About content updated successfully!', 'success');
    }

    // Contact Management
    loadContactManagement() {
        const container = document.getElementById('contact-tab');
        container.innerHTML = `
            <h4>Contact Information</h4>
            <form id="contactForm" class="contact-form">
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" id="contactEmail" value="${this.contactInfo.email}" required>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" id="contactPhone" value="${this.contactInfo.phone}">
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <input type="text" id="contactAddress" value="${this.contactInfo.address}">
                </div>
                <button type="submit" class="btn btn-primary">Save Contact Info</button>
            </form>
        `;

        container.querySelector('#contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContactInfo();
        });
    }

    saveContactInfo() {
        this.contactInfo = {
            email: document.getElementById('contactEmail').value,
            phone: document.getElementById('contactPhone').value,
            address: document.getElementById('contactAddress').value
        };
        localStorage.setItem('graphz-contact', JSON.stringify(this.contactInfo));
        this.updateFooter();
        this.showNotification('Contact information updated successfully!', 'success');
    }

    // Social Links Management
    loadSocialManagement() {
        const container = document.getElementById('social-tab');
        container.innerHTML = `
            <h4>Social Media Links</h4>
            <form id="socialForm" class="contact-form social-links-form">
                <div class="form-group">
                    <label>Facebook URL</label>
                    <input type="url" id="facebookUrl" value="${this.socialLinks.facebook}">
                </div>
                <div class="form-group">
                    <label>Twitter URL</label>
                    <input type="url" id="twitterUrl" value="${this.socialLinks.twitter}">
                </div>
                <div class="form-group">
                    <label>Instagram URL</label>
                    <input type="url" id="instagramUrl" value="${this.socialLinks.instagram}">
                </div>
                <div class="form-group">
                    <label>LinkedIn URL</label>
                    <input type="url" id="linkedinUrl" value="${this.socialLinks.linkedin}">
                </div>
                <div class="form-group">
                    <label>YouTube URL</label>
                    <input type="url" id="youtubeUrl" value="${this.socialLinks.youtube}">
                </div>
                <div class="form-group">
                    <label>Reddit URL</label>
                    <input type="url" id="redditUrl" value="${this.socialLinks.reddit}">
                </div>
                <button type="submit" class="btn btn-primary">Save Social Links</button>
            </form>
        `;

        container.querySelector('#socialForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSocialLinks();
        });
    }

    saveSocialLinks() {
        this.socialLinks = {
            facebook: document.getElementById('facebookUrl').value,
            twitter: document.getElementById('twitterUrl').value,
            instagram: document.getElementById('instagramUrl').value,
            linkedin: document.getElementById('linkedinUrl').value,
            youtube: document.getElementById('youtubeUrl').value,
            reddit: document.getElementById('redditUrl').value
        };
        localStorage.setItem('graphz-social', JSON.stringify(this.socialLinks));
        this.updateFooter();
        this.showNotification('Social links updated successfully!', 'success');
    }

    // Footer Update
    updateFooter() {
        const footer = document.querySelector('.footer');
        if (footer) {
            // Update contact info
            const contactSection = footer.querySelector('.footer-section:nth-child(4)');
            if (contactSection) {
                contactSection.innerHTML = `
                    <h4>Contact</h4>
                    <p><i class="fas fa-envelope"></i> ${this.contactInfo.email}</p>
                    <p><i class="fas fa-phone"></i> ${this.contactInfo.phone}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${this.contactInfo.address}</p>
                `;
            }

            // Update social links
            const socialLinksContainer = footer.querySelector('.social-links');
            if (socialLinksContainer) {
                socialLinksContainer.innerHTML = `
                    ${this.socialLinks.facebook ? `<a href="${this.socialLinks.facebook}" class="social-link"><i class="fab fa-facebook"></i></a>` : ''}
                    ${this.socialLinks.twitter ? `<a href="${this.socialLinks.twitter}" class="social-link"><i class="fab fa-twitter"></i></a>` : ''}
                    ${this.socialLinks.instagram ? `<a href="${this.socialLinks.instagram}" class="social-link"><i class="fab fa-instagram"></i></a>` : ''}
                    ${this.socialLinks.linkedin ? `<a href="${this.socialLinks.linkedin}" class="social-link"><i class="fab fa-linkedin"></i></a>` : ''}
                    ${this.socialLinks.youtube ? `<a href="${this.socialLinks.youtube}" class="social-link"><i class="fab fa-youtube"></i></a>` : ''}
                    ${this.socialLinks.reddit ? `<a href="${this.socialLinks.reddit}" class="social-link"><i class="fab fa-reddit"></i></a>` : ''}
                `;
            }
        }
    }

    // Notification System
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

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GraphzApp();
});
window.app = app;
