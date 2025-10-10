// ===== GRAPHZ - COMPLETE HYBRID GRAPH SYSTEM =====
// Future-Proof Architecture with Mobile-First Design

class GraphzApp {
    constructor() {
        this.version = '1.0.0';
        this.graphs = [];
        this.filteredGraphs = [];
        this.ads = {};
        this.settings = {};
        this.isAdmin = false;
        this.currentSection = 'home';
        this.currentCategory = 'all';
        
        // Default admin password (can be changed in settings)
        this.adminPassword = "admin123";
        
        // Initialize core systems
        this.init();
    }

    // ===== INITIALIZATION =====
    init() {
        console.log(`🚀 Graphz v${this.version} - Initializing...`);
        
        this.loadAllData();
        this.initializeCoreSystems();
        this.initializeEventListeners();
        this.setupServiceWorker();
        this.renderHomepage();
        
        console.log('✅ Graphz initialized successfully!');
    }

    initializeCoreSystems() {
        // Initialize all core systems
        this.graphRenderer = new HybridGraphRenderer();
        this.searchEngine = new SmartSearchEngine(this.graphs);
        this.adminManager = new AdminManager(this);
        this.adManager = new AdManager(this);
        this.uiManager = new UIManager(this);
    }

    initializeEventListeners() {
        // Mobile Menu
        this.uiManager.setupMobileMenu();
        
        // Search Functionality
        this.setupSearchEvents();
        
        // Navigation
        this.setupNavigationEvents();
        
        // Admin Panel
        this.setupAdminEvents();
        
        // Graph Interactions
        this.setupGraphEvents();
        
        // Ad System
        this.setupAdEvents();
        
        // Window Events
        this.setupWindowEvents();
    }

    // ===== DATA MANAGEMENT =====
    loadAllData() {
        this.loadGraphs();
        this.loadAds();
        this.loadSettings();
        this.updateStats();
    }

    loadGraphs() {
        const savedGraphs = localStorage.getItem('graphz-graphs');
        if (savedGraphs) {
            this.graphs = JSON.parse(savedGraphs);
        } else {
            this.graphs = this.getDefaultGraphs();
            this.saveGraphs();
        }
        this.filteredGraphs = [...this.graphs];
    }

    loadAds() {
        const savedAds = localStorage.getItem('graphz-ads');
        this.ads = savedAds ? JSON.parse(savedAds) : this.getDefaultAds();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('graphz-settings');
        this.settings = savedSettings ? JSON.parse(savedSettings) : this.getDefaultSettings();
    }

    saveGraphs() {
        localStorage.setItem('graphz-graphs', JSON.stringify(this.graphs));
        this.updateStats();
    }

    saveAds() {
        localStorage.setItem('graphz-ads', JSON.stringify(this.ads));
    }

    saveSettings() {
        localStorage.setItem('graphz-settings', JSON.stringify(this.settings));
    }

    // ===== DEFAULT DATA =====
    getDefaultGraphs() {
        return [
            // Physics - Interactive Graphs
            {
                id: 'phy-1',
                name: "Ohm's Law Interactive",
                type: "interactive",
                category: "physics",
                subcategory: "electricity",
                equation: "V = I × R",
                subject: "Physics",
                aliases: ["ohms law", "voltage current", "electrical law"],
                tags: ["electricity", "circuits", "law", "interactive"],
                description: "Interactive visualization of Ohm's Law showing the relationship between voltage, current, and resistance. Adjust parameters in real-time.",
                graphCode: this.getOhmsLawCode(),
                createdAt: new Date().toISOString(),
                popularity: 150,
                rating: 4.8
            },
            {
                id: 'phy-2',
                name: "Velocity-Time Graph",
                type: "interactive",
                category: "physics",
                subcategory: "kinematics",
                equation: "v = u + at",
                subject: "Physics",
                aliases: ["velocity time", "motion graph", "kinematics"],
                tags: ["kinematics", "motion", "velocity", "interactive"],
                description: "Real-time velocity-time graph showing different types of motion with adjustable initial velocity and acceleration.",
                graphCode: this.getVelocityTimeCode(),
                createdAt: new Date().toISOString(),
                popularity: 120,
                rating: 4.6
            },

            // Physics - Image Graphs
            {
                id: 'phy-img-1',
                name: "Circuit Diagram - Series & Parallel",
                type: "image",
                category: "physics",
                subcategory: "electricity",
                equation: "Series: R_total = R1 + R2, Parallel: 1/R_total = 1/R1 + 1/R2",
                subject: "Physics",
                aliases: ["circuit diagram", "series parallel", "resistance"],
                tags: ["electricity", "circuits", "diagram", "resistance"],
                description: "Comparison of series and parallel circuit configurations with formulas for total resistance calculation.",
                imageData: null, // Will be base64 or URL
                imageUrl: "assets/images/circuit-diagram.png",
                createdAt: new Date().toISOString(),
                popularity: 95,
                rating: 4.5
            },

            // Chemistry - Interactive Graphs
            {
                id: 'chem-1',
                name: "pH Titration Curve",
                type: "interactive",
                category: "chemistry",
                subcategory: "equilibrium",
                equation: "HA + OH⁻ → A⁻ + H₂O",
                subject: "Chemistry",
                aliases: ["titration curve", "ph curve", "acid base"],
                tags: ["titration", "ph", "acid-base", "equilibrium", "interactive"],
                description: "Interactive titration curve showing pH changes during acid-base titration with different indicators.",
                graphCode: this.getTitrationCurveCode(),
                createdAt: new Date().toISOString(),
                popularity: 110,
                rating: 4.7
            },

            // Chemistry - Image Graphs
            {
                id: 'chem-img-1',
                name: "Periodic Table Trends",
                type: "image",
                category: "chemistry",
                subcategory: "periodic",
                equation: "Various periodic trends",
                subject: "Chemistry",
                aliases: ["periodic table", "trends", "atomic radius"],
                tags: ["periodic table", "trends", "atomic properties"],
                description: "Visual representation of periodic trends including atomic radius, ionization energy, and electronegativity.",
                imageData: null,
                imageUrl: "assets/images/periodic-trends.png",
                createdAt: new Date().toISOString(),
                popularity: 130,
                rating: 4.9
            },

            // Mathematics - Interactive Graphs
            {
                id: 'math-1',
                name: "Sine Wave Function",
                type: "interactive",
                category: "mathematics",
                subcategory: "trigonometry",
                equation: "y = A sin(Bx + C)",
                subject: "Mathematics",
                aliases: ["sine wave", "sinusoidal", "trig function"],
                tags: ["trigonometry", "wave", "function", "interactive"],
                description: "Interactive sine wave with adjustable amplitude, frequency, and phase shift parameters.",
                graphCode: this.getSineWaveCode(),
                createdAt: new Date().toISOString(),
                popularity: 200,
                rating: 4.8
            }
        ];
    }

