const express = require('express');
const multer = require('multer');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const supabase = SUPABASE_ENABLED
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Replace the old fs.mkdirSync line with this:
if (!process.env.VERCEL) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOAD_DIR));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});

function safeList(value, fallback = []) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch (error) {
      // Fall through to CSV parsing.
    }

    return trimmed
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  return fallback;
}

function toNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeProduct(product) {
  const images = safeList(product.images, []);
  const primaryImage = product.image || images[0] || '/images/products/default.jpg';

  return {
    id: String(product.id),
    name: product.name || '',
    category: product.category || '',
    price: toNumber(product.price),
    originalPrice: product.originalPrice !== undefined ? toNumber(product.originalPrice) : null,
    description: product.description || '',
    image: primaryImage,
    images: images.length ? images : [primaryImage],
    sizes: safeList(product.sizes, []),
    colors: safeList(product.colors, []),
    featured: Boolean(product.featured),
    inStock: product.inStock !== undefined ? Boolean(product.inStock) : product.in_stock !== undefined ? Boolean(product.in_stock) : true,
    createdAt: product.createdAt || product.created_at || new Date().toISOString()
  };
}

function normalizeOrder(order) {
  return {
    id: String(order.id),
    items: Array.isArray(order.items) ? order.items : [],
    customer: order.customer || {},
    paymentMethod: order.paymentMethod || order.payment_method || 'cod',
    status: order.status || 'pending',
    date: order.date || new Date().toISOString(),
    total: toNumber(order.total)
  };
}

