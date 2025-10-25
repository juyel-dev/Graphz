// auth.js - User Authentication System

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check auth state
        auth.onAuthStateChanged(user => {
            this.currentUser = user;
            this.updateUI();
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('userLoginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.loginUser();
        });

        // Signup form
        document.getElementById('userSignupForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.signupUser();
        });

        // Logout button
        document.getElementById('userLogoutBtn')?.addEventListener('click', () => {
            this.logoutUser();
        });
    }

    async loginUser() {
        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('userPassword').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            this.showMessage('Login successful!', 'success');
            this.closeAuthModal();
        } catch (error) {
            this.showMessage(this.getAuthErrorMessage(error), 'error');
        }
    }

    async signupUser() {
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const name = document.getElementById('signupName').value;

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Save user profile
            await db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                bookmarks: []
            });

            this.showMessage('Account created successfully!', 'success');
            this.closeAuthModal();
        } catch (error) {
            this.showMessage(this.getAuthErrorMessage(error), 'error');
        }
    }

    async logoutUser() {
        try {
            await auth.signOut();
            this.showMessage('Logged out successfully', 'success');
        } catch (error) {
            this.showMessage('Error logging out', 'error');
        }
    }

    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            // User is logged in
            authButtons.style.display = 'none';
            userProfile.style.display = 'flex';
            
            // Get user data
            this.loadUserProfile();
        } else {
            // User is logged out
            authButtons.style.display = 'flex';
            userProfile.style.display = 'none';
        }
    }

    async loadUserProfile() {
        try {
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                document.getElementById('userName').textContent = userData.name;
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    openAuthModal(type = 'login') {
        document.getElementById('authModal').style.display = 'flex';
        if (type === 'signup') {
            this.showSignupForm();
        } else {
            this.showLoginForm();
        }
    }

    closeAuthModal() {
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('userLoginForm').reset();
        document.getElementById('userSignupForm').reset();
    }

    showLoginForm() {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('signupForm').style.display = 'none';
    }

    showSignupForm() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('signupForm').style.display = 'block';
    }

    getAuthErrorMessage(error) {
        // Same error messages as admin.js
        switch (error.code) {
            case 'auth/invalid-email': return 'Invalid email address.';
            case 'auth/user-disabled': return 'This account has been disabled.';
            case 'auth/user-not-found': return 'No account found with this email.';
            case 'auth/wrong-password': return 'Incorrect password.';
            case 'auth/email-already-in-use': return 'Email already in use.';
            case 'auth/weak-password': return 'Password should be at least 6 characters.';
            default: return 'Authentication failed. Please try again.';
        }
    }

    showMessage(message, type) {
        // Implementation for showing messages
        const messageDiv = document.getElementById('authMessage');
        messageDiv.innerHTML = `<div class="message ${type}">${message}</div>`;
        setTimeout(() => { messageDiv.innerHTML = ''; }, 5000);
    }
}

// Initialize auth system
const userAuth = new AuthSystem();