    getDefaultAds() {
        return {
            topAd: {
                image: null,
                url: null,
                active: false
            },
            middleAd: {
                image: null,
                url: null,
                active: false
            }
        };
    }

    getDefaultSettings() {
        return {
            adminPassword: "admin123",
            theme: "light",
            language: "en",
            autoSave: true,
            graphQuality: "high",
            offlineMode: false
        };
    }

    // ===== GRAPH CODE TEMPLATES =====
    getOhmsLawCode() {
        return `function plotOhmsLaw() {
    const container = document.createElement('div');
    container.className = 'interactive-graph';
    container.innerHTML = \\`
        <div class="graph-controls">
            <h4>Ohm's Law: V = I × R</h4>
            <div class="control-group">
                <label>Voltage (V): <span id="voltageValue">12</span>V</label>
                <input type="range" id="voltageSlider" min="1" max="24" value="12" step="0.1">
            </div>
            <div class="control-group">
                <label>Resistance (R): <span id="resistanceValue">4</span>Ω</label>
                <input type="range" id="resistanceSlider" min="1" max="10" value="4" step="0.1">
            </div>
            <div class="result">
                <strong>Current (I): <span id="currentValue">3.0</span>A</strong>
            </div>
        </div>
        <div class="graph-visual">
            <canvas id="ohmsLawCanvas" width="400" height="200"></canvas>
        </div>
    \\`;

    // Initialize canvas
    setTimeout(() => {
        const canvas = container.querySelector('#ohmsLawCanvas');
        const ctx = canvas.getContext('2d');
        const voltageSlider = container.querySelector('#voltageSlider');
        const resistanceSlider = container.querySelector('#resistanceSlider');
        const voltageValue = container.querySelector('#voltageValue');
        const resistanceValue = container.querySelector('#resistanceValue');
        const currentValue = container.querySelector('#currentValue');

        function calculateCurrent() {
            const V = parseFloat(voltageSlider.value);
            const R = parseFloat(resistanceSlider.value);
            const I = V / R;
            return { V, R, I };
        }

        function updateGraph() {
            const { V, R, I } = calculateCurrent();
            
            // Update display values
            voltageValue.textContent = V.toFixed(1);
            resistanceValue.textContent = R.toFixed(1);
            currentValue.textContent = I.toFixed(2);

            // Draw graph
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw axes
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(50, 30);
            ctx.lineTo(50, 170);
            ctx.lineTo(350, 170);
            ctx.stroke();

            // Draw labels
            ctx.fillStyle = '#64748b';
            ctx.font = '12px Arial';
            ctx.fillText('Current (A)', 10, 100);
            ctx.fillText('Voltage (V)', 200, 190);

            // Draw data points
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let v = 1; v <= 24; v++) {
                const i = v / R;
                const x = 50 + (v / 24) * 300;
                const y = 170 - (i / 5) * 140;
                
                if (v === 1) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            // Highlight current point
            const currentX = 50 + (V / 24) * 300;
            const currentY = 170 - (I / 5) * 140;
            
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(currentX, currentY, 5, 0, 2 * Math.PI);
            ctx.fill();
        }

        voltageSlider.addEventListener('input', updateGraph);
        resistanceSlider.addEventListener('input', updateGraph);
        
        updateGraph(); // Initial render
    }, 0);

    return container;
}`;
    }

    getVelocityTimeCode() {
        return `function plotVelocityTime() {
    const container = document.createElement('div');
    container.className = 'interactive-graph';
    container.innerHTML = \\`
        <div class="graph-controls">
            <h4>Velocity-Time Graph</h4>
            <div class="control-group">
                <label>Initial Velocity: <span id="initialVelocityValue">5</span> m/s</label>
                <input type="range" id="initialVelocitySlider" min="0" max="20" value="5" step="0.1">
            </div>
            <div class="control-group">
                <label>Acceleration: <span id="accelerationValue">2</span> m/s²</label>
                <input type="range" id="accelerationSlider" min="-5" max="5" value="2" step="0.1">
            </div>
            <div class="control-group">
                <label>Time: <span id="timeValue">10</span> s</label>
                <input type="range" id="timeSlider" min="1" max="20" value="10" step="0.1">
            </div>
        </div>
        <div class="graph-visual">
            <canvas id="velocityCanvas" width="400" height="200"></canvas>
        </div>
    \\`;

    setTimeout(() => {
        const canvas = container.querySelector('#velocityCanvas');
        const ctx = canvas.getContext('2d');
        
        function updateGraph() {
            const u = parseFloat(container.querySelector('#initialVelocitySlider').value);
            const a = parseFloat(container.querySelector('#accelerationSlider').value);
            const t = parseFloat(container.querySelector('#timeSlider').value);
            
            // Update display values
            container.querySelector('#initialVelocityValue').textContent = u.toFixed(1);
            container.querySelector('#accelerationValue').textContent = a.toFixed(1);
            container.querySelector('#timeValue').textContent = t.toFixed(1);

            // Draw graph
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw axes
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(50, 30);
            ctx.lineTo(50, 170);
            ctx.lineTo(350, 170);
            ctx.stroke();

            // Draw velocity-time curve
            ctx.strokeStyle = '#06d6a0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let time = 0; time <= t; time += 0.1) {
                const v = u + a * time;
                const x = 50 + (time / t) * 300;
                const y = 170 - (v / 20) * 140;
                
                if (time === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }

        container.querySelector('#initialVelocitySlider').addEventListener('input', updateGraph);
        container.querySelector('#accelerationSlider').addEventListener('input', updateGraph);
        container.querySelector('#timeSlider').addEventListener('input', updateGraph);
        
        updateGraph();
    }, 0);

    return container;
}`;
    }

