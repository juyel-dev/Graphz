// ====================================================================
// A. GLOBAL DATA, CONSTANTS & INITIALIZATION
// ====================================================================

// --- MOCK DATABASE ---
const allGraphs = [
    {
        id: 'G001',
        title: "Ohm's Law V-I Graph",
        aliases: ['V-I Graph', 'রোধের সূত্র', 'ওহম এর সূত্র', 'Ohms Law'],
        tags: ['Voltage', 'Current', 'Resistance', 'Physics', 'Class12', 'Linear', 'DC'],
        category: 'physics',
        class: 'class12',
        quickSummary: 'A simple linear relationship between voltage and current in a resistive circuit.',
        description: 'According to Ohm’s law, current flowing through a conductor is directly proportional to the potential difference applied across its ends, provided temperature remains constant. The V-I graph is a straight line.',
        equation: 'V=IR',
        staticImage: 'images/ohm_law.png',
        relatedIds: ['G002', 'G003']
    },
    {
        id: 'G002',
        title: "Velocity-Time Graph (Constant Acceleration)",
        aliases: ['v-t graph', 'ত্বরণের গ্রাফ', 'সমত্বরণ', 'Motion'],
        tags: ['Kinematics', 'Acceleration', 'Motion', 'Physics', 'Class11', 'Slope', 'Calculus'],
        category: 'physics',
        class: 'class11',
        quickSummary: 'The slope of this graph gives acceleration, and the area gives displacement.',
        description: 'For constant acceleration, the velocity-time graph is a straight line with a non-zero slope.',
        equation: 'v = u + at',
        staticImage: 'images/v_t_accel.png',
        relatedIds: ['G001', 'G004']
    },
    {
        id: 'G003',
        title: "pH Titration Curve (Strong Acid vs Strong Base)",
        aliases: ['পিএইচ টাইট্রেশন', 'অম্ল-ক্ষার টাইট্রেশন', 'Neutralization'],
        tags: ['Chemistry', 'Titration', 'Acid-Base', 'pH', 'Class12', 'Equilibrium'],
        category: 'chemistry',
        class: 'class12',
        quickSummary: 'Shows the rapid change in pH near the equivalence point during the titration process.',
        description: 'Titration of a strong acid with a strong base results in a sharp vertical drop around the equivalence point (pH 7).',
        equation: 'pH = -log[H+]',
        staticImage: 'images/ph_titration.png',
        relatedIds: ['G001']
    }
];

// --- MOCK QUIZ DATA ---
const allQuizzes = [
    {
        id: 'QZ001', topic: "Ohm's Law", question: "Which physical quantity is represented by the slope of a V-I graph?",
        options: ["Voltage", "Current", "Resistance", "Power"], answerIndex: 2, tags: ['Physics', 'Class12'], type: 'quiz'
    },
    {
        id: 'QZ002', topic: "Kinematics", question: "In uniform acceleration, what does the area under the V-T graph represent?",
        options: ["Acceleration", "Velocity", "Displacement", "Time"], answerIndex: 2, tags: ['Physics', 'Class11'], type: 'quiz'
    }
];

// --- GLOBAL VARIABLES & KEYS ---
const LOGIN_TOKEN_KEY = 'adminLoggedIn';
const ACTIVITY_LOG_KEY = 'adminActivityLog';
const TRACKING_DATA_KEY = 'graphzTracking'; 
const PROGRESS_KEY = 'userProgress';
let currentQuizIndex = 0; // কুইজ সেশন ট্র্যাক করার জন্য

// ইনিশিয়াল লোড ফাংশন
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderInitialGraphGallery();
    renderTrendingAndForYou(); 
    renderQuizSection(); // কুইজ লোড করা
    if (localStorage.getItem(LOGIN_TOKEN_KEY) === 'true') {
        renderActivityLog();
    }
});
// ====================================================================
// B. EVENT LISTENERS & UI LOGIC
// ====================================================================

