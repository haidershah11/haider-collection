let productCatalog = [];
let activeProductId = null;

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
    setupProductModal();
    bindProductGridEvents();
    setupMobileMenu();
    loadHeroImage();
});

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        productCatalog = Array.isArray(products) ? products : [];
        displayProducts(productCatalog);
        displayFeaturedProducts(productCatalog.filter(product => product.featured));
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products in grid
function displayProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = products.map(product => {
        const hasDiscount = product.originalPrice && product.originalPrice > product.price;
        const priceHTML = hasDiscount 
            ? `<div class="product-price">
                <span style="text-decoration: line-through; color: #999; font-size: 1.1rem; margin-right: 8px;">PKR ${product.originalPrice.toFixed(2)}</span>
                <span style="color: #d32f2f; font-weight: 700;">PKR ${product.price.toFixed(2)}</span>
               </div>`
            : `<div class="product-price">PKR ${product.price.toFixed(2)}</div>`;
        
        return `
        <article class="product-card product-card--clickable" data-product-id="${product.id}" tabindex="0" role="button" aria-label="Open details for ${product.name}">
            <img src="${getPrimaryImage(product)}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/400x500?text=${encodeURIComponent(product.name)}'">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${parseWhatsAppFormatting(product.description)}</p>
                ${priceHTML}
                <div class="product-actions">
                    <button class="btn-secondary-outline" type="button" data-open-product="${product.id}">View Details</button>
                    <button class="btn-add-cart" type="button" data-add-to-cart="${product.id}">Add to Cart</button>
                </div>
            </div>
        </article>
    `;
    }).join('');
}

function displayFeaturedProducts(products) {
    const container = document.querySelector('.featured-slider');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #777;">Featured products will appear here soon.</p>';
        return;
    }

    container.innerHTML = products.slice(0, 4).map(product => {
        const hasDiscount = product.originalPrice && product.originalPrice > product.price;
        const priceHTML = hasDiscount 
            ? `<div class="product-price">
                <span style="text-decoration: line-through; color: #999; font-size: 1.1rem; margin-right: 8px;">PKR ${product.originalPrice.toFixed(2)}</span>
                <span style="color: #d32f2f; font-weight: 700;">PKR ${product.price.toFixed(2)}</span>
               </div>`
            : `<div class="product-price">PKR ${product.price.toFixed(2)}</div>`;
        
        return `
        <article class="featured-product-card product-card--clickable" data-product-id="${product.id}" tabindex="0" role="button" aria-label="Open details for ${product.name}">
            <img src="${getPrimaryImage(product)}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/400x500?text=${encodeURIComponent(product.name)}'">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${parseWhatsAppFormatting(product.description)}</p>
                ${priceHTML}
                <div class="product-actions">
                    <button class="btn-secondary-outline" type="button" data-open-product="${product.id}">View Details</button>
                    <button class="btn-add-cart" type="button" data-add-to-cart="${product.id}">Add to Cart</button>
                </div>
            </div>
        </article>
    `;
    }).join('');
}

function bindProductGridEvents() {
    ['products-container', 'featured-slider'].forEach(containerId => {
        const container = document.getElementById(containerId) || document.querySelector(`.${containerId}`);
        if (!container) return;

        container.addEventListener('click', event => {
            const addButton = event.target.closest('[data-add-to-cart]');
            if (addButton) {
                event.stopPropagation();
                addToCart(addButton.dataset.addToCart);
                return;
            }

            const openButton = event.target.closest('[data-open-product]');
            if (openButton) {
                event.stopPropagation();
                openProductDetails(openButton.dataset.openProduct);
                return;
            }

            const productCard = event.target.closest('[data-product-id]');
            if (productCard) {
                openProductDetails(productCard.dataset.productId);
            }
        });

        container.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            const productCard = event.target.closest('[data-product-id]');
            if (productCard) {
                event.preventDefault();
                openProductDetails(productCard.dataset.productId);
            }
        });
    });
}

function getPrimaryImage(product) {
    if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0];
    }

    return product.image || 'https://via.placeholder.com/400x500?text=Product';
}

// Parse WhatsApp-style formatting
function parseWhatsAppFormatting(text) {
    if (!text) return '';
    
    // Convert **text** to <strong>text</strong> (bold)
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convert newlines to <br> tags
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

function getProductById(productId) {
    return productCatalog.find(product => String(product.id) === String(productId));
}

function setupProductModal() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    modal.addEventListener('click', event => {
        if (event.target.closest('[data-modal-close]')) {
            closeProductModal();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeProductModal();
        }
    });

    const addButton = document.getElementById('product-modal-add');
    if (addButton) {
        addButton.addEventListener('click', () => {
            if (activeProductId) {
                addToCart(activeProductId);
            }
            closeProductModal();
        });
    }
}