    getTitrationCurveCode() {
        return `function plotTitrationCurve() {
    const container = document.createElement('div');
    container.className = 'interactive-graph';
    container.innerHTML = \\`
        <div class="graph-controls">
            <h4>pH Titration Curve</h4>
            <div class="control-group">
                <label>Acid Strength: <span id="acidStrengthValue">Strong</span></label>
                <select id="acidStrength">
                    <option value="strong">Strong Acid</option>
                    <option value="weak">Weak Acid</option>
                </select>
            </div>
            <div class="control-group">
                <label>Base Strength: <span id="baseStrengthValue">Strong</span></label>
                <select id="baseStrength">
                    <option value="strong">Strong Base</option>
                    <option value="weak">Weak Base</option>
                </select>
            </div>
        </div>
        <div class="graph-visual">
            <canvas id="titrationCanvas" width="400" height="200"></canvas>
        </div>
    \\`;

    setTimeout(() => {
        const canvas = container.querySelector('#titrationCanvas');
        const ctx = canvas.getContext('2d');
        
        function updateGraph() {
            const acidStrength = container.querySelector('#acidStrength').value;
            const baseStrength = container.querySelector('#baseStrength').value;
            
            container.querySelector('#acidStrengthValue').textContent = acidStrength === 'strong' ? 'Strong' : 'Weak';
            container.querySelector('#baseStrengthValue').textContent = baseStrength === 'strong' ? 'Strong' : 'Weak';

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw axes
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(50, 30);
            ctx.lineTo(50, 170);
            ctx.lineTo(350, 170);
            ctx.stroke();

            // Draw titration curve based on acid/base strength
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let volume = 0; volume <= 100; volume++) {
                let pH;
                if (acidStrength === 'strong' && baseStrength === 'strong') {
                    // Strong acid-strong base
                    pH = volume < 50 ? 1 + (volume / 50) * 1 : 13 - ((volume - 50) / 50) * 1;
                    if (Math.abs(volume - 50) < 2) pH = 7;
                } else {
                    // Weak acid/weak base - more gradual curve
                    pH = volume < 50 ? 3 + (volume / 50) * 5 : 11 - ((volume - 50) / 50) * 5;
                }
                
                const x = 50 + (volume / 100) * 300;
                const y = 170 - ((pH - 1) / 13) * 140;
                
                if (volume === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }

        container.querySelector('#acidStrength').addEventListener('change', updateGraph);
        container.querySelector('#baseStrength').addEventListener('change', updateGraph);
        
        updateGraph();
    }, 0);

    return container;
}`;
    }

    getSineWaveCode() {
        return `function plotSineWave() {
    const container = document.createElement('div');
    container.className = 'interactive-graph';
    container.innerHTML = \\`
        <div class="graph-controls">
            <h4>Sine Wave: y = A sin(Bx + C)</h4>
            <div class="control-group">
                <label>Amplitude (A): <span id="amplitudeValue">1</span></label>
                <input type="range" id="amplitudeSlider" min="0.1" max="3" value="1" step="0.1">
            </div>
            <div class="control-group">
                <label>Frequency (B): <span id="frequencyValue">1</span></label>
                <input type="range" id="frequencySlider" min="0.5" max="3" value="1" step="0.1">
            </div>
            <div class="control-group">
                <label>Phase Shift (C): <span id="phaseValue">0</span></label>
                <input type="range" id="phaseSlider" min="0" max="6.28" value="0" step="0.1">
            </div>
        </div>
        <div class="graph-visual">
            <canvas id="sineCanvas" width="400" height="200"></canvas>
        </div>
    \\`;

    setTimeout(() => {
        const canvas = container.querySelector('#sineCanvas');
        const ctx = canvas.getContext('2d');
        
        function updateGraph() {
            const A = parseFloat(container.querySelector('#amplitudeSlider').value);
            const B = parseFloat(container.querySelector('#frequencySlider').value);
            const C = parseFloat(container.querySelector('#phaseSlider').value);
            
            container.querySelector('#amplitudeValue').textContent = A.toFixed(1);
            container.querySelector('#frequencyValue').textContent = B.toFixed(1);
            container.querySelector('#phaseValue').textContent = C.toFixed(1);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw axes
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(50, 100);
            ctx.lineTo(350, 100);
            ctx.moveTo(200, 30);
            ctx.lineTo(200, 170);
            ctx.stroke();

            // Draw sine wave
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let x = 0; x <= 300; x++) {
                const xCoord = (x - 150) * 0.1;
                const y = A * Math.sin(B * xCoord + C);
                const pixelX = 50 + x;
                const pixelY = 100 - y * 30;
                
                if (x === 0) {
                    ctx.moveTo(pixelX, pixelY);
                } else {
                    ctx.lineTo(pixelX, pixelY);
                }
            }
            ctx.stroke();
        }

        container.querySelector('#amplitudeSlider').addEventListener('input', updateGraph);
        container.querySelector('#frequencySlider').addEventListener('input', updateGraph);
        container.querySelector('#phaseSlider').addEventListener('input', updateGraph);
        
        updateGraph();
    }, 0);

    return container;
}`;
    }

