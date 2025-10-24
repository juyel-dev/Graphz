// admin.js - Admin Panel Functionality

// Global variables
let currentEditingId = null;
let allAdminGraphs = [];

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const logoutBtn = document.getElementById('logoutBtn');
const graphForm = document.getElementById('graphForm');
const adminGraphsList = document.getElementById('adminGraphsList');
const submitBtn = document.getElementById('submitBtn');
const updateBtn = document.getElementById('updateBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Initialize admin application
function initAdmin() {
    checkAuthState();
    setupAdminEventListeners();
}

// Check authentication state
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            showDashboard();
            loadAdminGraphs();
        } else {
            showLogin();
        }
    });
}

// Show login section
function showLogin() {
    loginSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
    clearLoginForm();
}

// Show dashboard section
function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
}

// Login functionality
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        showMessage('Logging in...', 'success');
        await auth.signInWithEmailAndPassword(email, password);
        showMessage('Login successful!', 'success');
    } catch (error) {
        console.error('Login error:', error);
        showMessage(getAuthErrorMessage(error), 'error');
    }
});

// Logout functionality
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        showMessage('Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('Error logging out', 'error');
    }
});

// Load graphs for admin
function loadAdminGraphs() {
    db.collection('graphs').orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            allAdminGraphs = [];
            adminGraphsList.innerHTML = '';
            
            snapshot.forEach(doc => {
                allAdminGraphs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            displayAdminGraphs(allAdminGraphs);
        }, error => {
            console.error('Error loading admin graphs:', error);
            adminGraphsList.innerHTML = '<div class="message error">Error loading graphs</div>';
        });
}

// Display graphs in admin list
function displayAdminGraphs(graphs) {
    if (graphs.length === 0) {
        adminGraphsList.innerHTML = `
            <div class="message">
                <p>No graphs found. Add your first graph using the form above!</p>
            </div>
        `;
        return;
    }

    adminGraphsList.innerHTML = graphs.map(graph => `
        <div class="admin-graph-item" data-id="${graph.id}">
            <div class="admin-graph-info">
                <h3>${graph.name}</h3>
                ${graph.alias ? `<p><strong>Alias:</strong> ${graph.alias}</p>` : ''}
                <p><strong>Description:</strong> ${graph.description.substring(0, 100)}${graph.description.length > 100 ? '...' : ''}</p>
                <div class="admin-graph-meta">
                    <span><strong>Subject:</strong> ${graph.subject}</span>
                    <span><strong>Tags:</strong> ${graph.tags ? graph.tags.join(', ') : 'None'}</span>
                    <span><strong>Created:</strong> ${formatDate(graph.createdAt)}</span>
                </div>
            </div>
            <div class="admin-graph-actions">
                <button class="btn btn-warning edit-btn" onclick="editGraph('${graph.id}')">Edit</button>
                <button class="btn btn-danger delete-btn" onclick="deleteGraph('${graph.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Add new graph
graphForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = getFormData();
    if (!formData) return;
    
    try {
        if (currentEditingId) {
            // Update existing graph
            await db.collection('graphs').doc(currentEditingId).update({
                ...formData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showMessage('Graph updated successfully!', 'success');
        } else {
            // Add new graph
            await db.collection('graphs').add({
                ...formData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showMessage('Graph added successfully!', 'success');
        }
        
        resetForm();
    } catch (error) {
        console.error('Error saving graph:', error);
        showMessage('Error saving graph. Please try again.', 'error');
    }
});

// Get form data
function getFormData() {
    const name = document.getElementById('graphName').value.trim();
    const alias = document.getElementById('graphAlias').value.trim();
    const source = document.getElementById('graphSource').value.trim();
    const description = document.getElementById('graphDescription').value.trim();
    const subject = document.getElementById('graphSubject').value;
    const tags = document.getElementById('graphTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const imageUrl = document.getElementById('graphImageUrl').value.trim();
    
    // Validation
    if (!name || !description || !subject || !imageUrl) {
        showMessage('Please fill in all required fields.', 'error');
        return null;
    }
    
    if (!isValidUrl(imageUrl)) {
        showMessage('Please enter a valid image URL.', 'error');
        return null;
    }
    
    return {
        name,
        alias: alias || '',
        source: source || '',
        description,
        subject,
        tags,
        imageUrl
    };
}

// Edit graph
function editGraph(graphId) {
    const graph = allAdminGraphs.find(g => g.id === graphId);
    if (!graph) return;
    
    // Fill form with graph data
    document.getElementById('graphName').value = graph.name;
    document.getElementById('graphAlias').value = graph.alias || '';
    document.getElementById('graphSource').value = graph.source || '';
    document.getElementById('graphDescription').value = graph.description;
    document.getElementById('graphSubject').value = graph.subject;
    document.getElementById('graphTags').value = graph.tags ? graph.tags.join(', ') : '';
    document.getElementById('graphImageUrl').value = graph.imageUrl;
    
    // Switch to edit mode
    currentEditingId = graphId;
    submitBtn.style.display = 'none';
    updateBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Delete graph
async function deleteGraph(graphId) {
    if (!confirm('Are you sure you want to delete this graph? This action cannot be undone.')) {
        return;
    }
    
    try {
        await db.collection('graphs').doc(graphId).delete();
        showMessage('Graph deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting graph:', error);
        showMessage('Error deleting graph. Please try again.', 'error');
    }
}

// Cancel edit
cancelBtn.addEventListener('click', resetForm);

// Reset form
function resetForm() {
    graphForm.reset();
    currentEditingId = null;
    submitBtn.style.display = 'inline-block';
    updateBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
}

// Clear login form
function clearLoginForm() {
    loginForm.reset();
    loginMessage.innerHTML = '';
}

// Utility functions
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showMessage(message, type) {
    loginMessage.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => {
        loginMessage.innerHTML = '';
    }, 5000);
}

function getAuthErrorMessage(error) {
    switch (error.code) {
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        default:
            return 'Login failed. Please try again.';
    }
}

// Setup event listeners
function setupAdminEventListeners() {
    // Additional listeners can be added here
}

// Initialize admin when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdmin);
