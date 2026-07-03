// Cart page functionality
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.querySelector('.cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = totalItems;
    }
}

function displayCart() {
    const cart = getCart();
    const cartItemsEl = document.getElementById('cart-items');
    const cartSummaryEl = document.getElementById('cart-summary');
    const emptyCartEl = document.getElementById('empty-cart');

    if (cart.length === 0) {
        if (cartItemsEl) cartItemsEl.innerHTML = '';
        if (emptyCartEl) emptyCartEl.style.display = 'block';
        if (cartSummaryEl) cartSummaryEl.style.display = 'none';
        return;
    }

    if (emptyCartEl) emptyCartEl.style.display = 'none';
    if (cartSummaryEl) cartSummaryEl.style.display = 'block';

    if (cartItemsEl) {
        cartItemsEl.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/150?text=Product'">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>${item.category}</p>
                    <p style="color: var(--primary-color); font-weight: 600;">$${item.price.toFixed(2)}</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span style="font-weight: 600; min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <div>
                    <p style="font-weight: 600; font-size: 1.2rem;">$${(item.price * item.quantity).toFixed(2)}</p>
                    <button onclick="removeItem(${index})" style="color: #d32f2f; background: none; border: none; cursor: pointer; margin-top: 10px;">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateSummary(cart);
}

function updateQuantity(index, change) {
    const cart = getCart();
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    saveCart(cart);
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
}

function updateSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

function checkout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Create checkout modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        overflow-y: auto;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 10px; max-width: 600px; width: 100%; margin: auto;">
            <h2 style="font-family: 'Playfair Display', serif; margin-bottom: 20px; font-size: 1.8rem;">Complete Your Order</h2>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Full Name</label>
                <input type="text" id="checkout-name" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Phone Number</label>
                <input type="tel" id="checkout-phone" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Delivery Address</label>
                <textarea id="checkout-address" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem; resize: vertical;"></textarea>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Payment Method</label>
                <select id="checkout-payment" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;">
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="easypaisa">EasyPaisa</option>
                </select>
            </div>
            
            <div id="payment-instructions" style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; display: none; font-size: 0.95rem;">
                <!-- Content injected dynamically via JavaScript below -->
            </div>
            
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="confirmCheckout()" style="flex: 1; min-width: 140px; padding: 12px; background: #8b7355; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                    Place Order
                </button>
                <button onclick="this.closest('div').parentElement.parentElement.remove()" style="flex: 1; min-width: 140px; padding: 12px; background: #ddd; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const paymentSelect = document.getElementById('checkout-payment');
    const paymentInstructions = document.getElementById('payment-instructions');
    
    paymentSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        
        if (value === 'jazzcash') {
            paymentInstructions.style.display = 'block';
            paymentInstructions.innerHTML = `
                <p style="margin: 0; font-size: 0.9rem;">
                    <strong>JazzCash Payment Instructions:</strong><br>
                    Send payment to: <strong>03058917477</strong> (Syed Izan Abbas)<br>
                    After payment, send screenshot via <a href="https://wa.me/923135591513" target="_blank" style="color: #25d366; font-weight: bold;">WhatsApp</a>
                </p>
            `;
        } else if (value === 'easypaisa') {
            paymentInstructions.style.display = 'block';
            paymentInstructions.innerHTML = `
                <p style="margin: 0; font-size: 0.9rem;">
                    <strong>EasyPaisa Payment Instructions:</strong><br>
                    Send payment to: <strong>03135591513</strong> (Syed Izan Abbas)<br>
                    After payment, send screenshot via <a href="https://wa.me/923135591513" target="_blank" style="color: #25d366; font-weight: bold;">WhatsApp</a>
                </p>
            `;
        } else {
            paymentInstructions.style.display = 'none';
        }
    });
}

function confirmCheckout() {
    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const address = document.getElementById('checkout-address').value;
    const payment = document.getElementById('checkout-payment').value;
    
    if (!name || !phone || !address) {
        alert('Please fill in all fields!');
        return;
    }
    
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: cart,
            customer: { name, phone, address },
            paymentMethod: payment,
            total
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.removeItem('cart');
            alert(`Order placed successfully! Order ID: ${data.order.id}\n\nWe will contact you soon to confirm your order.`);
            window.location.href = '/';
        } else {
            alert('Error placing order. Please try again.');
        }
    })
    .catch(error => {
        console.error('Checkout error:', error);
        alert('Error placing order. Please try again.');
    });
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    displayCart();
});