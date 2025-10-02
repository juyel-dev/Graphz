// --- Global Data & Initial Setup ---

// Mock Data: Admin Panel লোড না হওয়া পর্যন্ত এটি 'ডাটাবেস' হিসেবে কাজ করবে।
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
        // Note: Plotly requires structured data. We will generate it from equation for simplicity.
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
    //... Add more graphs here
];

const LOGIN_TOKEN_KEY = 'adminLoggedIn';
const ACTIVITY_LOG_KEY = 'adminActivityLog';
const TRACKING_DATA_KEY = 'graphzTracking'; // পার্সোনালাইজেশনের জন্য

// ইনিশিয়াল লোড ফাংশন
document.addEventListener('DOMContentLoaded', () => {
    // ১. ইভেন্ট লিসেনার সেটআপ করা
    setupEventListeners();
    
    // ২. গ্যালারি এবং হোমপেজ সেকশন লোড করা
    renderInitialGraphGallery();
    renderTrendingAndForYou(); 
    
    // ৩. এডমিন প্যানেল লগ রেন্ডার করা (যদি লগইন থাকে)
    if (localStorage.getItem(LOGIN_TOKEN_KEY) === 'true') {
        renderActivityLog();
    }
});

// --- Event Listeners Setup ---

function setupEventListeners() {
    // ন্যাভিগেশন এবং থিম
    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('active');
    });
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // সার্চ এবং ফিল্টারিং
    document.getElementById('searchBtn').addEventListener('click', handleSmartSearch);
    document.getElementById('searchInput').addEventListener('input', handleSmartSearch);
    
    // ক্যাটাগরি ফিল্টার বাটন লিসেনার
    document.querySelectorAll('.category-filters .filter-btn').forEach(button => {
        button.addEventListener('click', handleCategoryFilter);
    });
    // ক্লাস ফিল্টার ড্রপডাউন লিসেনার
    document.getElementById('classFilter').addEventListener('change', handleFilterChange);
    // ট্রেন্ডিং ট্যাগস লিসেনার (নতুন)
    document.getElementById('trendingTags').addEventListener('click', handleTagFilter);


    // অ্যাডমিন প্যানেল লজিক
    document.getElementById('loginForm').addEventListener('submit', handleAdminLogin);
    document.getElementById('adminLink').addEventListener('click', checkAdminAccess);
    document.getElementById('adminClose').addEventListener('click', () => {
        document.getElementById('adminPanel').style.display = 'none';
    });
    document.getElementById('loginClose').addEventListener('click', () => {
        document.getElementById('loginModal').style.display = 'none';
    });
    
    // অ্যাডমিন প্যানেল ফর্ম সাবমিট
    document.getElementById('addGraphForm').addEventListener('submit', handleAddGraph);
    
    // অ্যাডমিন প্যানেল ট্যাব সুইচিং
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', handleAdminTabSwitch);
    });

    // মডাল বন্ধ করার লিসেনার
    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('graphModal').style.display = 'none';
    });
}

// --- Theme Toggle ---
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    // লোকাল স্টোরেজে থিম সেভ করা...
}

// --- Admin Panel Access Logic (Client-Side Mock) ---
function handleAdminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email === 'admin@graphz.com' && password === 'adminpass') { 
        localStorage.setItem(LOGIN_TOKEN_KEY, 'true'); 
        alert('Login Successful! Welcome, Admin.');
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex'; 
        renderActivityLog(); // লগইন হলে লগ রেন্ডার করা
    } else {
        alert('Login Failed. Check your email and password.');
    }
}

function checkAdminAccess(event) {
    event.preventDefault();
    if (localStorage.getItem(LOGIN_TOKEN_KEY) === 'true') {
        document.getElementById('adminPanel').style.display = 'flex';
        renderActivityLog(); // প্রতিবার খোলার সময় লগ আপডেট করা
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
    
    // অ্যাক্টিভিটি লগ ট্যাবে গেলে লগ রেন্ডার করা
    if (targetTab === 'activityLog') {
        renderActivityLog();
    }
}
// --- Smart Search & Double Filtering ---

function handleSmartSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    // স্মার্ট সার্চ লজিক (যদি সার্চ টার্ম থাকে)
    let searchResults = allGraphs;
    if (searchTerm.length > 0) {
        searchResults = allGraphs.filter(graph => {
            const titleMatch = graph.title.toLowerCase().includes(searchTerm);
            const summaryMatch = graph.quickSummary.toLowerCase().includes(searchTerm);
            
            // নতুন: ALIASES দিয়ে সার্চ
            const aliasMatch = graph.aliases.some(alias => 
                alias.toLowerCase().includes(searchTerm)
            );
            
            // নতুন: TAGS দিয়ে সার্চ
            const tagsMatch = graph.tags.some(tag =>
                tag.toLowerCase().includes(searchTerm)
            );

            return titleMatch || summaryMatch || aliasMatch || tagsMatch;
        });
    }

    // সার্চ রেজাল্টকে বর্তমান ফিল্টার অনুযায়ী ফাইনাল ফিল্টারিংয়ের জন্য পাঠানো
    applyFinalFilters(searchResults);
}

