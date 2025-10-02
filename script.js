// --- Global Data & Initial Setup ---

// এই অ্যারেটি Admin Panel থেকে লোড হবে। এটি আমাদের 'ডাটাবেস' হিসেবে কাজ করছে।
const allGraphs = [
    {
        id: 'G001',
        title: "Ohm's Law V-I Graph",
        aliases: ['V-I Graph', 'রোধের সূত্র', 'ওহম এর সূত্র'], // নতুন: স্মার্ট সার্চের জন্য
        tags: ['Voltage', 'Current', 'Resistance', 'Physics', 'Class12', 'Linear'], // নতুন: ট্যাগিং ও রিলেটেড গ্রাফের জন্য
        category: 'physics',
        class: 'class12',
        quickSummary: 'A simple linear relationship between voltage and current in a resistive circuit.',
        description: 'According to Ohm’s law, current flowing through a conductor is directly proportional to the potential difference applied across its ends, provided temperature remains constant. The V-I graph is a straight line.',
        equation: 'V=IR', // নতুন: ইন্টারেক্টিভ গ্রাফের জন্য
        staticImage: 'images/ohm_law.png',
        dataPoints: [{R: 10, V: [0, 10, 20], I: [0, 1, 2]}], // নতুন: ইন্টারেক্টিভ ডেটা
        relatedIds: ['G002', 'G003'] // নতুন: সম্পর্কিত গ্রাফ
    },
    {
        id: 'G002',
        title: "Velocity-Time Graph (Constant Acceleration)",
        aliases: ['v-t graph', 'ত্বরণের গ্রাফ', 'সমত্বরণ'],
        tags: ['Kinematics', 'Acceleration', 'Motion', 'Physics', 'Class11'],
        category: 'physics',
        class: 'class11',
        quickSummary: 'The slope of this graph gives acceleration, and the area gives displacement.',
        description: 'For constant acceleration, the velocity-time graph is a straight line with a non-zero slope.',
        equation: 'v = u + at',
        staticImage: 'images/v_t_accel.png',
        dataPoints: [{u: 5, a: 2, t: [0, 2, 4, 6]}],
        relatedIds: ['G001', 'G004']
    },
    {
        id: 'G003',
        title: "pH Titration Curve (Strong Acid vs Strong Base)",
        aliases: ['পিএইচ টাইট্রেশন', 'অম্ল-ক্ষার টাইট্রেশন'],
        tags: ['Chemistry', 'Titration', 'Acid-Base', 'pH', 'Class12', 'Equilibrium'],
        category: 'chemistry',
        class: 'class12',
        quickSummary: 'Shows the rapid change in pH near the equivalence point during the titration process.',
        description: 'Titration of a strong acid with a strong base results in a sharp vertical drop around the equivalence point (pH 7).',
        equation: 'pH = -log[H+]',
        staticImage: 'images/ph_titration.png',
        dataPoints: [{start_pH: 1, end_pH: 13}],
        relatedIds: ['G001']
    }
    //... আরও গ্রাফ যুক্ত হবে
];

// ইনিশিয়াল লোড ফাংশন
document.addEventListener('DOMContentLoaded', () => {
    // ফাংশন কলগুলো এখানে বসবে
    setupEventListeners();
    renderInitialGraphGallery();
    renderTrendingAndForYou(); // নতুন অ্যালগরিদম লোড করা
});

// সমস্ত ইভেন্ট লিসেনার সেটআপ করা
function setupEventListeners() {
    // সার্চ এবং ফিল্টারিং লিসেনার এখানে সেটআপ হবে
    document.getElementById('searchBtn').addEventListener('click', handleSmartSearch);
    document.getElementById('searchInput').addEventListener('input', handleSmartSearch);
    // গ্যালারির ফিল্টার বাটন লিসেনার
    document.querySelectorAll('.category-filters .filter-btn').forEach(button => {
        button.addEventListener('click', handleFilterChange);
    });
    // নতুন ক্লাস ফিল্টার লিসেনার
    document.getElementById('classFilter').addEventListener('change', handleFilterChange);
    // এডমিন প্যানেল লজিক এখানে যুক্ত হবে
    // ...
}