    // ===== SEARCH FUNCTIONALITY =====
    setupSearchEvents() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const searchSuggestions = document.getElementById('searchSuggestions');

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                const suggestions = this.searchEngine.getSuggestions(query);
                this.uiManager.showSearchSuggestions(suggestions);
            } else {
                this.uiManager.hideSearchSuggestions();
            }
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length > 0) {
                const suggestions = this.searchEngine.getSuggestions(searchInput.value.trim());
                this.uiManager.showSearchSuggestions(suggestions);
            }
        });

        searchBtn.addEventListener('click', () => {
            this.performSearch(searchInput.value.trim());
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value.trim());
            }
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                this.uiManager.hideSearchSuggestions();
            }
        });
    }

    performSearch(query) {
        if (!query) {
            this.filteredGraphs = [...this.graphs];
            this.renderCurrentSection();
            return;
        }

        this.filteredGraphs = this.searchEngine.search(query);
        this.renderCurrentSection();
        this.uiManager.hideSearchSuggestions();
        
        // Update URL for shareable links
        this.updateURL({ search: query });
    }

    // ===== NAVIGATION =====
    setupNavigationEvents() {
        // Mobile menu navigation
        document.querySelectorAll('.nav-item[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
                this.uiManager.toggleMobileMenu();
            });
        });

        // Footer navigation
        document.querySelectorAll('.footer-section a[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Category filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                this.filterByCategory(category);
                
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Hero section buttons
        document.getElementById('explorePhysicsBtn').addEventListener('click', () => {
            this.navigateToSection('physics');
        });

        document.getElementById('exploreChemistryBtn').addEventListener('click', () => {
            this.navigateToSection('chemistry');
        });
    }

    navigateToSection(section) {
        this.currentSection = section;
        this.currentCategory = 'all';
        
        // Reset all sections
        document.querySelectorAll('.subject-section, .about-section, .hero-section').forEach(sec => {
            sec.style.display = 'none';
        });
        
        // Show target section
        const targetSection = document.getElementById(section + 'Section');
        if (targetSection) {
            targetSection.style.display = 'block';
        } else {
            document.getElementById('homeSection').style.display = 'block';
        }
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });
        
        // Render content for the section
        this.renderCurrentSection();
        
        // Update URL
        this.updateURL({ section: section });
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.renderCurrentSection();
    }

    renderCurrentSection() {
        let graphsToRender = this.filteredGraphs;
        
        // Filter by current section and category
        if (this.currentSection !== 'home' && this.currentSection !== 'about') {
            graphsToRender = graphsToRender.filter(graph => 
                graph.category === this.currentSection
            );
            
            if (this.currentCategory !== 'all') {
                graphsToRender = graphsToRender.filter(graph =>
                    graph.subcategory === this.currentCategory
                );
            }
        }
        
        const gridId = this.currentSection + 'Grid';
        this.renderGraphs(gridId, graphsToRender);
    }

    renderHomepage() {
        this.updateStats();
        this.renderHeroGraph();
        this.renderCurrentSection();
    }

    // ===== GRAPH RENDERING =====
    renderGraphs(containerId, graphs) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (graphs.length === 0) {
            container.innerHTML = this.getNoResultsHTML();
            return;
        }

        container.innerHTML = graphs.map(graph => this.createGraphCardHTML(graph)).join('');
        
        // Render each graph
        graphs.forEach(graph => {
            const graphContainer = document.getElementById(`graph-${graph.id}`);
            if (graphContainer) {
                this.graphRenderer.renderGraph(graph, graphContainer);
            }
        });
    }

    createGraphCardHTML(graph) {
        const typeIcon = graph.type === 'interactive' ? '🔧' : '🖼️';
        const typeClass = graph.type === 'interactive' ? 'interactive' : 'image';
        
        return `
            <div class="graph-card fade-in" data-id="${graph.id}">
                <div class="graph-preview" id="graph-${graph.id}">
                    <div class="loading-graph">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading ${graph.type} graph...</p>
                    </div>
                </div>
                <div class="graph-type-badge ${typeClass}">
                    ${typeIcon} ${graph.type}
                </div>
                <div class="graph-info">
                    <h3>${graph.name}</h3>
                    <p>${graph.description}</p>
                    <div class="graph-meta">
                        <span class="graph-tag">${graph.subject}</span>
                        <span class="graph-tag">${graph.subcategory}</span>
                        ${graph.tags.slice(0, 2).map(tag => `<span class="graph-tag">${tag}</span>`).join('')}
                    </div>
                    <div class="graph-stats">
                        <span class="stat"><i class="fas fa-eye"></i> ${graph.popularity || 0}</span>
                        <span class="stat"><i class="fas fa-star"></i> ${graph.rating || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }

    getNoResultsHTML() {
        return `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No graphs found</h3>
                <p>Try adjusting your search or filters</p>
                <button class="btn btn-primary" onclick="app.clearSearch()">
                    <i class="fas fa-times"></i> Clear Search
                </button>
            </div>
        `;
    }

    renderHeroGraph() {
        const container = document.getElementById('heroGraphPreview');
        if (this.graphs.length > 0) {
            const featuredGraph = this.graphs[0]; // First graph as featured
            this.graphRenderer.renderGraph(featuredGraph, container);
        }
    }

    // ===== ADMIN FUNCTIONALITY =====
    setupAdminEvents() {
        this.adminManager.setupEventListeners();
    }

    // ===== AD SYSTEM =====
    setupAdEvents() {
        this.adManager.setupEventListeners();
        this.adManager.renderAds();
    }

    // ===== GRAPH INTERACTIONS =====
    setupGraphEvents() {
        // Graph card clicks
        document.addEventListener('click', (e) => {
            const graphCard = e.target.closest('.graph-card');
            if (graphCard) {
                const graphId = graphCard.dataset.id;
                this.showGraphDetails(graphId);
            }
        });
    }

    showGraphDetails(graphId) {
        const graph = this.graphs.find(g => g.id === graphId);
        if (!graph) return;

        this.uiManager.showGraphDetailModal(graph);
    }

    // ===== WINDOW EVENTS =====
    setupWindowEvents() {
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            this.handlePopState(e.state);
        });

        // Online/offline detection
        window.addEventListener('online', () => {
            this.uiManager.showNotification('Connection restored', 'success');
        });

        window.addEventListener('offline', () => {
            this.uiManager.showNotification('Working offline', 'warning');
        });

        // Resize handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handlePopState(state) {
        if (state) {
            if (state.section) this.navigateToSection(state.section);
            if (state.search) this.performSearch(state.search);
        }
    }

    handleResize() {
        // Re-render graphs on resize for responsiveness
        if (this.currentSection) {
            this.renderCurrentSection();
        }
    }

    // ===== UTILITY METHODS =====
    updateStats() {
        const physicsCount = this.graphs.filter(g => g.category === 'physics').length;
        const chemistryCount = this.graphs.filter(g => g.category === 'chemistry').length;
        const mathCount = this.graphs.filter(g => g.category === 'mathematics').length;

        document.getElementById('physicsCount').textContent = physicsCount;
        document.getElementById('chemistryCount').textContent = chemistryCount;
        document.getElementById('mathCount').textContent = mathCount;
    }

    updateURL(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key]) {
                url.searchParams.set(key, params[key]);
            } else {
                url.searchParams.delete(key);
            }
        });
        window.history.pushState(params, '', url);
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.filteredGraphs = [...this.graphs];
        this.renderCurrentSection();
        this.updateURL({ search: null });
    }

    // ===== PWA SETUP =====
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('❌ Service Worker registration failed:', error);
                });
        }
    }

    // ===== EXPORT/IMPORT =====
    exportData() {
        const data = {
            graphs: this.graphs,
            ads: this.ads,
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: this.version
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `graphz-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.graphs) this.graphs = data.graphs;
                if (data.ads) this.ads = data.ads;
                if (data.settings) this.settings = data.settings;
                
                this.saveGraphs();
                this.saveAds();
                this.saveSettings();
                this.loadAllData();
                this.renderHomepage();
                
                this.uiManager.showNotification('Data imported successfully!', 'success');
            } catch (error) {
                this.uiManager.showNotification('Error importing data', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }
}

