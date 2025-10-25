// dashboard.js - User Dashboard Functionality

class UserDashboard {
    constructor() {
        this.userData = null;
        this.userStats = {
            totalBookmarks: 0,
            totalViews: 0,
            favoriteSubject: null,
            memberSince: null
        };
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.setupEventListeners();
        this.loadUserDashboard();
    }

    async checkAuth() {
        return new Promise((resolve) => {
            auth.onAuthStateChanged(async (user) => {
                if (!user) {
                    window.location.href = 'index.html';
                    return;
                }
                await this.loadUserData(user.uid);
                resolve();
            });
        });
    }

    async loadUserData(userId) {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                this.userData = userDoc.data();
                this.updateProfileForm();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async loadUserDashboard() {
        await this.loadBookmarks();
        await this.loadUserStats();
        await this.loadRecentlyViewed();
    }

    async loadBookmarks() {
        if (!bookmarkSystem.userBookmarks.length) {
            document.getElementById('bookmarksGallery').innerHTML = 
                '<div class="loading">No bookmarks yet. Start exploring graphs!</div>';
            return;
        }

        const bookmarkedGraphs = await bookmarkSystem.getBookmarkedGraphs();
        this.displayGraphsInGallery(bookmarkedGraphs, 'bookmarksGallery');
        
        // Update stats
        this.userStats.totalBookmarks = bookmarkedGraphs.length;
        this.updateStatsDisplay();
    }

    async loadUserStats() {
        if (!bookmarkSystem.userBookmarks.length) return;

        const bookmarkedGraphs = await bookmarkSystem.getBookmarkedGraphs();
        
        // Calculate total views
        this.userStats.totalViews = bookmarkedGraphs.reduce((total, graph) => 
            total + (graph.views || 0), 0
        );

        // Find favorite subject
        const subjectCount = {};
        bookmarkedGraphs.forEach(graph => {
            subjectCount[graph.subject] = (subjectCount[graph.subject] || 0) + 1;
        });

        this.userStats.favoriteSubject = Object.keys(subjectCount).reduce((a, b) => 
            subjectCount[a] > subjectCount[b] ? a : b
        );

        // Member since
        if (this.userData?.createdAt) {
            this.userStats.memberSince = this.userData.createdAt.toDate().toLocaleDateString();
        }

        this.updateStatsDisplay();
    }

    async loadRecentlyViewed() {
        // For now, show random graphs. In future, track user view history
        const recentGraphs = allGraphs
            .sort(() => Math.random() - 0.5)
            .slice(0, 6);

        this.displayGraphsInGallery(recentGraphs, 'recentGallery');
    }

    displayGraphsInGallery(graphs, galleryId) {
        const gallery = document.getElementById(galleryId);
        
        if (graphs.length === 0) {
            gallery.innerHTML = '<div class="loading">No graphs found.</div>';
            return;
        }

        gallery.innerHTML = graphs.map(graph => `
            <div class="graph-card" data-id="${graph.id}">
                <div class="graph-image-container">
                    <img src="${graph.imageUrl}" alt="${graph.name}" class="graph-image">
                    <button class="bookmark-btn ${bookmarkSystem.userBookmarks.includes(graph.id) ? 'bookmarked' : ''}" 
                            data-graph-id="${graph.id}"
                            onclick="bookmarkSystem.toggleBookmark('${graph.id}')">
                        ${bookmarkSystem.userBookmarks.includes(graph.id) ? '★' : '☆'}
                    </button>
                </div>
                <div class="graph-content">
                    <h3 class="graph-title">${graph.name}</h3>
                    <p class="graph-description">${graph.description.substring(0, 100)}...</p>
                    <div class="graph-stats">
                        <span class="view-count">👁 ${graph.views || 0}</span>
                        <span class="graph-subject">${graph.subject}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateStatsDisplay() {
        document.getElementById('totalBookmarks').textContent = this.userStats.totalBookmarks;
        document.getElementById('totalViews').textContent = this.userStats.totalViews.toLocaleString();
        document.getElementById('favoriteSubject').textContent = this.userStats.favoriteSubject || '-';
        document.getElementById('memberSince').textContent = this.userStats.memberSince || '-';
    }

    updateProfileForm() {
        if (!this.userData) return;

        document.getElementById('displayName').value = this.userData.name || '';
        document.getElementById('userBio').value = this.userData.bio || '';
        
        // Set preferences
        if (this.userData.preferences) {
            document.getElementById('emailNotifications').checked = this.userData.preferences.emailNotifications || false;
            document.getElementById('darkMode').checked = this.userData.preferences.darkMode || false;
            document.getElementById('autoBookmark').checked = this.userData.preferences.autoBookmark || false;
        }
    }

    setupEventListeners() {
        // Profile form
        document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updateProfile();
        });

        // Export bookmarks
        document.getElementById('exportBookmarks')?.addEventListener('click', () => {
            this.exportBookmarks();
        });

        // Preferences
        document.getElementById('emailNotifications')?.addEventListener('change', () => {
            this.savePreferences();
        });

        document.getElementById('darkMode')?.addEventListener('change', () => {
            this.savePreferences();
            this.toggleDarkMode();
        });

        document.getElementById('autoBookmark')?.addEventListener('change', () => {
            this.savePreferences();
        });

        // Logout
        document.getElementById('userLogoutBtn')?.addEventListener('click', () => {
            userAuth.logoutUser();
        });
    }

    async updateProfile() {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const updates = {
            name: document.getElementById('displayName').value,
            bio: document.getElementById('userBio').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await db.collection('users').doc(userId).update(updates);
            this.showMessage('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showMessage('Error updating profile', 'error');
        }
    }

    async savePreferences() {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const preferences = {
            emailNotifications: document.getElementById('emailNotifications').checked,
            darkMode: document.getElementById('darkMode').checked,
            autoBookmark: document.getElementById('autoBookmark').checked
        };

        try {
            await db.collection('users').doc(userId).update({
                preferences: preferences
            });
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    toggleDarkMode() {
        const darkModeEnabled = document.getElementById('darkMode').checked;
        if (darkModeEnabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkModeEnabled);
    }

    exportBookmarks() {
        // Simple CSV export
        const bookmarks = bookmarkSystem.userBookmarks;
        const csvContent = "data:text/csv;charset=utf-8," 
            + ["Graph ID,Name,Subject,Views"].join(",") + "\\n"
            + bookmarks.map(id => {
                const graph = allGraphs.find(g => g.id === id);
                return graph ? `"${id}","${graph.name}","${graph.subject}",${graph.views || 0}` : '';
            }).join("\\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "graphz_bookmarks.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000;';
        
        document.body.appendChild(messageDiv);
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }
}

// Initialize dashboard when page loads
let userDashboard;
document.addEventListener('DOMContentLoaded', () => {
    userDashboard = new UserDashboard();
});
