// App configuration
const APP_CONFIG = {
    apiBaseUrl: window.location.origin,
    shopifyAppBridge: null
};

// Global state
let appState = {
    isAuthenticated: false,
    shop: null,
    products: [],
    filteredProducts: [],
    currentProduct: null
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the app
async function initializeApp() {
    try {
        // Check authentication status
        await checkAuthStatus();
        
        // Set up event listeners
        setupEventListeners();
        
        // Load data if authenticated
        if (appState.isAuthenticated) {
            await loadDashboardData();
        }
    } catch (error) {
        console.error('App initialization error:', error);
        showError('Failed to initialize app');
    }
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/auth/status');
        const data = await response.json();
        
        appState.isAuthenticated = data.authenticated;
        appState.shop = data.shop;
        
        updateUI();
    } catch (error) {
        console.error('Auth status check error:', error);
        appState.isAuthenticated = false;
    }
}

// Update UI based on authentication status
function updateUI() {
    const loadingScreen = document.getElementById('loading');
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');
    
    loadingScreen.style.display = 'none';
    
    if (appState.isAuthenticated) {
        authScreen.style.display = 'none';
        mainApp.style.display = 'block';
        
        // Update shop name
        const shopNameElement = document.getElementById('shop-name');
        if (shopNameElement && appState.shop) {
            shopNameElement.textContent = appState.shop;
        }
    } else {
        authScreen.style.display = 'flex';
        mainApp.style.display = 'none';
    }
}

// Set up event listeners
function setupEventListeners() {
    // Install button
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.addEventListener('click', handleInstall);
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefresh);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Search and filters
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    const ratingFilter = document.getElementById('rating-filter');
    if (ratingFilter) {
        ratingFilter.addEventListener('change', handleFilter);
    }
    
    const sourceFilter = document.getElementById('source-filter');
    if (sourceFilter) {
        sourceFilter.addEventListener('change', handleFilter);
    }
    
    // Modal close
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', closeReviewModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeReviewModal();
            }
        });
    }
}

// Handle app installation
function handleInstall() {
  const shop = getShopFromUrl();
  if (shop) {
    window.location.href = `/auth/install?shop=${shop}`;
  } else {
    // Show a prompt to enter shop name
    const shopName = prompt('Please enter your Shopify store name (e.g., your-store.myshopify.com):');
    if (shopName) {
      window.location.href = `/auth/install?shop=${shopName}`;
    } else {
      showError('Please provide a valid Shopify store name');
    }
  }
}

// Handle refresh
async function handleRefresh() {
    try {
        showLoading();
        await loadDashboardData();
        showSuccess('Data refreshed successfully');
    } catch (error) {
        console.error('Refresh error:', error);
        showError('Failed to refresh data');
    }
}

// Handle logout
function handleLogout() {
    window.location.href = '/auth/logout';
}

// Handle search
function handleSearch() {
    applyFilters();
}

// Handle filter changes
function handleFilter() {
    applyFilters();
}

// Apply search and filters
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const ratingFilter = document.getElementById('rating-filter').value;
    const sourceFilter = document.getElementById('source-filter').value;
    
    appState.filteredProducts = appState.products.filter(product => {
        // Search filter
        const matchesSearch = product.title.toLowerCase().includes(searchTerm) ||
                             product.vendor.toLowerCase().includes(searchTerm);
        
        // Rating filter
        let matchesRating = true;
        if (ratingFilter) {
            const minRating = parseInt(ratingFilter);
            const avgRating = product.reviews?.aggregated?.averageRating || 0;
            matchesRating = avgRating >= minRating;
        }
        
        // Source filter
        let matchesSource = true;
        if (sourceFilter) {
            const hasReviews = product.reviews?.[sourceFilter]?.length > 0;
            matchesSource = hasReviews;
        }
        
        return matchesSearch && matchesRating && matchesSource;
    });
    
    renderProducts();
    updateStats();
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/products/reviews');
        const data = await response.json();
        
        if (data.success) {
            appState.products = data.data;
            appState.filteredProducts = data.data;
            
            renderProducts();
            updateStats();
        } else {
            throw new Error(data.error || 'Failed to load data');
        }
    } catch (error) {
        console.error('Load data error:', error);
        showError('Failed to load products and reviews');
    }
}