// গ্যালারি রেন্ডার ফাংশন
function renderInitialGraphGallery() {
    // সমস্ত গ্রাফ দিয়ে গ্যালারি রেন্ডার করা হবে
    renderGraphGallery(allGraphs);
}

// ... অন্যান্য ফাংশনগুলো নিচে সংজ্ঞায়িত হবে
// --- Smart Search & Filtering ---

function handleSmartSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm.length === 0) {
        // যদি সার্চ বার খালি থাকে, তাহলে বর্তমান ফিল্টার অনুযায়ী সব গ্রাফ দেখাও
        handleFilterChange(); 
        return;
    }

    const searchResults = allGraphs.filter(graph => {
        // ১. টাইটেল বা দ্রুত সারাংশ (Quick Summary) দিয়ে সার্চ
        const titleMatch = graph.title.toLowerCase().includes(searchTerm);
        const summaryMatch = graph.quickSummary.toLowerCase().includes(searchTerm);

        // ২. নতুন: ALIASES (অন্যান্য নাম) দিয়ে সার্চ
        const aliasMatch = graph.aliases.some(alias => 
            alias.toLowerCase().includes(searchTerm)
        );

        // ৩. নতুন: TAGS দিয়ে সার্চ
        const tagsMatch = graph.tags.some(tag =>
            tag.toLowerCase().includes(searchTerm)
        );

        // চারটি শর্তের মধ্যে যেকোনো একটি মিললেই গ্রাফটি দেখানো হবে (OR Logic)
        return titleMatch || summaryMatch || aliasMatch || tagsMatch;
    });

    // সার্চ রেজাল্ট দিয়ে গ্যালারি আপডেট করা
    renderGraphGallery(searchResults);
    
    // (দ্রষ্টব্য: এই ফাংশনে Autocomplete Suggestions যোগ করার সুযোগ আছে)
}

function handleFilterChange() {
    // কোন ক্যাটাগরি (Physics/Chemistry) সক্রিয় তা বের করা
    const activeCategoryBtn = document.querySelector('.category-filters .filter-btn.active');
    const categoryFilter = activeCategoryBtn ? activeCategoryBtn.dataset.filter : 'all';
    
    // নতুন: কোন ক্লাস (Class 11/12) নির্বাচিত তা বের করা
    const classFilter = document.getElementById('classFilter').value;
    
    // বর্তমান সার্চ টার্মের উপর ভিত্তি করে ফিল্টার করা
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    let filteredGraphs = searchTerm.length > 0 ? 
                         allGraphs.filter(graph => { 
                           // এখানে স্মার্ট সার্চ লজিক পুনরাবৃত্তি করা হবে 
                           // আপাতত সহজ ফিল্টারিং
                           return graph.title.toLowerCase().includes(searchTerm);
                         }) 
                         : allGraphs;

    // ক্যাটাগরি এবং ক্লাস দিয়ে ফাইনাল ফিল্টার
    const finalFilteredGraphs = filteredGraphs.filter(graph => {
        const matchesCategory = (categoryFilter === 'all' || graph.category === categoryFilter);
        const matchesClass = (classFilter === 'all' || graph.class === classFilter);
        
        // ডাবল ফিল্টারিং লজিক (Category AND Class)
        return matchesCategory && matchesClass;
    });

    // গ্যালারি রেন্ডার করা
    renderGraphGallery(finalFilteredGraphs);

    // সক্রিয় বাটনে 'active' ক্লাস যুক্ত করা (CSS-এর জন্য)
    document.querySelectorAll('.category-filters .filter-btn').forEach(btn => btn.classList.remove('active'));
    if (activeCategoryBtn) activeCategoryBtn.classList.add('active'); 
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
        // গ্রাফ কার্ড তৈরির HTML স্ট্রাকচার
        const graphCard = document.createElement('div');
        graphCard.className = 'graph-card';
        graphCard.innerHTML = `
            <img src="${graph.staticImage}" alt="${graph.title}">
            <div class="card-body">
                <h4>${graph.title}</h4>
                <p class="quick-summary">${graph.quickSummary}</p> <div class="card-tags">
                   <span class="tag ${graph.category}">${graph.category.toUpperCase()}</span>
                   <span class="tag ${graph.class}">${graph.class.toUpperCase()}</span>
                </div>
            </div>
        `;
        // কার্ডে ক্লিক করলে মডাল খোলা
        graphCard.addEventListener('click', () => openGraphModal(graph.id));
        gallery.appendChild(graphCard);
    });
}