function setupEventListeners() {
    // UI Interactions
    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('active');
    });
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Search and Filtering
    document.getElementById('searchBtn').addEventListener('click', handleSmartSearch);
    document.getElementById('searchInput').addEventListener('input', handleSmartSearch);
    document.querySelectorAll('.category-filters .filter-btn').forEach(button => {
        button.addEventListener('click', handleCategoryFilter);
    });
    document.getElementById('classFilter').addEventListener('change', handleFilterChange);
    document.getElementById('trendingTags').addEventListener('click', handleTagFilter);

    // Admin Panel Access & Modals
    document.getElementById('loginForm').addEventListener('submit', handleAdminLogin);
    document.getElementById('adminLink').addEventListener('click', checkAdminAccess);
    document.getElementById('adminClose').addEventListener('click', () => {
        document.getElementById('adminPanel').style.display = 'none';
    });
    document.getElementById('loginClose').addEventListener('click', () => {
        document.getElementById('loginModal').style.display = 'none';
    });
    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('graphModal').style.display = 'none';
    });

    // Admin Panel Forms
    document.getElementById('addGraphForm').addEventListener('submit', handleAddGraph);
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', handleAdminTabSwitch);
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    // Future: Save theme preference to localStorage
}
// ====================================================================
// C. SMART SEARCH AND FILTERING LOGIC
// ====================================================================

function renderInitialGraphGallery() {
    renderGraphGallery(allGraphs);
}

function handleSmartSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    let searchResults = allGraphs;
    if (searchTerm.length > 0) {
        searchResults = allGraphs.filter(graph => {
            const titleMatch = graph.title.toLowerCase().includes(searchTerm);
            const summaryMatch = graph.quickSummary.toLowerCase().includes(searchTerm);
            
            // 💡 Future-Ready: Alias, Tags এবং Equation দিয়ে সার্চ করা
            const aliasMatch = graph.aliases.some(alias => alias.toLowerCase().includes(searchTerm));
            const tagsMatch = graph.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            const equationMatch = graph.equation.toLowerCase().includes(searchTerm.replace(/\s/g, ''));

            return titleMatch || summaryMatch || aliasMatch || tagsMatch || equationMatch;
        });
    }

    applyFinalFilters(searchResults);
}