// ===== HYBRID GRAPH RENDERER =====
class HybridGraphRenderer {
    constructor() {
        this.canvasGraphs = new Map();
        this.imageCache = new Map();
    }

    renderGraph(graph, container) {
        container.innerHTML = '';
        
        try {
            switch(graph.type) {
                case 'interactive':
                    this.renderInteractiveGraph(graph, container);
                    break;
                case 'image':
                    this.renderImageGraph(graph, container);
                    break;
                default:
                    this.renderFallbackGraph(graph, container);
            }
        } catch (error) {
            console.error('Graph rendering error:', error);
            this.renderErrorGraph(graph, container, error);
        }
    }

    renderInteractiveGraph(graph, container) {
        try {
            // Safe execution of graph code
            const graphFunction = new Function('return ' + graph.graphCode)();
            const result = graphFunction();
            
            if (result instanceof HTMLElement) {
                container.appendChild(result);
            } else if (typeof result === 'string') {
                container.innerHTML = result;
            } else {
                throw new Error('Invalid graph output');
            }
        } catch (error) {
            throw new Error(`Graph execution failed: ${error.message}`);
        }
    }

    renderImageGraph(graph, container) {
        const img = document.createElement('img');
        img.alt = graph.description || graph.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.style.borderRadius = '8px';
        
        // Use imageData (base64) or imageUrl
        if (graph.imageData) {
            img.src = graph.imageData;
        } else if (graph.imageUrl) {
            img.src = graph.imageUrl;
            img.onerror = () => {
                this.renderFallbackGraph(graph, container);
            };
        } else {
            this.renderFallbackGraph(graph, container);
            return;
        }
        
        container.appendChild(img);
    }

    renderFallbackGraph(graph, container) {
        container.innerHTML = `
            <div class="fallback-graph" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 1rem; text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
                <h4 style="margin-bottom: 0.5rem; color: var(--text-primary);">${graph.name}</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">${graph.equation}</p>
                <div style="color: var(--text-muted); font-size: 0.9rem;">
                    <i class="fas fa-info-circle"></i> Graph preview not available
                </div>
            </div>
        `;
    }

    renderErrorGraph(graph, container, error) {
        container.innerHTML = `
            <div class="graph-error" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 1rem; text-align: center; color: var(--danger-color);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <h4 style="margin-bottom: 0.5rem;">Graph Loading Failed</h4>
                <p style="margin-bottom: 1rem; font-size: 0.9rem;">${graph.name}</p>
                <small style="color: var(--text-muted);">Error: ${error.message}</small>
            </div>
        `;
    }
}

// ===== SMART SEARCH ENGINE =====
class SmartSearchEngine {
    constructor(graphs) {
        this.graphs = graphs;
        this.typoCorrections = {
            'ohms': 'ohm',
            'parabolla': 'parabola',
            'sinus': 'sine',
            'cosinus': 'cosine',
            'algebric': 'algebraic',
            'trignometry': 'trigonometry',
            'calulus': 'calculus',
            'diffrential': 'differential',
            'kinamatics': 'kinematics',
            'electicity': 'electricity'
        };
    }