async function readJson(filePath, fallback) {
  try {
    const content = await fsp.readFile(filePath, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fsp.writeFile(filePath, JSON.stringify(value, null, 2));
}

async function loadProducts() {
  if (SUPABASE_ENABLED) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(row => normalizeProduct({
      ...row,
      originalPrice: row.original_price
    }));
  }

  const products = await readJson(PRODUCTS_FILE, []);
  return products.map(normalizeProduct).sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

async function loadProductById(id) {
  if (SUPABASE_ENABLED) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? normalizeProduct({
      ...data,
      originalPrice: data.original_price
    }) : null;
  }

  const products = await readJson(PRODUCTS_FILE, []);
  const product = products.find(item => String(item.id) === String(id));
  return product ? normalizeProduct(product) : null;
}

async function uploadFiles(files, folder) {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadedUrls = [];

  for (const file of files) {
    const safeExtension = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExtension}`;

    if (SUPABASE_ENABLED) {
      const objectPath = `${folder}/${fileName}`;
      const { error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(objectPath, file.buffer, {
          contentType: file.mimetype || 'image/jpeg',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(objectPath);
      uploadedUrls.push(data.publicUrl);
      continue;
    }

    const localPath = path.join(UPLOAD_DIR, fileName);
    await fsp.writeFile(localPath, file.buffer);
    uploadedUrls.push(`/uploads/${fileName}`);
  }

  return uploadedUrls;
}

async function deleteStoredFiles(urls) {
  if (!urls || urls.length === 0) {
    return;
  }

  if (SUPABASE_ENABLED) {
    const files = urls
      .map(url => {
        if (!url || !url.includes('/storage/v1/object/public/')) {
          return null;
        }

        const marker = `/object/public/${SUPABASE_BUCKET}/`;
        const markerIndex = url.indexOf(marker);
        if (markerIndex === -1) {
          return null;
        }

        return url.slice(markerIndex + marker.length);
      })
      .filter(Boolean);

    if (files.length > 0) {
      await supabase.storage.from(SUPABASE_BUCKET).remove(files);
    }

    return;
  }

  for (const url of urls) {
    if (!url || !url.startsWith('/uploads/')) {
      continue;
    }

    const fileName = path.basename(url);
    const filePath = path.join(UPLOAD_DIR, fileName);

    try {
      await fsp.unlink(filePath);
    } catch (error) {
      // Ignore missing files during cleanup.
    }
  }
}

function buildProductPayload(body, existingProduct = null, imageUrls = []) {
  const existingImages = existingProduct ? existingProduct.images : [];
  const combinedImages = imageUrls.length > 0 ? [...existingImages, ...imageUrls] : existingImages;
  const images = combinedImages.length > 0 ? combinedImages : [existingProduct?.image || '/images/products/default.jpg'];

  return normalizeProduct({
    id: existingProduct ? existingProduct.id : Date.now().toString(),
    name: body.name || existingProduct?.name || '',
    category: body.category || existingProduct?.category || '',
    price: body.price !== undefined ? toNumber(body.price) : existingProduct?.price || 0,
    originalPrice: body.originalPrice !== undefined && body.originalPrice !== '' ? toNumber(body.originalPrice) : existingProduct?.originalPrice || null,
    description: body.description || existingProduct?.description || '',
    image: images[0],
    images,
    sizes: body.sizes !== undefined ? safeList(body.sizes, []) : existingProduct?.sizes || [],
    colors: body.colors !== undefined ? safeList(body.colors, []) : existingProduct?.colors || [],
    featured: body.featured !== undefined ? body.featured === 'true' || body.featured === true : existingProduct?.featured || false,
    inStock: body.inStock !== undefined ? body.inStock === 'true' || body.inStock === true : existingProduct?.inStock ?? true,
    createdAt: existingProduct?.createdAt || new Date().toISOString()
  });
}

async function saveProduct(product) {
  if (SUPABASE_ENABLED) {
    const row = {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      original_price: product.originalPrice,
      description: product.description,
      image: product.image,
      images: product.images,
      sizes: product.sizes,
      colors: product.colors,
      featured: product.featured,
      in_stock: product.inStock,
      created_at: product.createdAt
    };

    const { error } = await supabase.from('products').upsert([row]);
    if (error) {
      throw error;
    }

    return product;
  }

  const products = await readJson(PRODUCTS_FILE, []);
  const productIndex = products.findIndex(item => String(item.id) === String(product.id));

  if (productIndex === -1) {
    products.unshift(product);
  } else {
    products[productIndex] = product;
  }

  await writeJson(PRODUCTS_FILE, products);
  return product;
}

async function removeProduct(id) {
  const existingProduct = await loadProductById(id);

  if (!existingProduct) {
    return null;
  }

  await deleteStoredFiles(existingProduct.images);

  if (SUPABASE_ENABLED) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      throw error;
    }

    return existingProduct;
  }

  const products = await readJson(PRODUCTS_FILE, []);
  const filteredProducts = products.filter(item => String(item.id) !== String(id));
  await writeJson(PRODUCTS_FILE, filteredProducts);

  return existingProduct;
}

async function loadOrders() {
  if (SUPABASE_ENABLED) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(normalizeOrder);
  }

  const orders = await readJson(ORDERS_FILE, []);
  return orders.map(normalizeOrder).sort((left, right) => new Date(right.date) - new Date(left.date));
}

async function saveOrder(order) {
  if (SUPABASE_ENABLED) {
    const row = {
      id: order.id,
      items: order.items,
      customer: order.customer,
      payment_method: order.paymentMethod,
      status: order.status,
      date: order.date,
      total: order.total
    };

    const { error } = await supabase.from('orders').insert([row]);
    if (error) {
      throw error;
    }

    return order;
  }

  const orders = await readJson(ORDERS_FILE, []);
  orders.unshift(order);
  await writeJson(ORDERS_FILE, orders);

  return order;
}

async function updateOrderStatus(id, status) {
  if (SUPABASE_ENABLED) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) {
      throw error;
    }

    return { id, status };
  }

  const orders = await readJson(ORDERS_FILE, []);
  const orderIndex = orders.findIndex(item => String(item.id) === String(id));

  if (orderIndex === -1) {
    return null;
  }

  orders[orderIndex].status = status;
  await writeJson(ORDERS_FILE, orders);
  return orders[orderIndex];
}

async function loadSettings() {
  if (SUPABASE_ENABLED) {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'site_settings')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data?.value || {};
  }

  return await readJson(SETTINGS_FILE, {});
}

async function saveSettings(settings) {
  if (SUPABASE_ENABLED) {
    const { error } = await supabase
      .from('settings')
      .upsert([{ key: 'site_settings', value: settings }]);
    
    if (error) {
      throw error;
    }

    return settings;
  }

  await writeJson(SETTINGS_FILE, settings);
  return settings;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/cart.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await loadProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await loadProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load product' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    return res.json({ success: true, token: 'admin-token' });
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.get('/api/admin/products', async (req, res) => {
  try {
    const products = await loadProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load products' });
  }
});

app.post('/api/admin/products', upload.array('images', 8), async (req, res) => {
  try {
    const uploadedUrls = await uploadFiles(req.files, 'products');
    const product = buildProductPayload(req.body, null, uploadedUrls);
    const savedProduct = await saveProduct(product);

    res.json({ success: true, product: savedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error saving product' });
  }
});

app.put('/api/admin/products/:id', upload.array('images', 8), async (req, res) => {
  try {
    const existingProduct = await loadProductById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const uploadedUrls = await uploadFiles(req.files, 'products');
    const updatedProduct = buildProductPayload(req.body, existingProduct, uploadedUrls);
    const savedProduct = await saveProduct(updatedProduct);

    res.json({ success: true, product: savedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating product' });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const deletedProduct = await removeProduct(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting product' });
  }
});

app.post('/api/checkout', async (req, res) => {
  try {
    const { items = [], customer = {}, paymentMethod = 'cod' } = req.body;

    const total = Array.isArray(items)
      ? items.reduce((sum, item) => sum + (toNumber(item.price) * toNumber(item.quantity, 1)), 0)
      : 0;

    const order = normalizeOrder({
      id: Date.now().toString(),
      items,
      customer,
      paymentMethod,
      status: 'pending',
      date: new Date().toISOString(),
      total
    });

    await saveOrder(order);

    res.json({
      success: true,
      order,
      message: 'Order placed successfully! You will receive confirmation soon.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error placing order' });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await loadOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json([]);
  }
});

app.put('/api/admin/orders/:id', async (req, res) => {
  try {
    const updatedOrder = await updateOrderStatus(req.params.id, req.body.status);

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order' });
  }
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'dashboard.html'));
});

// Get hero image setting
app.get('/api/admin/settings/hero-image', async (req, res) => {
  try {
    const settings = await loadSettings();
    res.json({ 
      success: true, 
      heroImage: settings.heroImage || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=900&fit=crop'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading settings' });
  }
});

// Upload hero image
app.post('/api/admin/settings/hero-image', upload.single('heroImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const uploadedUrls = await uploadFiles([req.file], 'hero');
    
    if (uploadedUrls.length === 0) {
      return res.status(500).json({ success: false, message: 'Failed to upload image' });
    }

    const settings = await loadSettings();
    const oldHeroImage = settings.heroImage;

    settings.heroImage = uploadedUrls[0];
    await saveSettings(settings);

    // Delete old hero image if it exists and is not the default
    if (oldHeroImage && !oldHeroImage.includes('unsplash.com')) {
      await deleteStoredFiles([oldHeroImage]);
    }

    res.json({ 
      success: true, 
      heroImage: settings.heroImage,
      message: 'Hero image updated successfully'
    });
  } catch (error) {
    console.error('Error uploading hero image:', error);
    res.status(500).json({ success: false, message: error.message || 'Error uploading hero image' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});