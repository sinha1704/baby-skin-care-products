# Nurture & Dew | Premium Organic Baby Skin Care E-Commerce

A full-stack, highly responsive e-commerce web application dedicated to premium organic baby skin care products. The project includes a customer-facing storefront and a protected admin management console.

---

## 🔗 Live URLs & Repository
* **GitHub Repository:** [baby-skin-care-products](https://github.com/sinha1704/baby-skin-care-products.git)
* **Customer Storefront Demo:** [https://sss-baby-skin-care.vercel.app](https://sss-baby-skin-care.vercel.app)
* **Admin Dashboard Demo:** [https://sss-baby-skin-care-admin.vercel.app](https://sss-baby-skin-care-admin.vercel.app)

---

## 🔐 Sample Admin Credentials
Access the admin dashboard panel using these preconfigured credentials:
* **Admin Email:** `admin@babyskin.com`
* **Admin Password:** `admin123`

---

## 🛠️ Technology Stack
* **Core Framework:** Next.js 16.2.10 (App Router), React 19.2.4, TypeScript 5
* **Styling & Aesthetics:** Tailwind CSS v4, custom theme variables, smooth UI gradients
* **Animation:** Framer Motion (page transitions, sliders, drawers)
* **State Management:** Zustand (Cart, Wishlist, and Auth persistent stores)
* **Validation & Security:** Zod schemas, Next.js CORS Middleware, Cookie-based authorization
* **Database:** Local JSON transaction-based database (`src/data/db.json` & `src/data/mockDb.ts`)
* **Payments:** Stripe JS Client & Node SDK (`@stripe/stripe-js`, `stripe`)

---

## 📋 Feature Checklist & Compliance

### Storefront Features
* **Home Page:** Elegant auto-rotating marketing banners, categorized collections, and featured products display.
* **Product Catalog:** Interactive search bar, category filters, and sorting options (low-to-high, high-to-low, newest).
* **Product details:** Shows images, description, pricing, stock levels, ingredients, benefits, usage instructions, safety notes, and customer reviews.
* **Modern Cart Drawer:** Collapsible sidebar drawer to adjust quantities, remove items, and preview subtotal calculations with stock limits.
* **Checkout Page:** Delivery details form and order summary, supporting Card (Stripe test mode) or Cash on Delivery (COD).
* **PDF Invoice:** Customers can instantly generate and download formatted invoices upon order placement.
* **Wishlist (Bonus):** Customers can bookmark their favorite products.
* **Reviews & Ratings (Bonus):** Users can write reviews and select 1–5 star ratings, recalculating averages dynamically.

### Admin Dashboard Features
* **Security Guard:** Restricted dashboard routes checked using Next.js authentication middleware.
* **Real-time Overview:** Sales performance calculations, total order count, category tallies, and out-of-stock items.
* **Low Stock Alerts:** Dashboard warnings listing items with less than 25 units in stock.
* **Product CRUD:** Grid view of products, details editor (create/update), stock modifier, and landing feature toggles.
* **Category CRUD:** Create, read, and delete product category classifications.
* **Orders Tracker:** Displays transaction history, customer details, items purchased, and allows updating order status (`Pending`, `Paid`, `Shipped`, `Delivered`, `Cancelled`).

---

## 🚀 Local Run Instructions

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
* npm, yarn, or pnpm

### Step 1: Clone the Repository
```bash
git clone https://github.com/sinha1704/baby-skin-care-products.git
cd baby-skin-care-products
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Stripe Test Credentials (Uses simulation mode if placeholder key is kept)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51P1abc123xyz456
STRIPE_SECRET_KEY=sk_test_51P1abc123xyz456

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Security Secrets
JWT_SECRET=super-secret-jwt-key-for-baby-skin-care-app-2026
```

### Step 3: Run the Customer Storefront (Port 3000)
Run the following commands in the project root:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Run the Admin Dashboard (Port 3001)
In a new terminal window, navigate to the `admin-app` directory and launch the dashboard server:
```bash
cd admin-app
npm install
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser to sign in as administrator.

---

## 🧪 Testing Instructions

1. **Test Admin Login:** Navigate to `http://localhost:3001` and enter `admin@babyskin.com` and `password: admin123` to access the dashboard.
2. **Product CRUD:** Go to "Manage Products" in the Admin sidebar, click "Add Product", fill out the form, and save. Check that the product instantly appears on the customer storefront.
3. **Cart & Wishlist:** Navigate to the customer site `http://localhost:3000`, open a product, add it to your wishlist, add it to the cart, and change quantities.
4. **Checkout & Stock Deductions:** Purchase items using Card (use standard Stripe test cards like `4242 4242 4242 4242`) or COD. Once placed, verify in the Admin "Track Orders" panel that the order is logged, and notice the stock quantity decrements.
5. **Invoice Download:** Click the "Download Invoice" button on the customer success screen to verify PDF creation.
