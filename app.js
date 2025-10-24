// app.js - User Gallery Functionality

// Global variables
let allGraphs = [];
let currentGraphs = [];

// DOM Elements
const graphGallery = document.getElementById('graphGallery');
const searchInput = document.getElementById('searchInput');
const resultCount = document.getElementById('resultCount');

// Initialize the application
function initApp() {
    loadGraphs();
    setupEventListeners();
}

// Load graphs from Firestore
function loadGraphs() {
    graphGallery.innerHTML = '<div class="loading">Loading graphs...</div>';
    
    db.collection('graphs').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            allGraphs = [];
            snapshot.forEach(doc => {
                allGraphs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            currentGraphs = [...allGraphs];
            displayGraphs(currentGraphs);
            updateResultCount(currentGraphs.length);
        }, error => {
            console.error('Error loading graphs:', error);
            graphGallery.innerHTML = '<div class="loading error">Error loading graphs. Please refresh the page.</div>';
        });
}

// Display graphs in the gallery
function displayGraphs(graphs) {
    if (graphs.length === 0) {
        graphGallery.innerHTML = `
            <div class="loading">
                <p>No graphs found matching your search.</p>
                <p style="margin-top: 1rem; color: #64748b;">Try different keywords or check back later.</p>
            </div>
        `;
        return;
    }

    graphGallery.innerHTML = graphs.map(graph => `
        <div class="graph-card" data-id="${graph.id}">
            <img src="${graph.imageUrl}" alt="${graph.name}" class="graph-image" 
                 onerror="this.src='https://via.placeholder.com/300x200/64748b/ffffff?text=Image+Not+Found'">
            <div class="graph-content">
                <h3 class="graph-title">${graph.name}</h3>
                ${graph.alias ? `<p class="graph-alias">"${graph.alias}"</p>` : ''}
                <p class="graph-description">${graph.description}</p>
                
                ${graph.tags && graph.tags.length > 0 ? `
                    <div class="graph-tags">
                        ${graph.tags.map(tag => `<span class="graph-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="graph-meta">
                    <span class="graph-subject">${graph.subject}</span>
                    ${graph.source ? `<span class="graph-source">Source: ${graph.source}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Search functionality
function searchGraphs(query) {
    if (!query.trim()) {
        currentGraphs = [...allGraphs];
    } else {
        const searchTerm = query.toLowerCase().trim();
        currentGraphs = allGraphs.filter(graph => 
            graph.name.toLowerCase().includes(searchTerm) ||
            (graph.alias && graph.alias.toLowerCase().includes(searchTerm)) ||
            graph.subject.toLowerCase().includes(searchTerm) ||
            graph.description.toLowerCase().includes(searchTerm) ||
            (graph.tags && graph.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }
    
    displayGraphs(currentGraphs);
    updateResultCount(currentGraphs.length);
}

// Update result count display
function updateResultCount(count) {
    if (count === 1) {
        resultCount.textContent = `${count} graph found`;
    } else {
        resultCount.textContent = `${count} graphs found`;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input with debouncing
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchGraphs(e.target.value);
        }, 300);
    });

    // Clear search on escape key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchGraphs('');
        }
    });
}

// Error handling for images
function handleImageError(img) {
    img.src = 'https://via.placeholder.com/300x200/64748b/ffffff?text=Image+Not+Found';
    img.alt = 'Image not available';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