// Render products
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    if (appState.filteredProducts.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6d7175;">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <p>No products found matching your criteria</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appState.filteredProducts.map(product => `
        <div class="product-card" onclick="openProductReviews('${product.id}', '${product.title}')">
            <div class="product-image">
                ${product.images && product.images.length > 0 
                    ? `<img src="${product.images[0].src}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">`
                    : '<i class="fas fa-image"></i>'
                }
            </div>
            <div class="product-info">
                <div class="product-title">${product.title}</div>
                <div class="product-meta">
                    <span class="product-vendor">${product.vendor}</span>
                    <div class="product-rating">
                        <div class="stars">
                            ${generateStars(product.reviews?.aggregated?.averageRating || 0)}
                        </div>
                        <span class="rating-text">${product.reviews?.aggregated?.averageRating || 0}</span>
                    </div>
                </div>
            </div>
            <div class="review-summary">
                <span class="review-count">${product.reviews?.aggregated?.totalReviews || 0} reviews</span>
                <span class="view-reviews">View Reviews</span>
            </div>
        </div>
    `).join('');
}

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Update statistics
function updateStats() {
    const totalProducts = appState.filteredProducts.length;
    const totalReviews = appState.filteredProducts.reduce((sum, product) => 
        sum + (product.reviews?.aggregated?.totalReviews || 0), 0);
    
    const allRatings = appState.filteredProducts
        .map(product => product.reviews?.aggregated?.averageRating || 0)
        .filter(rating => rating > 0);
    
    const avgRating = allRatings.length > 0 
        ? (allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length).toFixed(1)
        : '0.0';
    
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-reviews').textContent = totalReviews;
    document.getElementById('avg-rating').textContent = avgRating;
    document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
}

// Open product reviews modal
async function openProductReviews(productId, productTitle) {
    try {
        appState.currentProduct = { id: productId, title: productTitle };
        
        const response = await fetch(`/api/products/${productId}/reviews?title=${encodeURIComponent(productTitle)}`);
        const data = await response.json();
        
        if (data.success) {
            renderProductReviews(data.data, productTitle);
            document.getElementById('review-modal').style.display = 'flex';
        } else {
            throw new Error(data.error || 'Failed to load reviews');
        }
    } catch (error) {
        console.error('Load reviews error:', error);
        showError('Failed to load product reviews');
    }
}

// Render product reviews in modal
function renderProductReviews(reviews, productTitle) {
    const modalTitle = document.getElementById('modal-product-title');
    const modalContent = document.getElementById('modal-reviews-content');
    
    modalTitle.textContent = `${productTitle} - Reviews`;
    
    const { shopify, bol, aggregated } = reviews;
    
    modalContent.innerHTML = `
        <div class="review-summary-stats">
            <div class="overall-rating">
                <h3>Overall Rating</h3>
                <div class="rating-display">
                    <div class="stars large">${generateStars(aggregated.averageRating)}</div>
                    <div class="rating-number">${aggregated.averageRating}</div>
                    <div class="total-reviews">${aggregated.totalReviews} total reviews</div>
                </div>
            </div>
            <div class="rating-breakdown">
                <h4>Rating Distribution</h4>
                ${Object.entries(aggregated.ratingDistribution).reverse().map(([rating, count]) => `
                    <div class="rating-bar">
                        <span>${rating} stars</span>
                        <div class="bar-container">
                            <div class="bar" style="width: ${(count / aggregated.totalReviews) * 100}%"></div>
                        </div>
                        <span>${count}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="reviews-by-source">
            <div class="source-section">
                <h3><i class="fab fa-shopify"></i> Shopify Reviews (${shopify.length})</h3>
                ${renderReviewsList(shopify)}
            </div>
            
            <div class="source-section">
                <h3><i class="fas fa-shopping-cart"></i> Bol.com Reviews (${bol.length})</h3>
                ${renderReviewsList(bol)}
            </div>
        </div>
    `;
}

// Render reviews list
function renderReviewsList(reviews) {
    if (reviews.length === 0) {
        return '<p class="no-reviews">No reviews available from this source.</p>';
    }
    
    return reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="review-rating">
                    <div class="stars">${generateStars(review.rating)}</div>
                    <span class="review-title">${review.title}</span>
                </div>
                <div class="review-meta">
                    <span class="review-author">${review.author}</span>
                    <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
                    ${review.verified ? '<span class="verified-badge">Verified</span>' : ''}
                </div>
            </div>
            <div class="review-content">${review.content}</div>
        </div>
    `).join('');
}

// Close review modal
function closeReviewModal() {
    document.getElementById('review-modal').style.display = 'none';
    appState.currentProduct = null;
}

// Get shop from URL
function getShopFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('shop');
}

// Show loading state
function showLoading() {
    // You can implement a loading indicator here
}

// Show success message
function showSuccess(message) {
    // You can implement a success notification here
    console.log('Success:', message);
}

// Show error message
function showError(message) {
    // You can implement an error notification here
    console.error('Error:', message);
    alert(message);
} 