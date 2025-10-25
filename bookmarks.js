// bookmarks.js - Bookmark System

class BookmarkSystem {
    constructor() {
        this.userBookmarks = [];
        this.init();
    }

    init() {
        // Load bookmarks when user logs in
        auth.onAuthStateChanged(user => {
            if (user) {
                this.loadUserBookmarks(user.uid);
            } else {
                this.userBookmarks = [];
                this.updateBookmarkUI();
            }
        });
    }

    async loadUserBookmarks(userId) {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                this.userBookmarks = userDoc.data().bookmarks || [];
                this.updateBookmarkUI();
            }
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        }
    }

    async toggleBookmark(graphId) {
        if (!auth.currentUser) {
            userAuth.openAuthModal('login');
            return;
        }

        const userId = auth.currentUser.uid;
        const isBookmarked = this.userBookmarks.includes(graphId);

        try {
            if (isBookmarked) {
                // Remove bookmark
                this.userBookmarks = this.userBookmarks.filter(id => id !== graphId);
            } else {
                // Add bookmark
                this.userBookmarks.push(graphId);
            }

            // Update in Firestore
            await db.collection('users').doc(userId).update({
                bookmarks: this.userBookmarks
            });

            this.updateBookmarkUI();
            this.showBookmarkMessage(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
        } catch (error) {
            console.error('Error updating bookmark:', error);
        }
    }

    updateBookmarkUI() {
        // Update bookmark buttons on all graphs
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            const graphId = btn.dataset.graphId;
            const isBookmarked = this.userBookmarks.includes(graphId);
            
            btn.innerHTML = isBookmarked ? '★' : '☆';
            btn.title = isBookmarked ? 'Remove bookmark' : 'Add bookmark';
            btn.className = `bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`;
        });

        // Update bookmarks count in profile
        const bookmarksCount = document.getElementById('bookmarksCount');
        if (bookmarksCount) {
            bookmarksCount.textContent = this.userBookmarks.length;
        }
    }

    async getBookmarkedGraphs() {
        if (this.userBookmarks.length === 0) return [];

        try {
            const bookmarkedGraphs = [];
            for (const graphId of this.userBookmarks) {
                const graphDoc = await db.collection('graphs').doc(graphId).get();
                if (graphDoc.exists) {
                    bookmarkedGraphs.push({
                        id: graphDoc.id,
                        ...graphDoc.data()
                    });
                }
            }
            return bookmarkedGraphs;
        } catch (error) {
            console.error('Error loading bookmarked graphs:', error);
            return [];
        }
    }

    showBookmarkMessage(message) {
        // Show temporary message
        const tempMsg = document.createElement('div');
        tempMsg.className = 'bookmark-message';
        tempMsg.textContent = message;
        tempMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #059669;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
        `;
        document.body.appendChild(tempMsg);
        
        setTimeout(() => {
            document.body.removeChild(tempMsg);
        }, 2000);
    }
}

// Initialize bookmark system
const bookmarkSystem = new BookmarkSystem();
