import fs from 'fs';
import path from 'path';
import {
  Category,
  Product,
  Review,
  Order,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_ORDERS
} from './seed';

// On Vercel, the main project directory is read-only. We must write to /tmp.
const IS_VERCEL = process.env.VERCEL === '1' || process.env.NOW_BUILDER === '1';
const BUNDLED_DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');
const WRITE_DB_PATH = IS_VERCEL ? path.join('/tmp', 'db.json') : BUNDLED_DB_PATH;

// Production JSON bin URL to persist db.json across Vercel serverless containers
const KV_DB_URL = 'https://jsonbin-zeta.vercel.app/api/bins/cAIvJyC1GT';

interface DatabaseSchema {
  categories: Category[];
  products: Product[];
  reviews: Review[];
  orders: Order[];
}

// Global in-memory cache to prevent redundant filesystem/network reads on active containers
let memoryCache: DatabaseSchema | null = null;

function readLocalDb(): DatabaseSchema {
  try {
    if (fs.existsSync(WRITE_DB_PATH)) {
      const content = fs.readFileSync(WRITE_DB_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to read local database file:', err);
  }
  
  try {
    if (fs.existsSync(BUNDLED_DB_PATH)) {
      const content = fs.readFileSync(BUNDLED_DB_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {}

  return {
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    reviews: INITIAL_REVIEWS,
    orders: INITIAL_ORDERS
  };
}

function initDb(): DatabaseSchema {
  if (memoryCache) {
    return memoryCache;
  }

  if (fs.existsSync(WRITE_DB_PATH)) {
    memoryCache = readLocalDb();
    return memoryCache;
  }

  const fallbackData = readLocalDb();
  memoryCache = fallbackData;

  try {
    if (IS_VERCEL) {
      fs.writeFileSync(WRITE_DB_PATH, JSON.stringify(fallbackData, null, 2), 'utf-8');
      // Background initialize the remote KV store on first cold-start
      saveToRemote(fallbackData).catch(err => console.error('Background init remote failed:', err));
    } else {
      const dir = path.dirname(WRITE_DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(WRITE_DB_PATH, JSON.stringify(fallbackData, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to initialize database file:', err);
  }

  return memoryCache;
}

// Fetch database state asynchronously from the KV store
export async function syncFromRemote(): Promise<DatabaseSchema> {
  try {
    const res = await fetch(KV_DB_URL);
    if (res.ok) {
      const remoteData = await res.json() as DatabaseSchema;
      if (remoteData && Array.isArray(remoteData.orders)) {
        memoryCache = remoteData;
        try {
          fs.writeFileSync(WRITE_DB_PATH, JSON.stringify(remoteData, null, 2), 'utf-8');
        } catch (e) {}
        return remoteData;
      }
    }
  } catch (err) {
    console.error('Failed to sync from remote KV store:', err);
  }
  return initDb();
}

// Push database state asynchronously to the KV store
async function saveToRemote(data: DatabaseSchema) {
  try {
    await fetch(KV_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error('Failed to push database to remote KV store:', err);
  }
}

async function saveDb(data: DatabaseSchema) {
  memoryCache = data;
  
  try {
    fs.writeFileSync(WRITE_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save database file:', error);
  }

  // Await online sync on Vercel to guarantee saving before serverless function exits
  if (IS_VERCEL) {
    await saveToRemote(data);
  }
}

// Category Operations
export function getCategories(): Category[] {
  const db = initDb();
  return db.categories;
}

export async function saveCategory(category: Category): Promise<Category> {
  const db = initDb();
  const index = db.categories.findIndex(c => c.id === category.id);
  if (index >= 0) {
    db.categories[index] = category;
  } else {
    db.categories.push(category);
  }
  await saveDb(db);
  return category;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const db = initDb();
  const initialLength = db.categories.length;
  db.categories = db.categories.filter(c => c.id !== id);
  if (db.categories.length !== initialLength) {
    await saveDb(db);
    return true;
  }
  return false;
}

// Product Operations
export function getProducts(): Product[] {
  const db = initDb();
  return db.products;
}

export function getProductById(id: string): Product | undefined {
  const db = initDb();
  return db.products.find(p => p.id === id || p.slug === id);
}

export async function saveProduct(product: Product): Promise<Product> {
  const db = initDb();
  const index = db.products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    // Keep structural data that doesn't change from admin if needed, e.g. rating
    const existing = db.products[index];
    db.products[index] = {
      ...product,
      rating: existing.rating,
      reviewCount: existing.reviewCount
    };
  } else {
    db.products.push({
      ...product,
      rating: 5.0,
      reviewCount: 0
    });
  }
  await saveDb(db);
  return product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = initDb();
  const initialLength = db.products.length;
  db.products = db.products.filter(p => p.id !== id);
  if (db.products.length !== initialLength) {
    await saveDb(db);
    return true;
  }
  return false;
}

// Review Operations
export function getReviews(productId?: string): Review[] {
  const db = initDb();
  if (productId) {
    return db.reviews.filter(r => r.productId === productId);
  }
  return db.reviews;
}

export async function addReview(productId: string, userName: string, rating: number, comment: string): Promise<Review> {
  const db = initDb();
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    userName,
    rating,
    comment,
    createdAt: new Date().toISOString()
  };
  
  db.reviews.push(newReview);
  
  // Update Product's rating / reviewCount
  const productIndex = db.products.findIndex(p => p.id === productId);
  if (productIndex >= 0) {
    const product = db.products[productIndex];
    const productReviews = db.reviews.filter(r => r.productId === productId);
    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    
    product.reviewCount = productReviews.length;
    product.rating = Number((totalRating / productReviews.length).toFixed(1));
    db.products[productIndex] = product;
  }
  
  await saveDb(db);
  return newReview;
}

// Order Operations
export function getOrders(): Order[] {
  const db = initDb();
  // Sort newest first
  return db.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOrderById(id: string): Order | undefined {
  const db = initDb();
  return db.orders.find(o => o.id === id);
}

export async function saveOrder(order: Order): Promise<Order> {
  const db = initDb();
  const index = db.orders.findIndex(o => o.id === order.id);
  if (index >= 0) {
    db.orders[index] = order;
  } else {
    db.orders.push(order);
    
    // Decrement stock for purchased products
    order.items.forEach(item => {
      const prodIdx = db.products.findIndex(p => p.id === item.productId);
      if (prodIdx >= 0) {
        db.products[prodIdx].stock = Math.max(0, db.products[prodIdx].stock - item.quantity);
      }
    });
  }
  await saveDb(db);
  return order;
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
  const db = initDb();
  const index = db.orders.findIndex(o => o.id === id);
  if (index >= 0) {
    const oldStatus = db.orders[index].status;
    
    // If transitioning to Cancelled from a non-Cancelled status, restore product stock
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      db.orders[index].items.forEach(item => {
        const prodIdx = db.products.findIndex(p => p.id === item.productId);
        if (prodIdx >= 0) {
          db.products[prodIdx].stock += item.quantity;
        }
      });
    }
    // If restoring a Cancelled order back to a live state, decrement product stock again
    else if (oldStatus === 'Cancelled' && status !== 'Cancelled') {
      db.orders[index].items.forEach(item => {
        const prodIdx = db.products.findIndex(p => p.id === item.productId);
        if (prodIdx >= 0) {
          db.products[prodIdx].stock = Math.max(0, db.products[prodIdx].stock - item.quantity);
        }
      });
    }

    db.orders[index].status = status;
    await saveDb(db);
    return true;
  }
  return false;
}
