// Sample Graph Data (50+ graphs will be added)
const sampleGraphs = [
    {
        id: 1,
        name: "Ohm's Law",
        aliases: ["ohms law", "voltage current"],
        equation: "V = I × R",
        subject: "Physics",
        tags: ["electricity", "circuits", "physics"],
        description: "Shows relationship between voltage, current and resistance",
        graphCode: "linear"
    },
    {
        id: 2,
        name: "Quadratic Function",
        aliases: ["parabola", "quadratic equation"],
        equation: "y = ax² + bx + c",
        subject: "Mathematics",
        tags: ["algebra", "polynomial", "mathematics"],
        description: "Standard quadratic function forming a parabola",
        graphCode: "quadratic"
    },
    {
        id: 3,
        name: "Sine Wave",
        aliases: ["sine function", "sinusoidal"],
        equation: "y = A sin(ωx + φ)",
        subject: "Mathematics",
        tags: ["trigonometry", "waves", "periodic"],
        description: "Basic sine wave function showing periodic oscillation",
        graphCode: "sine"
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    loadGraphs();
    setupSearch();
}

// Navigation Setup
function setupNavigation() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileNav = document.getElementById('mobileNav');
    
    hamburgerMenu.addEventListener('click', function() {
        mobileNav.classList.toggle('active');
    });
    
    // Close menu when clicking on links
    const navLinks = mobileNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileNav.classList.remove('active');
        });
    });
}

// Load and Display Graphs
function loadGraphs() {
    const galleryGrid = document.getElementById('graphGallery');
    const featuredGrid = document.getElementById('featuredGraphs');
    
    // Clear existing content
    galleryGrid.innerHTML = '';
    featuredGrid.innerHTML = '';
    
    // Display all graphs in gallery
    sampleGraphs.forEach(graph => {
        const graphCard = createGraphCard(graph);
        galleryGrid.appendChild(graphCard);
    });
    
    // Display featured graphs (first 6)
    sampleGraphs.slice(0, 6).forEach(graph => {
        const graphCard = createGraphCard(graph);
        featuredGrid.appendChild(graphCard);
    });
}

// Create Graph Card Element
function createGraphCard(graph) {
    const card = document.createElement('div');
    card.className = 'graph-card';
    card.innerHTML = `
        <div class="graph-preview">
            Graph Preview: ${graph.name}
        </div>
        <div class="graph-info">
            <h4>${graph.name}</h4>
            <div class="graph-equation">${graph.equation}</div>
            <p>${graph.description}</p>
            <div class="graph-tags">
                ${graph.tags.map(tag => `<span class="graph-tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    return card;
}

// Search Functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    
    searchInput.addEventListener('input', handleSearch);
    searchBtn.addEventListener('click', handleSearch);
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm.length < 2) {
        loadGraphs();
        return;
    }
    
    const filteredGraphs = sampleGraphs.filter(graph => {
        return (
            graph.name.toLowerCase().includes(searchTerm) ||
            graph.aliases.some(alias => alias.includes(searchTerm)) ||
            graph.tags.some(tag => tag.includes(searchTerm)) ||
            graph.subject.toLowerCase().includes(searchTerm)
        );
    });
    
    displaySearchResults(filteredGraphs);
}

function displaySearchResults(graphs) {
    const galleryGrid = document.getElementById('graphGallery');
    galleryGrid.innerHTML = '';
    
    if (graphs.length === 0) {
        galleryGrid.innerHTML = '<p class="no-results">No graphs found. Try different keywords.</p>';
        return;
    }
    
    graphs.forEach(graph => {
        const graphCard = createGraphCard(graph);
        galleryGrid.appendChild(graphCard);
    });
}

// Admin Panel Functions
function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    const defaultPassword = "admin123";
    
    if (password === defaultPassword) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        // Show admin panel section
        document.getElementById('admin').style.display = 'block';
    } else {
        alert('Incorrect password!');
    }
                     }
