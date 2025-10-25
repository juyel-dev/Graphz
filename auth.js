// auth.js - User Authentication System (Fixed Version)

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('Auth system initializing...');
        
        // Check auth state
        auth.onAuthStateChanged((user) => {
            console.log('Auth state changed:', user);
            this.currentUser = user;
            this.updateUI();
        });

        // Setup event listeners after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.setupEventListeners();
        }, 1000);
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Login form
        const loginForm = document.getElementById('userLoginForm');
        if (loginForm) {
            console.log('Login form found');
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.loginUser();
            });
        } else {
            console.log('Login form NOT found');
        }

        // Signup form
        const signupForm = document.getElementById('userSignupForm');
        if (signupForm) {
            console.log('Signup form found');
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.signupUser();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('userLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logoutUser();
            });
        }

        // Close modal when clicking outside
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAuthModal();
                }
            });
        }

        console.log('Event listeners setup complete');
    }

    async loginUser() {
        console.log('Login attempt...');
        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('userPassword').value;

        console.log('Email:', email);

        try {
            this.showMessage('Logging in...', 'success');
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            console.log('Login successful:', userCredential.user);
            this.showMessage('Login successful!', 'success');
            this.closeAuthModal();
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(this.getAuthErrorMessage(error), 'error');
        }
    }

    async signupUser() {
        console.log('Signup attempt...');
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const name = document.getElementById('signupName').value;

        try {
            this.showMessage('Creating account...', 'success');
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Save user profile
            await db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                bookmarks: []
            });

            console.log('Signup successful:', userCredential.user);
            this.showMessage('Account created successfully!', 'success');
            this.closeAuthModal();
        } catch (error) {
            console.error('Signup error:', error);
            this.showMessage(this.getAuthErrorMessage(error), 'error');
        }
    }

    async logoutUser() {
        try {
            await auth.signOut();
            this.showMessage('Logged out successfully', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            this.showMessage('Error logging out', 'error');
        }
    }

    updateUI() {
        console.log('Updating UI, user:', this.currentUser);
        const authButtons = document.getElementById('authButtons');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            // User is logged in
            if (authButtons) authButtons.style.display = 'none';
            if (userProfile) userProfile.style.display = 'flex';
            
            // Get user data
            this.loadUserProfile();
        } else {
            // User is logged out
            if (authButtons) authButtons.style.display = 'flex';
            if (userProfile) userProfile.style.display = 'none';
        }
    }

    async loadUserProfile() {
        if (!this.currentUser) return;
        
        try {
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                const userNameElement = document.getElementById('userName');
                if (userNameElement) {
                    userNameElement.textContent = userData.name;
                }
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    openAuthModal(type = 'login') {
        console.log('Opening auth modal:', type);
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'flex';
            if (type === 'signup') {
                this.showSignupForm();
            } else {
                this.showLoginForm();
            }
        } else {
            console.error('Auth modal not found!');
        }
    }

    closeAuthModal() {
        console.log('Closing auth modal');
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        const loginForm = document.getElementById('userLoginForm');
        const signupForm = document.getElementById('userSignupForm');
        
        if (loginForm) loginForm.reset();
        if (signupForm) signupForm.reset();
        
        this.showMessage('', '');
    }

    showLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (loginForm) loginForm.style.display = 'block';
        if (signupForm) signupForm.style.display = 'none';
    }

    showSignupForm() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (loginForm) loginForm.style.display = 'none';
        if (signupForm) signupForm.style.display = 'block';
    }

    getAuthErrorMessage(error) {
        console.log('Auth error code:', error.code);
        switch (error.code) {
            case 'auth/invalid-email': return 'Invalid email address.';
            case 'auth/user-disabled': return 'This account has been disabled.';
            case 'auth/user-not-found': return 'No account found with this email.';
            case 'auth/wrong-password': return 'Incorrect password.';
            case 'auth/email-already-in-use': return 'Email already in use.';
            case 'auth/weak-password': return 'Password should be at least 6 characters.';
            case 'auth/network-request-failed': return 'Network error. Please check your connection.';
            default: return `Authentication failed: ${error.message}`;
        }
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('authMessage');
        if (messageDiv) {
            if (message) {
                messageDiv.innerHTML = `<div class="message ${type}">${message}</div>`;
            } else {
                messageDiv.innerHTML = '';
            }
        }
    }
}

// Make functions globally available for HTML onclick attributes
function openLoginModal() {
    userAuth.openAuthModal('login');
}

function openSignupModal() {
    userAuth.openAuthModal('signup');
}

function closeAuthModal() {
    userAuth.closeAuthModal();
}

function showLoginForm() {
    userAuth.showLoginForm();
}

function showSignupForm() {
    userAuth.showSignupForm();
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing auth...');
    window.userAuth = new AuthSystem();
});