function handleCategoryFilter(event) {
    // অ্যাক্টিভ ক্যাটাগরি বাটন আপডেট করা
    document.querySelectorAll('.category-filters .filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // ফিল্টারিং শুরু করা
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
    // সার্চ টার্ম থাকলে, সার্চ ফাংশন দ্বারা ফিল্টার করা
    if (document.getElementById('searchInput').value.trim().length > 0) {
        handleSmartSearch();
        return;
    }
    
    // যদি সার্চ টার্ম না থাকে, শুধুমাত্র ফিল্টারিং দ্বারা গ্রাফ দেখানো
    applyFinalFilters(allGraphs);
}

// ফাইনাল ফিল্টারিং লজিক (Category AND Class)
function applyFinalFilters(graphsToFilter) {
    const activeCategoryBtn = document.querySelector('.category-filters .filter-btn.active');
    const categoryFilter = activeCategoryBtn ? activeCategoryBtn.dataset.filter : 'all';
    const classFilter = document.getElementById('classFilter').value;
    
    let finalFilteredGraphs = graphsToFilter.filter(graph => {
        // ক্যাটাগরি ফিল্টার
        let matchesCategory = (categoryFilter === 'all' || graph.category === categoryFilter);
        
        // জনপ্রিয়/সাম্প্রতিক গ্রাফ লজিক
        if (categoryFilter === 'popular') {
            // আপাতত ভিউ কাউন্ট অনুযায়ী সাজানো
            graphsToFilter.sort((a, b) => (getGraphTrackingData(b.id) || 0) - (getGraphTrackingData(a.id) || 0));
        } else if (categoryFilter === 'recent') {
            // আইডি বা ডেট অনুযায়ী সাজানো
            graphsToFilter.sort((a, b) => b.id.localeCompare(a.id)); 
        }

        // ডাবল ফিল্টারিং: ক্লাস ফিল্টার
        const matchesClass = (classFilter === 'all' || graph.class === classFilter);
        
        return matchesCategory && matchesClass;
    });

    renderGraphGallery(finalFilteredGraphs);
}
// --- Graph Rendering & Modal Logic ---

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

    // নতুন: ট্র্যাকিং
    trackGraphView(graphId);
    renderTrendingAndForYou(); // ভিউ হওয়ার পর হোমপেজ আপডেট করা
    
    // মডালের তথ্য আপডেট
    document.getElementById('modalGraphTitle').textContent = graph.title;
    document.getElementById('modalGraphDescription').textContent = graph.description;
    
    // ইন্টারেক্টিভ গ্রাফ রেন্ডার করা
    renderInteractiveGraph('liveGraphCanvas', graph);
    
    // প্যারামিটার কন্ট্রোল লোড করা
    renderParameterControls('graphParameters', graph);
    
    // রিলেটেড গ্রাফ লোড করা
    renderRelatedGraphs(graph.relatedIds);
    
    document.getElementById('graphModal').style.display = 'flex';
}

// --- Interactive Graph & Plotly Logic ---
// Note: Plotly.js must be linked in index.html for this to work.
function renderInteractiveGraph(elementId, graph) {
    const container = document.getElementById(elementId);
    if (!window.Plotly) {
         container.innerHTML = `<img src="${graph.staticImage}" alt="${graph.title}" class="graph-image-fallback">
         <p style="color:red;">Plotly.js library not loaded. Interactive view disabled.</p>`;
         return;
    }

    // গ্রাফ তৈরি করার ফাংশন 
    function plotOhmLaw(R_value) {
        const V_data = [0, 5, 10, 15, 20];
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

        Plotly.newPlot(elementId, data, layout);
    }
    
    if (graph.id === 'G001') {
        // ওহমের সূত্রের জন্য ডিফল্ট ভ্যালু দিয়ে গ্রাফ প্লট করা
        plotOhmLaw(10); 
    } else if (graph.id === 'G002') {
        // অন্য গ্রাফের লজিক...
    } else {
        // ইন্টারেক্টিভ ডেটা না থাকলে স্ট্যাটিক ইমেজ দেখাও
        container.innerHTML = `<img src="${graph.staticImage}" alt="${graph.title}" class="graph-image-fallback">`;
    }
}

