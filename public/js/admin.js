// Check authentication
if (!localStorage.getItem('admin-token')) {
    window.location.href = '/admin';
}

let editingProductId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Show/hide sections
function showSection(section) {
    document.getElementById('products-section').style.display = 'none';
    document.getElementById('orders-section').style.display = 'none';
    document.getElementById('add-product-section').style.display = 'none';
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (section === 'products') {
        document.getElementById('products-section').style.display = 'block';
        document.getElementById('page-title').textContent = 'Products';
        document.querySelectorAll('.nav-item')[0].classList.add('active');
    } else if (section === 'orders') {
        document.getElementById('orders-section').style.display = 'block';
        document.getElementById('page-title').textContent = 'Orders';
        document.querySelectorAll('.nav-item')[1].classList.add('active');
        loadOrders();
    } else if (section === 'add-product') {
        document.getElementById('add-product-section').style.display = 'block';
        document.getElementById('page-title').textContent = 'Add Product';
        document.getElementById('form-title').textContent = editingProductId ? 'Edit Product' : 'Add New Product';
        document.querySelectorAll('.nav-item')[2].classList.add('active');
    }
}

// Load all products
async function loadProducts() {
    try {
        const response = await fetch('/api/admin/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products in grid
function displayProducts(products) {
    const container = document.getElementById('products-list');
    
    if (products.length === 0) {
        container.innerHTML = '<p>No products found. Add your first product!</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/280x250?text=${product.name}'">
            <div class="product-card-info">
                <h3>${product.name}</h3>
                <div class="category">${product.category}</div>
                <div class="price">$${product.price.toFixed(2)}</div>
                ${product.featured ? '<span style="background: #d4af37; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Featured</span>' : ''}
                ${!product.inStock ? '<span style="background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 5px;">Out of Stock</span>' : ''}
                <div class="product-actions" style="margin-top: 15px;">
                    <button class="btn-edit" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Handle form submission
document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    if (editingProductId) {
        formData.append('id', editingProductId);
    }
    
    formData.append('name', document.getElementById('product-name').value);
    formData.append('category', document.getElementById('product-category').value);
    formData.append('price', document.getElementById('product-price').value);
    formData.append('description', document.getElementById('product-description').value);
    formData.append('sizes', document.getElementById('product-sizes').value);
    formData.append('colors', document.getElementById('product-colors').value);
    formData.append('featured', document.getElementById('product-featured').checked);
    formData.append('inStock', document.getElementById('product-instock').checked);
    
    const imageFiles = document.getElementById('product-images').files;
    for (const imageFile of imageFiles) {
        formData.append('images', imageFile);
    }
    
    try {
        const url = editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products';
        const method = editingProductId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
            cancelEdit();
            loadProducts();
            showSection('products');
        } else {
            alert('Error saving product: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product. Please try again.');
    }
});

// Edit product
async function editProduct(id) {
    editingProductId = id;
    
    try {
        const response = await fetch(`/api/products/${id}`);
        const product = await response.json();
        
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-sizes').value = product.sizes.join(', ');
        document.getElementById('product-colors').value = product.colors.join(', ');
        document.getElementById('product-featured').checked = product.featured;
        document.getElementById('product-instock').checked = product.inStock;
        
        showSection('add-product');
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product details');
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/products/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Product deleted successfully!');
            loadProducts();
        } else {
            alert('Error deleting product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
    }
}

// Cancel edit
function cancelEdit() {
    editingProductId = null;
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('form-title').textContent = 'Add New Product';
}

// Logout
function logout() {
    localStorage.removeItem('admin-token');
    window.location.href = '/admin';
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch('/api/admin/orders');
        const orders = await response.json();
        displayOrders(orders);
        updateOrderStats(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Display orders
function displayOrders(orders) {
    const container = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No orders yet</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-card" style="background: white; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin-bottom: 15px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 20px; align-items: center;">
                <div>
                    <strong style="display: block; font-size: 1.1rem; margin-bottom: 5px;">Order #${order.id.slice(-8)}</strong>
                    <small style="color: #666;">${new Date(order.date).toLocaleString()}</small>
                </div>
                <div>
                    <strong>${order.customer.name}</strong><br>
                    <small style="color: #666;">${order.customer.phone}</small>
                </div>
                <div>
                    <strong style="font-size: 1.2rem; color: #8b7355;">$${order.total.toFixed(2)}</strong><br>
                    <small style="color: #666;">${order.paymentMethod.toUpperCase()}</small>
                </div>
                <div>
                    <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 5px; background: ${getStatusColor(order.status)}; color: white; font-weight: 600;">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                <strong>Items:</strong>
                <ul style="margin: 10px 0 0 20px;">
                    ${order.items.map(item => `
                        <li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
                    `).join('')}
                </ul>
                <div style="margin-top: 10px;">
                    <strong>Delivery Address:</strong> ${order.customer.address}
                </div>
            </div>
        </div>
    `).join('');
}

// Update order stats
function updateOrderStats(orders) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('pending-orders').textContent = pendingOrders;
    document.getElementById('completed-orders').textContent = completedOrders;
    document.getElementById('total-revenue').textContent = '$' + totalRevenue.toFixed(2);
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadOrders();
        } else {
            alert('Error updating order status');
        }
    } catch (error) {
        console.error('Error updating order:', error);
        alert('Error updating order status');
    }
}

// Get status color
function getStatusColor(status) {
    const colors = {
        'pending': '#ff9800',
        'processing': '#2196f3',
        'shipped': '#9c27b0',
        'delivered': '#4caf50',
        'cancelled': '#f44336'
    };
    return colors[status] || '#999';
}