function openProductDetails(productId) {
    const product = getProductById(productId);
    if (!product) {
        fetch(`/api/products/${productId}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.id) {
                    productCatalog = productCatalog.filter(item => String(item.id) !== String(data.id)).concat(data);
                    showProductModal(data);
                }
            })
            .catch(error => console.error('Error loading product details:', error));
        return;
    }

    showProductModal(product);
}

function showProductModal(product) {
    const modal = document.getElementById('product-modal');
    const mainImage = document.getElementById('product-modal-main-image');
    const thumbs = document.getElementById('product-modal-thumbs');
    const category = document.getElementById('product-modal-category');
    const title = document.getElementById('product-modal-title');
    const price = document.getElementById('product-modal-price');
    const description = document.getElementById('product-modal-description');
    const sizes = document.getElementById('product-modal-sizes');
    const colors = document.getElementById('product-modal-colors');

    if (!modal || !mainImage || !thumbs || !category || !title || !price || !description || !sizes || !colors) {
        return;
    }

    const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [getPrimaryImage(product)];
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;

    activeProductId = product.id;
    category.textContent = product.category;
    title.textContent = product.name;
    
    // Display price with discount if applicable
    if (hasDiscount) {
        price.innerHTML = `
            <span style="text-decoration: line-through; color: #999; font-size: 1.5rem; margin-right: 10px;">PKR ${product.originalPrice.toFixed(2)}</span>
            <span style="color: #d32f2f;">PKR ${product.price.toFixed(2)}</span>
        `;
    } else {
        price.textContent = `PKR ${product.price.toFixed(2)}`;
    }
    
    description.innerHTML = parseWhatsAppFormatting(product.description);
    mainImage.src = images[0];
    mainImage.alt = product.name;

    sizes.innerHTML = (product.sizes || []).map(size => `<span class="chip">${size}</span>`).join('') || '<span class="chip chip-empty">One Size</span>';
    colors.innerHTML = (product.colors || []).map(color => `<span class="chip">${color}</span>`).join('') || '<span class="chip chip-empty">Standard</span>';

    thumbs.innerHTML = images.map((image, index) => `
        <button type="button" class="thumb ${index === 0 ? 'active' : ''}" data-image-src="${image}">
            <img src="${image}" alt="${product.name} image ${index + 1}" onerror="this.src='https://via.placeholder.com/100x100?text=Image'">
        </button>
    `).join('');

    thumbs.querySelectorAll('[data-image-src]').forEach(button => {
        button.addEventListener('click', () => {
            mainImage.src = button.dataset.imageSrc;
            thumbs.querySelectorAll('.thumb').forEach(item => item.classList.remove('active'));
            button.classList.add('active');
        });
    });

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    activeProductId = null;
}

// Cart functions
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId) {
    fetch(`/api/products/${productId}`)
        .then(res => res.json())
        .then(product => {
            let cart = getCart();
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    ...product,
                    quantity: 1
                });
            }
            
            saveCart(cart);
            showNotification('Added to cart!');
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
            showNotification('Error adding to cart', 'error');
        });
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.querySelector('.cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = totalItems;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function setupMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (!menuBtn || !nav) return;
    
    menuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        if (nav.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });
    
    // Close menu when clicking on a link
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            const icon = menuBtn.querySelector('i');
            icon.className = 'fas fa-bars';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !menuBtn.contains(e.target) && nav.classList.contains('active')) {
            nav.classList.remove('active');
            const icon = menuBtn.querySelector('i');
            icon.className = 'fas fa-bars';
        }
    });
}

// Load hero image
async function loadHeroImage() {
    try {
        const response = await fetch('/api/admin/settings/hero-image');
        const data = await response.json();
        
        if (data.success && data.heroImage) {
            const heroMedia = document.querySelector('.hero-media img');
            if (heroMedia) {
                heroMedia.src = data.heroImage;
                heroMedia.onerror = function() {
                    this.src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=900&fit=crop';
                };
            }
        }
    } catch (error) {
        console.error('Error loading hero image:', error);
        // Fallback to default image
        const heroMedia = document.querySelector('.hero-media img');
        if (heroMedia) {
            heroMedia.src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=900&fit=crop';
        }
    }
}