function handleCategoryFilter(event) {
    document.querySelectorAll('.category-filters .filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    handleFilterChange();
}

function handleTagFilter(event) {
    if (event.target.classList.contains('btn-tag')) {
        const tag = event.target.dataset.tag;
        document.getElementById('searchInput').value = tag;
        handleSmartSearch();
    }
}

function handleFilterChange() {
    // যদি সার্চ বারে কিছু লেখা থাকে, তাহলে সার্চ ফাংশন দ্বারা ফিল্টার করা
    if (document.getElementById('searchInput').value.trim().length > 0) {
        handleSmartSearch();
        return;
    }
    
    // অন্যথায়, সমস্ত গ্রাফকে ফিল্টার করা
    applyFinalFilters(allGraphs);
}

function applyFinalFilters(graphsToFilter) {
    const activeCategoryBtn = document.querySelector('.category-filters .filter-btn.active');
    const categoryFilter = activeCategoryBtn ? activeCategoryBtn.dataset.filter : 'all';
    const classFilter = document.getElementById('classFilter').value;
    
    let finalFilteredGraphs = graphsToFilter.filter(graph => {
        let matchesCategory = (categoryFilter === 'all' || graph.category === categoryFilter);

        // Sorting for 'Popular' and 'Recent'
        if (categoryFilter === 'popular') {
            graphsToFilter.sort((a, b) => (getGraphTrackingData(b.id) || 0) - (getGraphTrackingData(a.id) || 0));
        } else if (categoryFilter === 'recent') {
            graphsToFilter.sort((a, b) => b.id.localeCompare(a.id)); 
        }

        const matchesClass = (classFilter === 'all' || graph.class === classFilter);
        
        return matchesCategory && matchesClass;
    });

    renderGraphGallery(finalFilteredGraphs);
      }
// ====================================================================
// D. GRAPH RENDERING, INTERACTIVE & PERSONALIZATION LOGIC
// ====================================================================

function renderGraphGallery(graphs) {
    const gallery = document.getElementById('graphGallery');
    gallery.innerHTML = '';
    
    if (graphs.length === 0) {
        document.getElementById('graphNotFound').style.display = 'block';
        return;
    }
    document.getElementById('graphNotFound').style.display = 'none';

    graphs.forEach(graph => {
        const graphCard = document.createElement('div');
        graphCard.className = 'graph-card';
        graphCard.innerHTML = `
            <img src="${graph.staticImage}" alt="${graph.title}">
            <div class="card-body">
                <h4>${graph.title}</h4>
                <p class="quick-summary">${graph.quickSummary}</p>
                <div class="card-tags">
                   <span class="tag ${graph.category}">${graph.category.toUpperCase()}</span>
                   <span class="tag ${graph.class}">${graph.class.toUpperCase()}</span>
                </div>
            </div>
        `;
        graphCard.addEventListener('click', () => openGraphModal(graph.id));
        gallery.appendChild(graphCard);
    });
}

function openGraphModal(graphId) {
    const graph = allGraphs.find(g => g.id === graphId);
    if (!graph) return;

    trackGraphView(graphId);
    renderTrendingAndForYou();
    
    document.getElementById('modalGraphTitle').textContent = graph.title;
    document.getElementById('modalGraphDescription').textContent = graph.description;
    
    renderInteractiveGraph('liveGraphCanvas', graph);
    renderParameterControls('graphParameters', graph);
    renderRelatedGraphs(graph.relatedIds);
    
    document.getElementById('graphModal').style.display = 'flex';
}

// --- Interactive Graph Core Logic (Future-Ready for more equations) ---
function renderInteractiveGraph(elementId, graph) {
    const container = document.getElementById(elementId);
    if (!window.Plotly) {
         container.innerHTML = `<img src="${graph.staticImage}" alt="${graph.title}" class="graph-image-fallback">
         <p style="color:red; text-align:center;">Plotly.js library not loaded. Interactive view disabled.</p>`;
         return;
    }

    // Default Plotting Function (for V=IR)
    function plotOhmLaw(R_value) {
        const V_data = Array.from({length: 11}, (_, i) => i * 2); // 0 to 20V
        const I_data = V_data.map(V => V / R_value);
        
        const data = [{
            x: I_data,
            y: V_data,
            mode: 'lines+markers',
            name: `V vs I (R=${R_value}Ω)`
        }];

        const layout = {
            title: `Ohm's Law: V = I * ${R_value}Ω`,
            xaxis: { title: 'Current (I)' },
            yaxis: { title: 'Voltage (V)' }
        };

        Plotly.newPlot(elementId, data, layout, {responsive: true});
    }
    
    // Call the correct plot based on the equation/ID
    if (graph.id === 'G001') {
        const R = graph.R_value || 10; // Use parameter control value or default
        plotOhmLaw(R); 
    } else {
         container.innerHTML = `<p style="text-align:center;">Interactive plot not available for this graph yet. Static view shown.</p>`;
    }
}

function renderParameterControls(elementId, graph) {
    const controls = document.getElementById(elementId);
    controls.innerHTML = '';
    
    if (graph.id === 'G001') {
        controls.innerHTML = `
            <div class="control-group">
                <label for="resistorValue">Resistance (R):</label>
                <input type="range" id="resistorValue" min="1" max="50" value="10" step="1">
                <span id="currentRValue">10 Ω</span>
            </div>
        `;
        
        const resistorInput = document.getElementById('resistorValue');
        const currentRValue = document.getElementById('currentRValue');
        
        resistorInput.addEventListener('input', (e) => {
            const R_value = parseFloat(e.target.value);
            currentRValue.textContent = `${R_value} Ω`;
            // গ্রাফ রেন্ডার ফাংশনকে প্যারামিটার সহ কল করা
            renderInteractiveGraph('liveGraphCanvas', {...graph, R_value: R_value}); 
        });
    }
}

// --- Personalization Tracking ---
function getGraphTrackingData(graphId) {
    const trackingData = JSON.parse(localStorage.getItem(TRACKING_DATA_KEY)) || {};
    return trackingData[graphId] || 0;
}

function trackGraphView(graphId) {
    let trackingData = JSON.parse(localStorage.getItem(TRACKING_DATA_KEY)) || {};
    trackingData[graphId] = (trackingData[graphId] || 0) + 1;
    localStorage.setItem(TRACKING_DATA_KEY, JSON.stringify(trackingData));
}

function getTrendingGraphs(count = 6) {
    // viewCount অনুযায়ী গ্রাফগুলোকে সাজানো
    const rankedGraphs = allGraphs
        .map(graph => ({ ...graph, viewCount: getGraphTrackingData(graph.id) }))
        .sort((a, b) => b.viewCount - a.viewCount);

    return rankedGraphs.slice(0, count);
}

function renderTrendingAndForYou() {
    const trendingGraphs = getTrendingGraphs(6);
    const container = document.getElementById('trendingGraphs');
    container.innerHTML = '';
    
    if (trendingGraphs.length === 0) {
        container.innerHTML = '<p>Start viewing graphs to see what\'s trending!</p>';
        return;
    }
    
    trendingGraphs.forEach(graph => {
        const card = document.createElement('div');
        card.className = 'trending-card';
        card.innerHTML = `<img src="${graph.staticImage}" alt="${graph.title}"><h4>${graph.title}</h4>`;
        card.addEventListener('click', () => openGraphModal(graph.id));
        container.appendChild(card);
    });
      }
// ====================================================================
// E. QUIZ & POLLS LOGIC
// ====================================================================

function renderQuizSection() {
    const quizSection = document.getElementById('quiz');
    if (!quizSection) return;

    // Daily Quiz হিসেবে প্রথম কুইজটি দেখানো
    const currentItem = allQuizzes[currentQuizIndex]; 

    if (!currentItem) {
        quizSection.innerHTML = '<h2 class="section-title">Quiz & Polls</h2><p>No new challenge available today. Check back tomorrow!</p>';
        return;
    }
    
    // শুধু কুইজ রেন্ডার করা (পোলসের লজিক পরে সহজে যুক্ত করা যাবে)
    if (currentItem.type === 'quiz') {
        renderQuiz(quizSection, currentItem);
    } else {
        quizSection.innerHTML = `<h2 class="section-title">Daily Poll: ${currentItem.topic}</h2><p>Poll rendering logic coming soon!</p>`;
    }
}

function renderQuiz(container, quiz) {
    let optionsHtml = quiz.options.map((option, index) => `
        <div class="quiz-option">
            <input type="radio" id="option-${quiz.id}-${index}" name="quiz-answer" value="${index}">
            <label for="option-${quiz.id}-${index}">${option}</label>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="container quiz-card">
            <h2 class="section-title">Daily Quiz: ${quiz.topic}</h2>
            <p class="quiz-question">${quiz.question}</p>
            <form id="quizForm">
                ${optionsHtml}
                <button type="submit" class="btn btn-primary check-btn" data-quiz-id="${quiz.id}">Submit Answer</button>
            </form>
            <div id="quizFeedback" class="feedback-area"></div>
        </div>
    `;
    
    document.getElementById('quizForm').addEventListener('submit', handleQuizSubmit);
}

function handleQuizSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const selected = form.querySelector('input[name="quiz-answer"]:checked');
    const feedbackArea = document.getElementById('quizFeedback');
    const submitBtn = form.querySelector('.check-btn');

    if (!selected) {
        feedbackArea.innerHTML = '<p class="error-msg">Please select an answer.</p>';
        return;
    }

    const userAnswerIndex = parseInt(selected.value);
    const quizId = submitBtn.dataset.quizId;
    const currentQuiz = allQuizzes.find(q => q.id === quizId);

    if (!currentQuiz) return;

    if (userAnswerIndex === currentQuiz.answerIndex) {
        feedbackArea.innerHTML = `<p class="success-msg"><i class="fas fa-check-circle"></i> Correct! Excellent job!</p>`;
        trackUserProgress(currentQuiz.id, 'quiz', 'correct');
    } else {
        const correctAnswer = currentQuiz.options[currentQuiz.answerIndex];
        feedbackArea.innerHTML = `<p class="error-msg"><i class="fas fa-times-circle"></i> Incorrect. The correct answer is: <strong>${correctAnswer}</strong>.</p>`;
        trackUserProgress(currentQuiz.id, 'quiz', 'incorrect');
    }
    
    form.querySelectorAll('input, button').forEach(el => el.disabled = true);
    
    const nextButton = document.createElement('button');
    nextButton.className = 'btn btn-secondary next-btn';
    nextButton.textContent = 'Next Challenge →';
    nextButton.addEventListener('click', () => {
        currentQuizIndex = (currentQuizIndex + 1) % allQuizzes.length;
        renderQuizSection();
    });
    feedbackArea.appendChild(nextButton);
}

// --- User Progress Tracking ---
function trackUserProgress(itemId, type, result) {
    let progress = JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
    
    if (!progress[itemId]) {
        progress[itemId] = { type: type, attempts: 0, correct: 0 };
    }

    progress[itemId].attempts += 1;
    if (result === 'correct') {
        progress[itemId].correct += 1;
    }
    
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
          }
// ====================================================================
// F. ADMIN PANEL LOGIC & SECURITY (Client-Side Mock)
// ====================================================================

function handleAdminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // 💡 Future-Ready: Real authentication needs a secure backend API call
    if (email === 'admin@graphz.com' && password === 'adminpass') { 
        localStorage.setItem(LOGIN_TOKEN_KEY, 'true'); 
        alert('Login Successful! Welcome, Admin.');
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex'; 
        logAdminActivity(`Admin logged in.`);
        renderActivityLog();
    } else {
        alert('Login Failed. Check your email and password.');
    }
}