function renderParameterControls(elementId, graph) {
    const controls = document.getElementById(elementId);
    controls.innerHTML = '';
    
    if (graph.id === 'G001') {
        controls.innerHTML = `
            <div class="control-group">
                <label for="resistorValue">Resistance (R):</label>
                <input type="range" id="resistorValue" min="1" max="20" value="10" step="1">
                <span id="currentRValue">10 Ω</span>
            </div>
        `;
        
        const resistorInput = document.getElementById('resistorValue');
        const currentRValue = document.getElementById('currentRValue');
        
        // ইউজার ইনপুট অনুযায়ী গ্রাফ আপডেট
        resistorInput.addEventListener('input', (e) => {
            const R_value = parseFloat(e.target.value);
            currentRValue.textContent = `${R_value} Ω`;
            renderInteractiveGraph('liveGraphCanvas', {...graph, R_value: R_value}); // Plotly আপডেট
        });
    }
}

function renderRelatedGraphs(relatedIds) {
    const relatedList = document.getElementById('relatedGraphsList');
    relatedList.innerHTML = '';

    if (!relatedIds || relatedIds.length === 0) {
        relatedList.innerHTML = '<p>No related graphs found yet.</p>';
        return;
    }

    relatedIds.forEach(id => {
        const relatedGraph = allGraphs.find(g => g.id === id);
        if (relatedGraph) {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = relatedGraph.title;
            link.className = 'related-graph-link';
            link.onclick = (e) => {
                e.preventDefault();
                openGraphModal(id);
            };
            relatedList.appendChild(link);
        }
    });
}


// --- Personalization & Algorithm Logic ---

// ট্র্যাকিং ডেটা লোকাল স্টোরেজ থেকে নেওয়া
function getGraphTrackingData(graphId) {
    const trackingData = JSON.parse(localStorage.getItem(TRACKING_DATA_KEY)) || {};
    return trackingData[graphId] || 0;
}

// গ্রাফ ভিউ ট্র্যাক করা
function trackGraphView(graphId) {
    let trackingData = JSON.parse(localStorage.getItem(TRACKING_DATA_KEY)) || {};
    trackingData[graphId] = (trackingData[graphId] || 0) + 1;
    localStorage.setItem(TRACKING_DATA_KEY, JSON.stringify(trackingData));
}

function getTrendingGraphs(count = 6) {
    // গ্রাফগুলোকে ভিউ কাউন্ট অনুযায়ী সাজানো
    const rankedGraphs = allGraphs
        .map(graph => ({
            ...graph,
            viewCount: getGraphTrackingData(graph.id) // ভিউ কাউন্ট যোগ করা
        }))
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
    
    // ট্রেন্ডিং গ্রাফগুলির জন্য কার্ড তৈরি
    trendingGraphs.forEach(graph => {
        const card = document.createElement('div');
        card.className = 'trending-card';
        card.innerHTML = `<img src="${graph.staticImage}" alt="${graph.title}"><h4>${graph.title}</h4>`;
        card.addEventListener('click', () => openGraphModal(graph.id));
        container.appendChild(card);
    });
}

// --- Admin Panel Data Management ---

function handleAddGraph(event) {
    event.preventDefault();

    if (localStorage.getItem(LOGIN_TOKEN_KEY) !== 'true') {
        alert('Access Denied. Please log in first.');
        return;
    }

    const form = event.target;
    
    // ফাইল আপলোড হ্যান্ডলিং (এটি সার্ভার-সাইড টাস্ক, এখানে ডামি লিঙ্ক ব্যবহার করা হয়েছে)
    const staticImageFile = form.graphImage.files[0];
    const dataFile = form.graphDataFile.files[0];
    
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
        source: form.graphSource ? form.graphSource.value : 'Admin Panel', 
        staticImage: staticImageFile ? `images/${staticImageFile.name}` : 'images/default.png', // ডামি লিঙ্ক
        dataFile: dataFile ? `data/${dataFile.name}` : null,
        relatedIds: []
    };
    
    // বাস্তবে: এই ডেটা সার্ভারের API এন্ডপয়েন্টে পাঠানো হবে।
    allGraphs.push(newGraphData); // ক্লায়েন্ট-সাইড আপডেট (অস্থায়ী)
    
    // অ্যাক্টিভিটি লগ
    logAdminActivity(`Added new graph: ${newGraphData.title}`);
    
    alert(`New Graph Added: ${newGraphData.title}. (Saved locally for this session.)`);
    form.reset();
    
    // গ্যালারি এবং হোমপেজ আপডেট করা
    renderInitialGraphGallery();
    renderTrendingAndForYou();
}

// --- Activity Log Management ---

// যেকোনো অ্যাডমিন অ্যাকশন লগ করার জন্য ফাংশন
function logAdminActivity(action) {
    const timestamp = new Date().toLocaleString('en-US', { hour12: false });
    const newLog = `${timestamp}: ${action}`;
    
    let logs = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY)) || [];
    logs.unshift(newLog);
    
    if (logs.length > 100) {
        logs = logs.slice(0, 100); 
    }
    
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs));
    renderActivityLog();
}

// অ্যাক্টিভিটি লগ ট্যাবে ডেটা রেন্ডার করার ফাংশন
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
