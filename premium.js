// premium.js - Monetization Features

class PremiumFeatures {
    constructor() {
        this.premiumUsers = [];
        this.init();
    }

    init() {
        this.checkPremiumStatus();
        this.setupPremiumUI();
    }

    async checkPremiumStatus() {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.updatePremiumUI(userData.isPremium || false);
            }
        } catch (error) {
            console.error('Error checking premium status:', error);
        }
    }

    setupPremiumUI() {
        // Add premium badge to header if user is premium
        this.injectPremiumElements();
    }

    injectPremiumElements() {
        // Premium badge in header
        const headerActions = document.querySelector('.header-actions');
        if (headerActions && !document.getElementById('premiumBadge')) {
            const premiumBadge = document.createElement('div');
            premiumBadge.id = 'premiumBadge';
            premiumBadge.className = 'premium-badge';
            premiumBadge.innerHTML = '⭐ Premium';
            premiumBadge.style.display = 'none';
            headerActions.prepend(premiumBadge);
        }

        // Upgrade button for non-premium users
        if (!document.getElementById('upgradeButton')) {
            const upgradeBtn = document.createElement('button');
            upgradeBtn.id = 'upgradeButton';
            upgradeBtn.className = 'btn btn-premium';
            upgradeBtn.innerHTML = '⭐ Upgrade to Premium';
            upgradeBtn.onclick = () => this.showUpgradeModal();
            
            const authButtons = document.getElementById('authButtons');
            if (authButtons) {
                authButtons.appendChild(upgradeBtn);
            }
        }
    }

    updatePremiumUI(isPremium) {
        const premiumBadge = document.getElementById('premiumBadge');
        const upgradeButton = document.getElementById('upgradeButton');

        if (premiumBadge) {
            premiumBadge.style.display = isPremium ? 'flex' : 'none';
        }

        if (upgradeButton) {
            upgradeButton.style.display = isPremium ? 'none' : 'flex';
        }

        // Enable/disable premium features
        this.togglePremiumFeatures(isPremium);
    }

    togglePremiumFeatures(isPremium) {
        // Example: Enable bulk download for premium users
        const downloadButtons = document.querySelectorAll('.btn-download');
        downloadButtons.forEach(btn => {
            if (!isPremium) {
                btn.title = 'Upgrade to Premium for unlimited downloads';
            }
        });
    }

    showUpgradeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content premium-modal">
                <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2>⭐ Upgrade to GRAPHZ Premium</h2>
                
                <div class="pricing-plans">
                    <div class="plan-card">
                        <h3>Free</h3>
                        <div class="plan-price">$0</div>
                        <ul class="plan-features">
                            <li>✓ Basic graph access</li>
                            <li>✓ Limited downloads (10/month)</li>
                            <li>✓ Basic search</li>
                            <li>✗ No premium content</li>
                            <li>✗ No bulk download</li>
                        </ul>
                        <button class="btn btn-outline" disabled>Current Plan</button>
                    </div>

                    <div class="plan-card featured">
                        <div class="plan-badge">Most Popular</div>
                        <h3>Premium</h3>
                        <div class="plan-price">$4.99<span>/month</span></div>
                        <ul class="plan-features">
                            <li>✓ Unlimited graph access</li>
                            <li>✓ Unlimited downloads</li>
                            <li>✓ Advanced search filters</li>
                            <li>✓ Premium content library</li>
                            <li>✓ Bulk download feature</li>
                            <li>✓ Priority support</li>
                        </ul>
                        <button class="btn btn-primary" onclick="premiumFeatures.startUpgrade()">
                            Upgrade Now
                        </button>
                    </div>
                </div>

                <div class="premium-benefits">
                    <h4>Premium Benefits:</h4>
                    <div class="benefits-grid">
                        <div class="benefit-item">
                            <span class="benefit-icon">📥</span>
                            <span>Unlimited Downloads</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">🔍</span>
                            <span>Advanced Search</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">⭐</span>
                            <span>Premium Content</span>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">💨</span>
                            <span>Faster Access</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    startUpgrade() {
        // For now, just simulate upgrade
        // In production, integrate with Stripe/Payment gateway
        const user = auth.currentUser;
        if (!user) {
            userAuth.openAuthModal('login');
            return;
        }

        // Simulate payment processing
        this.processPayment(user.uid);
    }

    async processPayment(userId) {
        try {
            // Show processing state
            this.showPaymentProcessing();

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update user to premium
            await db.collection('users').doc(userId).update({
                isPremium: true,
                premiumSince: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.showMessage('🎉 Welcome to GRAPHZ Premium!', 'success');
            this.updatePremiumUI(true);

            // Close modal
            document.querySelector('.modal')?.remove();

        } catch (error) {
            console.error('Payment error:', error);
            this.showMessage('Payment failed. Please try again.', 'error');
        }
    }

    showPaymentProcessing() {
        const processingDiv = document.createElement('div');
        processingDiv.className = 'payment-processing';
        processingDiv.innerHTML = `
            <div class="processing-spinner"></div>
            <p>Processing your payment...</p>
        `;
        processingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 1001;
            text-align: center;
        `;

        document.body.appendChild(processingDiv);
        setTimeout(() => {
            if (processingDiv.parentElement) {
                processingDiv.parentElement.removeChild(processingDiv);
            }
        }, 2000);
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

// Initialize premium features
const premiumFeatures = new PremiumFeatures();
