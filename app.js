/*
 * app.js - User Gallery Functionality
 *
 * !! REQUIRED DEPENDENCIES !!
 * This script assumes the following are loaded BEFORE it:
 * 1. Firebase Core SDK (firebase-app.js)
 * 2. Firebase Firestore SDK (firebase-firestore.js)
 * 3. A global 'db' object initialized as: const db = firebase.firestore();
 * 4. HTML Elements:
 * - <div id="graphGallery"></div>
 * - <input id="searchInput">
 * - <span id="resultCount"></span>
 * - Buttons with class="filter-btn" and 'data-category' attribute (e.g., <button class="filter-btn" data-category="all">All</button>)
 */

// Global variables
let allGraphs = [];
let currentGraphs = [];

// DOM Elements
const graphGallery = document.getElementById('graphGallery');
const searchInput = document.getElementById('searchInput');
const resultCount = document.getElementById('resultCount');

// Category filter functionality (NEW)
let currentCategory = 'all';

// --- DEBUG/FUNCTIONAL STUB ---
// This mock 'bookmarkSystem' is provided to make the script functional.
// Replace this with your actual bookmark system implementation.
if (typeof window.bookmarkSystem === 'undefined') {
    console.warn('Mock bookmarkSystem created. Replace with your actual implementation.');
    window.bookmarkSystem = {
        userBookmarks: ['mock-id-1'], // Mock: one item is bookmarked by default
        
        toggleBookmark: function(graphId) {
            console.log(`Toggling bookmark for: ${graphId}`);
            const index = this.userBookmarks.indexOf(graphId);
            if (index > -1) {
                this.userBookmarks.splice(index, 1);
            } else {
                this.userBookmarks.push(graphId);
            }
            // Update the single icon clicked
            this.updateSingleBookmarkIcon(graphId);
        },
        
        updateBookmarkUI: function() {
            // This is called by displayGraphs to set all icons correctly on render
            document.querySelectorAll('.bookmark-btn').forEach(btn => {
                const id = btn.dataset.graphId;
                this.updateSingleBookmarkIcon(id, btn);
            });
        },
        
        updateSingleBookmarkIcon: function(graphId, btnElement = null) {
            const btn = btnElement || document.querySelector(`.bookmark-btn[data-graph-id="${graphId}"]`);
            if (btn) {
                const isBookmarked = this.userBookmarks.includes(graphId);
                btn.classList.toggle('bookmarked', isBookmarked);
                btn.innerHTML = isBookmarked ? '★' : '☆';
            }
        }
    };
}
// --- END STUB ---


// Initialize the application
function initApp() {
    loadGraphs();
    setupEventListeners();
    // **FIXED:** Uncommented this to enable category filtering.
    // Make sure you have buttons with class="filter-btn" and data-category="..." in your HTML.
    setupCategoryFilters();
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
            filterGraphs(); 
        }, error => {
            console.error('Error loading graphs:', error);
            graphGallery.innerHTML = '<div class="loading error">Error loading graphs. Please refresh the page.</div>';
        });
}

// View counter function (NEW)
function incrementViewCount(graphId) {
    // Check for graphId to prevent errors
    if (!graphId) {
        console.warn('incrementViewCount called without graphId');
        return;
    }
    db.collection('graphs').doc(graphId).update({
        views: firebase.firestore.FieldValue.increment(1)
    }).catch(error => {
        console.error("Error incrementing view count:", error);
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
        resultCount.textContent = '0 graphs found'; // Ensure count is updated
        return;
    }

    graphGallery.innerHTML = graphs.map(graph => {
        // --- বুকমার্কিং এর জন্য নতুন কোড শুরু ---
        // **গুরুত্বপূর্ণ:** নিশ্চিত করুন যে `bookmarkSystem` অবজেক্টটি আপনার কোডের অন্য কোথাও সংজ্ঞায়িত এবং উপলব্ধ। 
        const isBookmarked = window.bookmarkSystem && bookmarkSystem.userBookmarks.includes(graph.id);
        
        return `
        <div class="graph-card" data-id="${graph.id}">
            <div class="graph-image-container">
                <img src="${graph.imageUrl}" alt="${graph.name}" class="graph-image"
                     onerror="handleImageError(this)"> 
                <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                        data-graph-id="${graph.id}"
                        onclick="bookmarkSystem.toggleBookmark('${graph.id}')">
                    ${isBookmarked ? '★' : '☆'}
                </button>
            </div>
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
                    <button class="btn-download" onclick="downloadImage('${graph.id}', '${graph.imageUrl}', '${graph.name}')">
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

    // Update bookmark UI after rendering
    // **গুরুত্বপূর্ণ:** নিশ্চিত করুন যে `bookmarkSystem` অবজেক্টটি আপনার কোডের অন্য কোথাও সংজ্ঞায়িত এবং উপলব্ধ।
    if (window.bookmarkSystem && bookmarkSystem.updateBookmarkUI) {
        bookmarkSystem.updateBookmarkUI();
    }
    // --- বুকমার্কিং এর জন্য নতুন কোড শেষ ---
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
    // Search input with debouncing
    // **FIXED:** Removed redundant searchGraphs() function and call filterGraphs() directly.
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterGraphs(); // Directly call filterGraphs
        }, 300);
    });

    // Clear search on escape key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            filterGraphs(); // Directly call filterGraphs
        }
    });
}

// Category filter event setup (NEW)
function setupCategoryFilters() {
    // This function will fail silently if no '.filter-btn' elements are in the HTML.
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
// **FIXED:** Added graphId as the first parameter to enable view counting.
function downloadImage(graphId, imageUrl, imageName) {
    incrementViewCount(graphId); // <-- **ADDED:** Increment view count on download
    
    fetch(imageUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // Sanitize filename
            a.download = `${imageName.replace(/[^a-z0-9]/gi, '_')}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error('Download failed:', error);
            alert('Download failed. Opening image in a new tab.');
            // Fallback: open in new tab
            window.open(imageUrl, '_blank');
        });
}

// Social sharing function (NEW)
function shareGraph(graphId) {
    incrementViewCount(graphId); // <-- **ADDED:** Increment view count on share
    
    const graph = allGraphs.find(g => g.id === graphId);
    if (!graph) return;

    // Use window.location.origin to get the base URL
    // **NOTE:** You may need to change '/graph/' to your actual detail page path
    const graphUrl = `${window.location.origin}/graph/${graphId}`; 
    
    const shareData = {
        title: graph.name,
        text: `Check out this graph: ${graph.name}\n${graph.description}`,
        url: graphUrl
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Shared successfully'))
            .catch(error => console.log('Sharing failed:', error));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareData.url)
            .then(() => alert('Graph URL copied to clipboard!'))
            .catch(() => alert('Sharing not supported. Could not copy URL.'));
    }
}

// Error handling for images (Now used by the img tag's onerror)
function handleImageError(img) {
    img.src = 'https://via.placeholder.com/300x200/64748b/ffffff?text=Image+Not+Found';
    img.alt = 'Image not available';
    img.onerror = null; // Prevent infinite loops if the placeholder also fails
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
                     
