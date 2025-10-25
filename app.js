// app.js - User Gallery Functionality

// Global variables
let allGraphs = [];
let currentGraphs = [];

// DOM Elements
const graphGallery = document.getElementById('graphGallery');
const searchInput = document.getElementById('searchInput');
const resultCount = document.getElementById('resultCount');

// Category filter functionality (NEW)
let currentCategory = 'all';

// Initialize the application
function initApp() {
    loadGraphs();
    setupEventListeners();
    // Assuming you have a category filter section in your HTML
    // You should add an HTML element with class="filter-btn" and data-category attribute
    // e.g., <button class="filter-btn active" data-category="all">All</button>
    // setupCategoryFilters(); // Uncomment this line once you have the HTML for filters
}

// Load graphs from Firestore
function loadGraphs() {
    graphGallery.innerHTML = '<div class="loading">Loading graphs...</div>';
    
    // NOTE: For the view count to display, ensure your Firestore documents have a 'views' field.
    db.collection('graphs').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            allGraphs = [];
            snapshot.forEach(doc => {
                allGraphs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Re-apply current search/category filter on new load
            // This is better than just copying allGraphs
            filterGraphs(); 
        }, error => {
            console.error('Error loading graphs:', error);
            graphGallery.innerHTML = '<div class="loading error">Error loading graphs. Please refresh the page.</div>';
        });
}

// View counter function (NEW)
// NOTE: I recommend only calling this on a user action like a 'click to view details'.
function incrementViewCount(graphId) {
    db.collection('graphs').doc(graphId).update({
        views: firebase.firestore.FieldValue.increment(1)
    });
}

// Display graphs in the gallery (UPDATED)
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

    graphGallery.innerHTML = graphs.map(graph => {
        // !!! IMPORTANT ADJUSTMENT !!!
        // I have commented out the incrementViewCount(graph.id) here
        // Calling it here will increment views every time the gallery is rendered (e.g., on search/sort/filter)
        // You should only call it when a user genuinely views a graph (e.g., clicks into a detail page).
        // If you must track views in the gallery, consider server-side tracking or a debounced/throttled approach.
        // incrementViewCount(graph.id); 

        return `
        <div class="graph-card" data-id="${graph.id}">
            <img src="${graph.imageUrl}" alt="${graph.name}" class="graph-image" 
                 onerror="this.src='https://via.placeholder.com/300x200/64748b/ffffff?text=Image+Not+Found'">
            <div class="graph-content">
                <h3 class="graph-title">${graph.name}</h3>
                ${graph.alias ? `<p class="graph-alias">"${graph.alias}"</p>` : ''}
                <p class="graph-description">${graph.description}</p>
                
                <div class="graph-stats">
                    <span class="view-count">👁 ${graph.views || 0} views</span>
                    <span class="graph-subject">${graph.subject}</span>
                </div>
                
                ${graph.tags && graph.tags.length > 0 ? `
                    <div class="graph-tags">
                        ${graph.tags.map(tag => `<span class="graph-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="graph-actions">
                    <button class="btn-download" onclick="downloadImage('${graph.imageUrl}', '${graph.name}')">
                        📥 Download
                    </button>
                    <button class="btn-share" onclick="shareGraph('${graph.id}')">
                        🔗 Share
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Search functionality (UPDATED to use filterGraphs)
function searchGraphs(query) {
    // Setting searchInput.value will trigger filterGraphs via loadGraphs/onSnapshot if needed,
    // but here we directly call filterGraphs to apply search/category logic.
    filterGraphs(); 
}

// Category filter logic combining search and category (NEW)
function filterGraphs() {
    let filteredGraphs = allGraphs;
    
    // 1. Apply Category Filter
    if (currentCategory !== 'all') {
        filteredGraphs = allGraphs.filter(graph => graph.subject === currentCategory);
    }
    
    // 2. Apply Search Filter
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredGraphs = filteredGraphs.filter(graph => 
            graph.name.toLowerCase().includes(searchTerm) ||
            (graph.alias && graph.alias.toLowerCase().includes(searchTerm)) ||
            graph.subject.toLowerCase().includes(searchTerm) ||
            graph.description.toLowerCase().includes(searchTerm) ||
            (graph.tags && graph.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }
    
    currentGraphs = filteredGraphs;
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

// Setup event listeners (UPDATED)
function setupEventListeners() {
    // Search input with debouncing (now calls filterGraphs via searchGraphs)
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

    // Setup category filters (Needs to be called in initApp if you have the HTML)
    // setupCategoryFilters();
}

// Category filter event setup (NEW)
function setupCategoryFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter graphs
            currentCategory = this.dataset.category;
            filterGraphs();
        });
    });
}

// Download image function (NEW)
function downloadImage(imageUrl, imageName) {
    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${imageName.replace(/[^a-z0-9]/gi, '_')}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(imageUrl, '_blank');
        });
}

// Social sharing function (NEW)
function shareGraph(graphId) {
    const graph = allGraphs.find(g => g.id === graphId);
    if (!graph) return;

    // Use window.location.origin to get the base URL, assuming a path might be needed later
    const graphUrl = `${window.location.origin}/graph/${graphId}`; // You might want a specific graph URL
    
    const shareData = {
        title: graph.name,
        text: graph.description,
        url: graphUrl
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Shared successfully'))
            .catch(error => console.log('Sharing failed:', error));
    } else {
        // Fallback: copy to clipboard
        const textToCopy = `${graph.name}\n${graph.description}\n${graphUrl}`;
        navigator.clipboard.writeText(textToCopy)
            .then(() => alert('Graph details copied to clipboard!'))
            .catch(() => alert('Sharing not supported on this browser'));
    }
}

// Error handling for images
function handleImageError(img) {
    img.src = 'https://via.placeholder.com/300x200/64748b/ffffff?text=Image+Not+Found';
    img.alt = 'Image not available';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