    search(query) {
        const normalizedQuery = this.normalizeQuery(query);
        
        return this.graphs.filter(graph => {
            const searchableText = this.getSearchableText(graph);
            return searchableText.includes(normalizedQuery);
        });
    }

    getSuggestions(query) {
        if (query.length < 2) return [];

        const normalizedQuery = this.normalizeQuery(query);
        const suggestions = new Set();

        // Typo corrections
        Object.keys(this.typoCorrections).forEach(typo => {
            if (normalizedQuery.includes(typo)) {
                const correction = this.typoCorrections[typo];
                suggestions.add({
                    type: 'correction',
                    text: `🔍 Did you mean: "${correction}"?`,
                    action: correction
                });
            }
        });

        // Graph name matches
        this.graphs.forEach(graph => {
            if (graph.name.toLowerCase().includes(normalizedQuery)) {
                suggestions.add({
                    type: 'graph',
                    text: `📊 ${graph.name}`,
                    action: graph.id
                });
            }
        });

        // Tag matches
        this.graphs.forEach(graph => {
            if (graph.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
                suggestions.add({
                    type: 'tag',
                    text: `🏷️ Graphs about "${normalizedQuery}"`,
                    action: `search:${normalizedQuery}`
                });
            }
        });

        return Array.from(suggestions).slice(0, 5);
    }

    normalizeQuery(query) {
        return query.toLowerCase().trim();
    }

    getSearchableText(graph) {
        return [
            graph.name,
            graph.equation,
            graph.description,
            graph.subject,
            graph.subcategory,
            ...graph.aliases,
            ...graph.tags
        ].join(' ').toLowerCase();
    }
}

// ===== ADMIN MANAGER =====
class AdminManager {
    constructor(app) {
        this.app = app;
        this.currentTab = 'graphManagement';
    }

    setupEventListeners() {
        // Admin panel toggle
        document.getElementById('adminPanelBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.openAdminModal();
        });

        // Admin modal close
        document.getElementById('closeAdminModal').addEventListener('click', () => {
            this.closeAdminModal();
        });

