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

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

interface DatabaseSchema {
  categories: Category[];
  products: Product[];
  reviews: Review[];
  orders: Order[];
}

function initDb(): DatabaseSchema {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE_PATH)) {
    const defaultData: DatabaseSchema = {
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      reviews: INITIAL_REVIEWS,
      orders: INITIAL_ORDERS
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }

  try {
    const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse database file, resetting to seed data:', error);
    const defaultData: DatabaseSchema = {
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      reviews: INITIAL_REVIEWS,
      orders: INITIAL_ORDERS
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
}

function saveDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save database file:', error);
  }
}

// Category Operations
export function getCategories(): Category[] {
  const db = initDb();
  return db.categories;
}

export function saveCategory(category: Category): Category {
  const db = initDb();
  const index = db.categories.findIndex(c => c.id === category.id);
  if (index >= 0) {
    db.categories[index] = category;
  } else {
    db.categories.push(category);
  }
  saveDb(db);
  return category;
}

export function deleteCategory(id: string): boolean {
  const db = initDb();
  const initialLength = db.categories.length;
  db.categories = db.categories.filter(c => c.id !== id);
  if (db.categories.length !== initialLength) {
    saveDb(db);
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

export function saveProduct(product: Product): Product {
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
  saveDb(db);
  return product;
}

export function deleteProduct(id: string): boolean {
  const db = initDb();
  const initialLength = db.products.length;
  db.products = db.products.filter(p => p.id !== id);
  if (db.products.length !== initialLength) {
    saveDb(db);
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

export function addReview(productId: string, userName: string, rating: number, comment: string): Review {
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
  
  saveDb(db);
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

export function saveOrder(order: Order): Order {
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
  saveDb(db);
  return order;
}

export function updateOrderStatus(id: string, status: Order['status']): boolean {
  const db = initDb();
  const index = db.orders.findIndex(o => o.id === id);
  if (index >= 0) {
    db.orders[index].status = status;
    saveDb(db);
    return true;
  }
  return false;
}