function openGraphModal(graphId) {
    const graph = allGraphs.find(g => g.id === graphId);
    if (!graph) return;

    // মডালের তথ্য আপডেট
    document.getElementById('modalGraphTitle').textContent = graph.title;
    document.getElementById('modalGraphDescription').textContent = graph.description;
    
    // ১. ইন্টারেক্টিভ গ্রাফ রেন্ডার করা
    renderInteractiveGraph('liveGraphCanvas', graph);
    
    // ২. রিলেটেড গ্রাফ লোড করা
    renderRelatedGraphs(graph.relatedIds);
    
    // ৩. প্যারামিটার কন্ট্রোল লোড করা
    renderParameterControls('graphParameters', graph);
    
    document.getElementById('graphModal').style.display = 'flex';
}

function renderInteractiveGraph(elementId, graph) {
    const container = document.getElementById(elementId);
    container.innerHTML = `<p>Loading interactive graph for: ${graph.title}...</p>`;

    // **Plotly.js Implementation Logic**
    // যেহেতু এটি একটি ক্লায়েন্ট-সাইড লাইব্রেরি, আপনাকে এটিকে আপনার HTML-এ লিঙ্ক করতে হবে 
    // (যেমনটি আমি `<head>` সেকশনে কমেন্ট করে দেখিয়েছি)।

    // G001 (Ohm's Law) উদাহরণের জন্য: V=IR
    if (graph.id === 'G001' && window.Plotly) {
        const R = 10; // প্রাথমিক রেজিস্ট্যান্স
        const V_data = [0, 5, 10, 15, 20];
        const I_data = V_data.map(V => V / R);
        
        const data = [{
            x: I_data,
            y: V_data,
            mode: 'lines+markers',
            name: `V vs I (R=${R}Ω)`
        }];

        const layout = {
            title: `Interactive ${graph.title} (${graph.equation})`,
            xaxis: { title: 'Current (I)' },
            yaxis: { title: 'Voltage (V)' }
        };

        Plotly.newPlot(elementId, data, layout);
    } else {
         // যদি Plotly লোড না হয় বা ইন্টারেক্টিভ ডেটা না থাকে, স্ট্যাটিক ইমেজ দেখাও
         container.innerHTML = `<img src="${graph.staticImage}" alt="${graph.title}" class="graph-image-fallback">`;
    }
}

function renderParameterControls(elementId, graph) {
    const controls = document.getElementById(elementId);
    controls.innerHTML = '';
    
    if (graph.equation === 'V=IR') {
        controls.innerHTML = `
            <div class="control-group">
                <label for="resistorValue">Resistance (R):</label>
                <input type="range" id="resistorValue" min="1" max="20" value="10" step="1">
                <span id="currentRValue">10 Ω</span>
            </div>
        `;
        // রেঞ্জ ইনপুট পরিবর্তনের ইভেন্ট লিসেনার এখানে যোগ করে গ্রাফ আপডেট করতে হবে
        // document.getElementById('resistorValue').addEventListener('input', updateOhmGraph);
    }
    // ... অন্যান্য গ্রাফের সমীকরণের জন্য অন্যান্য কন্ট্রোল যোগ হবে
}

function renderRelatedGraphs(relatedIds) {
    const relatedList = document.getElementById('relatedGraphsList');
    relatedList.innerHTML = '';

    if (relatedIds.length === 0) {
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
                openGraphModal(id); // নতুন মডাল খুলুন
            };
            relatedList.appendChild(link);
        }
    });
}
// --- Personalization & Algorithm Logic ---

// ১. ট্র্যাকিং ফাংশন (Local Storage ব্যবহার করে)
function trackGraphView(graphId) {
    let trackingData = JSON.parse(localStorage.getItem('graphzTracking')) || {};
    trackingData[graphId] = (trackingData[graphId] || 0) + 1; // ভিউ কাউন্ট বাড়ানো
    localStorage.setItem('graphzTracking', JSON.stringify(trackingData));
}