function checkAdminAccess(event) {
    event.preventDefault();
    if (localStorage.getItem(LOGIN_TOKEN_KEY) === 'true') {
        document.getElementById('adminPanel').style.display = 'flex';
        renderActivityLog();
    } else {
        document.getElementById('loginModal').style.display = 'flex';
    }
}

function handleAdminTabSwitch(event) {
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.admin-section').forEach(section => section.style.display = 'none');
    const targetTab = event.target.dataset.tab;
    const targetSection = document.getElementById(targetTab);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    if (targetTab === 'activityLog') {
        renderActivityLog();
    }
}

function handleAddGraph(event) {
    event.preventDefault();

    if (localStorage.getItem(LOGIN_TOKEN_KEY) !== 'true') return;

    const form = event.target;
    
    const newGraphData = {
        id: 'G' + Date.now(),
        title: form.graphTitle.value,
        aliases: form.graphAliases.value.split(',').map(s => s.trim()).filter(s => s.length > 0),
        tags: form.graphTags.value.split(',').map(s => s.trim()).filter(s => s.length > 0), 
        category: form.graphCategory.value,
        class: form.graphClass.value,
        quickSummary: form.graphQuickSummary.value,
        description: form.graphDescription.value,
        equation: form.graphEquation.value,
        staticImage: 'images/placeholder.png', // Mock URL
        dataFile: null,
        relatedIds: []
    };
    
    // 💡 Future-Ready: Data should be sent to a server API here.
    allGraphs.push(newGraphData); 
    
    logAdminActivity(`Added new graph: ${newGraphData.title}`);
    
    alert(`New Graph Added: ${newGraphData.title}. (Saved locally for this session.)`);
    form.reset();
    
    renderInitialGraphGallery();
    renderTrendingAndForYou();
}

// --- Activity Log Management ---
function logAdminActivity(action) {
    const timestamp = new Date().toLocaleString('en-US', { hour12: false });
    const newLog = `${timestamp}: ${action}`;
    
    let logs = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY)) || [];
    logs.unshift(newLog);
    
    if (logs.length > 100) { logs = logs.slice(0, 100); }
    
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs));
    renderActivityLog();
}

function renderActivityLog() {
    const logList = document.getElementById('adminActivityList');
    if (!logList) return;

    const logs = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY)) || [];
    logList.innerHTML = '';

    logs.forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        logList.appendChild(li);
    });
}
      