        // Admin login
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.handleLogin();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Graph form type switching
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchGraphType(btn.dataset.type);
            });
        });

        // Graph form submission
        document.getElementById('addGraphForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewGraph();
        });

        // Image upload
        document.getElementById('browseImageBtn').addEventListener('click', () => {
            document.getElementById('imageUpload').click();
        });

        document.getElementById('imageUpload').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });

        // Drag and drop for images
        const dropZone = document.getElementById('imageDropZone');
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
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageUpload(files[0]);
            }
        });

        // Test code button
        document.getElementById('testCodeBtn').addEventListener('click', () => {
            this.testGraphCode();
        });

        // Clear code button
        document.getElementById('clearCodeBtn').addEventListener('click', () => {
            document.getElementById('graphCode').value = '';
        });

        // Data export/import
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.app.exportData();
        });

        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importDataInput').click();
        });

        document.getElementById('importDataInput').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.app.importData(e.target.files[0]);
            }
        });

        // Password change
        document.getElementById('changePasswordBtn').addEventListener('click', () => {
            this.changePassword();
        });

        // System reset
        document.getElementById('resetSystemBtn').addEventListener('click', () => {
            this.resetSystem();
        });
    }

    openAdminModal() {
        document.getElementById('adminModal').classList.add('active');
        this.resetAdminForm();
    }

    closeAdminModal() {
        document.getElementById('adminModal').classList.remove('active');
        this.app.isAdmin = false;
    }

    handleLogin() {
        const password = document.getElementById('adminPassword').value;
        
        if (password === this.app.adminPassword) {
            this.app.isAdmin = true;
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            this.loadAdminData();
            this.app.uiManager.showNotification('Admin login successful!', 'success');
        } else {
            this.app.uiManager.showNotification('Incorrect password!', 'error');
            document.getElementById('adminPassword').value = '';
            document.getElementById('adminPassword').focus();
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === tabName) {
                content.classList.add('active');
            }
        });
    }

    switchGraphType(type) {
        // Update type buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            }
        });
        
        // Show/hide form sections
        document.getElementById('interactiveSection').classList.toggle('hidden', type !== 'interactive');
        document.getElementById('imageSection').classList.toggle('hidden', type !== 'image');
        
        // Reset form based on type
        if (type === 'image') {
            document.getElementById('graphCode').value = '';
        } else if (type === 'interactive') {
            document.getElementById('imageUpload').value = '';
            document.getElementById('imagePreview').innerHTML = '';
        }
    }

    loadAdminData() {
        this.loadGraphsList();
        this.updateSubcategoryOptions();
    }

    loadGraphsList() {
        const container = document.getElementById('adminGraphsList');
        container.innerHTML = this.app.graphs.map(graph => `
            <div class="admin-graph-item">
                <div class="graph-item-info">
                    <h5>${graph.name}</h5>
                    <div class="graph-item-meta">
                        <span>${graph.subject} • ${graph.subcategory}</span>
                        <span>${graph.type}</span>
                        <span>⭐ ${graph.rating || 'N/A'}</span>
                    </div>
                </div>
                <div class="graph-item-actions">
                    <button class="btn btn-danger" onclick="app.adminManager.deleteGraph('${graph.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateSubcategoryOptions() {
        const subjectSelect = document.getElementById('graphSubject');
        const subcategorySelect = document.getElementById('graphSubcategory');
        
        const subcategories = {
            physics: ['kinematics', 'electricity', 'waves', 'thermodynamics', 'optics', 'modern'],
            chemistry: ['kinetics', 'equilibrium', 'thermochemistry', 'electrochemistry', 'organic', 'analytical'],
            mathematics: ['algebra', 'calculus', 'trigonometry', 'geometry', 'statistics', 'discrete'],
            engineering: ['circuits', 'mechanics', 'thermodynamics', 'materials', 'control']
        };
        
        subjectSelect.addEventListener('change', () => {
            const subject = subjectSelect.value;
            subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
            
            if (subject && subcategories[subject]) {
                subcategories[subject].forEach(subcat => {
                    const option = document.createElement('option');
                    option.value = subcat;
                    option.textContent = subcat.charAt(0).toUpperCase() + subcat.slice(1);
                    subcategorySelect.appendChild(option);
                });
            }
        });
    }

    handleImageUpload(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.app.uiManager.showNotification('Please upload an image file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }

    testGraphCode() {
        const code = document.getElementById('graphCode').value;
        if (!code.trim()) {
            this.app.uiManager.showNotification('Please enter graph code', 'error');
            return;
        }
        
        try {
            const previewContainer = document.getElementById('codePreview');
            previewContainer.innerHTML = '<div class="loading-graph"><i class="fas fa-spinner fa-spin"></i> Testing code...</div>';
            
            const graphFunction = new Function('return ' + code)();
            const result = graphFunction();
            
            if (result instanceof HTMLElement) {
                previewContainer.innerHTML = '';
                previewContainer.appendChild(result);
                this.app.uiManager.showNotification('Code test successful!', 'success');
            } else {
                throw new Error('Function must return an HTML element');
            }
        } catch (error) {
            document.getElementById('codePreview').innerHTML = `
                <div class="graph-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Code test failed: ${error.message}</p>
                </div>
            `;
        }
    }

    saveNewGraph() {
        const form = document.getElementById('addGraphForm');
        const formData = new FormData(form);
        
        const graphType = document.querySelector('.type-btn.active').dataset.type;
        
        const newGraph = {
            id: 'graph-' + Date.now(),
            name: document.getElementById('graphName').value,
            type: graphType,
            category: document.getElementById('graphSubject').value,
            subcategory: document.getElementById('graphSubcategory').value || 'general',
            equation: document.getElementById('graphEquation').value,
            subject: document.getElementById('graphSubject').value.charAt(0).toUpperCase() + 
                     document.getElementById('graphSubject').value.slice(1),
            aliases: document.getElementById('graphAliases').value.split(',').map(a => a.trim()).filter(a => a),
            tags: document.getElementById('graphTags').value.split(',').map(t => t.trim()).filter(t => t),
            description: document.getElementById('graphDescription').value,
            createdAt: new Date().toISOString(),
            popularity: 0,
            rating: 0
        };
        
        if (graphType === 'interactive') {
            newGraph.graphCode = document.getElementById('graphCode').value;
        } else if (graphType === 'image') {
            const imagePreview = document.getElementById('imagePreview').querySelector('img');
            if (imagePreview) {
                newGraph.imageData = imagePreview.src;
            }
        }
        
        this.app.graphs.unshift(newGraph);
        this.app.saveGraphs();
        this.app.filteredGraphs = [...this.app.graphs];
        this.app.renderHomepage();
        this.loadGraphsList();
        
        this.resetAdminForm();
        this.app.uiManager.showNotification('Graph added successfully!', 'success');
    }

    deleteGraph(graphId) {
        if (!confirm('Are you sure you want to delete this graph?')) return;
        
        this.app.graphs = this.app.graphs.filter(graph => graph.id !== graphId);
        this.app.filteredGraphs = this.app.filteredGraphs.filter(graph => graph.id !== graphId);
        this.app.saveGraphs();
        this.app.renderHomepage();
        this.loadGraphsList();
        
        this.app.uiManager.showNotification('Graph deleted successfully!', 'success');
    }

    resetAdminForm() {
        document.getElementById('addGraphForm').reset();
        document.getElementById('codePreview').innerHTML = '';
        document.getElementById('imagePreview').innerHTML = '';
        document.querySelector('.type-btn[data-type="interactive"]').click();
    }

    changePassword() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!newPassword || !confirmPassword) {
            this.app.uiManager.showNotification('Please fill both password fields', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.app.uiManager.showNotification('Passwords do not match', 'error');
            return;
        }
        
        this.app.adminPassword = newPassword;
        this.app.settings.adminPassword = newPassword;
        this.app.saveSettings();
        
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        this.app.uiManager.showNotification('Password changed successfully!', 'success');
    }

    resetSystem() {
        if (!confirm('Are you sure you want to reset all data? This cannot be undone.')) return;
        
        localStorage.clear();
        this.app.loadAllData();
        this.app.renderHomepage();
        this.loadGraphsList();
        
        this.app.uiManager.showNotification('System reset to defaults', 'success');
    }
}

// ===== AD MANAGER =====
class AdManager {
    constructor(app) {
        this.app = app;
    }

    setupEventListeners() {
        // Ad upload buttons
        document.querySelectorAll('.ad-upload-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const zone = btn.dataset.zone;
                document.querySelector(`.ad-upload-input[data-zone="${zone}"]`).click();
            });
        });

        // Ad file inputs
        document.querySelectorAll('.ad-upload-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const zone = e.target.dataset.zone;
                const file = e.target.files[0];
                if (file) {
                    this.uploadAd(zone, file);
                }
            });
        });

        // Ad remove buttons
        document.querySelectorAll('.ad-remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const zone = btn.dataset.zone;
                this.removeAd(zone);
            });
        });
    }

    uploadAd(zone, file) {
        if (!file.type.startsWith('image/')) {
            this.app.uiManager.showNotification('Please upload an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.app.ads[zone] = {
                image: e.target.result,
                url: null, // Can be extended to include click URLs
                active: true
            };
            this.app.saveAds();
            this.renderAds();
            this.app.uiManager.showNotification('Ad uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }

    removeAd(zone) {
        this.app.ads[zone] = {
            image: null,
            url: null,
            active: false
        };
        this.app.saveAds();
        this.renderAds();
        this.app.uiManager.showNotification('Ad removed', 'info');
    }

    renderAds() {
        Object.keys(this.app.ads).forEach(zone => {
            const ad = this.app.ads[zone];
            const preview = document.getElementById(zone + 'Preview');
            const placeholder = document.getElementById(zone);
            
            if (preview) {
                if (ad.image && ad.active) {
                    preview.innerHTML = `<img src="${ad.image}" alt="Advertisement" style="max-width: 100%; max-height: 150px; border-radius: 8px;">`;
                    if (placeholder) {
                        placeholder.innerHTML = `<img src="${ad.image}" alt="Advertisement" style="width: 100%; border-radius: 8px;">`;
                    }
                } else {
                    preview.innerHTML = '';
                    if (placeholder) {
                        placeholder.innerHTML = `
                            <i class="fas fa-ad"></i>
                            <p>Advertisement Space</p>
                            <small>Admin can upload images here</small>
                        `;
                    }
                }
            }
        });
    }
}

// ===== UI MANAGER =====
class UIManager {
    constructor(app) {
        this.app = app;
    }

    setupMobileMenu() {
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const mobileMenu = document.getElementById('mobileMenu');
        const closeMenu = document.getElementById('closeMenu');

        hamburgerMenu.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        closeMenu.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close menu when clicking on a link
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                this.toggleMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        mobileMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    showSearchSuggestions(suggestions) {
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
            div.addEventListener('click', () => {
                this.handleSuggestionClick(suggestion);
            });
            container.appendChild(div);
        });
        
        container.classList.add('show');
    }

    hideSearchSuggestions() {
        document.getElementById('searchSuggestions').classList.remove('show');
    }

    handleSuggestionClick(suggestion) {
        const searchInput = document.getElementById('searchInput');
        
        switch(suggestion.type) {
            case 'correction':
                searchInput.value = suggestion.action;
                this.app.performSearch(suggestion.action);
                break;
            case 'graph':
                this.app.showGraphDetails(suggestion.action);
                break;
            case 'tag':
                this.app.performSearch(suggestion.action.replace('search:', ''));
                break;
        }
        
        this.hideSearchSuggestions();
    }

    showGraphDetailModal(graph) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content graph-detail-modal">
                <div class="modal-header">
                    <h3>${graph.name}</h3>
                    <button class="close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="graph-detail-content">
                        <div class="graph-detail-preview" id="detailGraphPreview">
                            <div class="loading-graph">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p>Loading graph...</p>
                            </div>
                        </div>
                        
                        <div class="graph-detail-info">
                            <div class="graph-detail-main">
                                <div class="graph-equation">${graph.equation}</div>
                                <div class="graph-description">${graph.description}</div>
                                
                                <div class="graph-properties">
                                    <div class="property">
                                        <strong>Subject:</strong> ${graph.subject}
                                    </div>
                                    <div class="property">
                                        <strong>Category:</strong> ${graph.subcategory}
                                    </div>
                                    <div class="property">
                                        <strong>Type:</strong> ${graph.type}
                                    </div>
                                    <div class="property">
                                        <strong>Added:</strong> ${new Date(graph.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="graph-detail-sidebar">
                                <div class="sidebar-section">
                                    <h4>Tags</h4>
                                    <div class="tags-list">
                                        ${graph.tags.map(tag => `<span class="graph-tag">${tag}</span>`).join('')}
                                    </div>
                                </div>
                                
                                <div class="sidebar-section">
                                    <h4>Also Known As</h4>
                                    <p>${graph.aliases.join(', ')}</p>
                                </div>
                                
                                <div class="sidebar-section">
                                    <h4>Popularity</h4>
                                    <div class="popularity-stats">
                                        <div class="stat">
                                            <i class="fas fa-eye"></i>
                                            <span>${graph.popularity || 0} views</span>
                                        </div>
                                        <div class="stat">
                                            <i class="fas fa-star"></i>
                                            <span>${graph.rating || 'N/A'} rating</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Render the graph in the detail view
        const previewContainer = modal.querySelector('#detailGraphPreview');
        this.app.graphRenderer.renderGraph(graph, previewContainer);

        // Close modal events
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            font-weight: 500;
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-triangle',
            'warning': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            'success': 'var(--success-color)',
            'error': 'var(--danger-color)',
            'warning': 'var(--warning-color)',
            'info': 'var(--info-color)'
        };
        return colors[type] || 'var(--info-color)';
    }
}

// ===== INITIALIZATION =====
// Add notification styles to document
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
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .interactive-graph {
        width: 100%;
        height: 100%;
    }
    
    .graph-controls {
        padding: 1rem;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
    }
    
    .control-group {
        margin-bottom: 0.5rem;
    }
    
    .control-group label {
        display: block;
        margin-bottom: 0.25rem;
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .control-group input[type="range"] {
        width: 100%;
    }
    
    .graph-visual {
        padding: 1rem;
        height: calc(100% - 80px);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .graph-stats {
        display: flex;
        gap: 1rem;
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: var(--text-muted);
    }
    
    .graph-stats .stat {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
`;

document.head.appendChild(notificationStyles);

// Initialize the app when DOM is loaded
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new GraphzApp();
    
    // Make app globally available for debugging and external access
    window.app = app;
    
    // Parse URL parameters on load
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    const search = urlParams.get('search');
    
    if (section) {
        app.navigateToSection(section);
    }
    
    if (search) {
        document.getElementById('searchInput').value = search;
        app.performSearch(search);
    }
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

// Export for module usage (future-proofing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GraphzApp, HybridGraphRenderer, SmartSearchEngine };
  }