// যখনই কোনো গ্রাফ মডাল খোলা হবে, ভিউ ট্র্যাক হবে
// openGraphModal ফাংশনের ভেতরে এটি যোগ করা উচিত:
// trackGraphView(graphId); 

// ২. র‍্যাঙ্কিং ফাংশন
function getTrendingGraphs(count = 6) {
    const trackingData = JSON.parse(localStorage.getItem('graphzTracking')) || {};
    
    // গ্রাফগুলোকে ভিউ কাউন্ট অনুযায়ী সাজানো
    const rankedGraphs = allGraphs
        .map(graph => ({
            ...graph,
            viewCount: trackingData[graph.id] || 0
        }))
        .sort((a, b) => b.viewCount - a.viewCount); // বেশি ভিউকে আগে রাখা

    return rankedGraphs.slice(0, count); // টপ গ্রাফগুলি রিটার্ন করা
}

function renderTrendingAndForYou() {
    const trendingGraphs = getTrendingGraphs(6); // 6টি ট্রেন্ডিং গ্রাফ নাও
    const container = document.getElementById('trendingGraphs');
    container.innerHTML = '';
    
    if (trendingGraphs.length === 0) {
        container.innerHTML = '<p>Start viewing graphs to see what\'s trending!</p>';
        return;
    }
    
    // ট্রেন্ডিং গ্রাফগুলির জন্য কার্ড তৈরি এবং কন্টেনারে যুক্ত করা
    trendingGraphs.forEach(graph => {
        const card = document.createElement('div');
        card.className = 'trending-card';
        card.innerHTML = `<img src="${graph.staticImage}" alt="${graph.title}"><h4>${graph.title}</h4>`;
        card.addEventListener('click', () => openGraphModal(graph.id));
        container.appendChild(card);
    });

    // (দ্রষ্টব্য: "For You" লজিক আরও জটিল, যার জন্য ইউজারের ক্লাস, ক্যাটাগরি প্রায়োরিটি ইত্যাদি দরকার)
          }
// --- Admin Panel Setup & Security ---

const ADMIN_PASSWORD_HASH = 'juyelAdminPass123'; // এটি একটি ডামি পাসওয়ার্ড। বাস্তবে এনক্রিপ্টেড হ্যাশ ব্যবহার করুন।
const LOGIN_TOKEN_KEY = 'adminLoggedIn';

// লগইন ফর্ম সাবমিট লিসেনার
document.getElementById('loginForm').addEventListener('submit', handleAdminLogin);
// অ্যাডমিন লিঙ্ক ক্লিক লিসেনার (যদি লগইন না থাকে, মডাল দেখাবে)
document.getElementById('adminLink').addEventListener('click', checkAdminAccess);
// অ্যাডমিন মডাল বন্ধ করা
document.getElementById('loginClose').addEventListener('click', () => {
    document.getElementById('loginModal').style.display = 'none';
});

function handleAdminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // পাসওয়ার্ড চেক
    // বাস্তবে: সার্ভারকে পাসওয়ার্ড পাঠিয়ে ভেরিফাই করতে হবে।
    if (email === 'admin@graphz.com' && password === 'adminpass') { 
        // সফল লগইন: লোকাল স্টোরেজে টোকেন সেট করা
        localStorage.setItem(LOGIN_TOKEN_KEY, 'true'); 
        alert('Login Successful! Welcome, Admin.');
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex'; 
        // অ্যাডমিন প্যানেল খুলে দেওয়া
    } else {
        alert('Login Failed. Check your email and password.');
    }
}

function checkAdminAccess(event) {
    event.preventDefault();
    if (localStorage.getItem(LOGIN_TOKEN_KEY) === 'true') {
        // যদি লগইন টোকেন থাকে, সরাসরি প্যানেল দেখাও
        document.getElementById('adminPanel').style.display = 'flex';
    } else {
        // টোকেন না থাকলে লগইন মডাল দেখাও
        document.getElementById('loginModal').style.display = 'flex';
    }
}

// অ্যাডমিন প্যানেল বন্ধ করার জন্য লিসেনার
document.getElementById('adminClose').addEventListener('click', () => {
    document.getElementById('adminPanel').style.display = 'none';
});
