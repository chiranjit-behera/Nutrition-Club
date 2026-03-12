# 🍔 FoodieExpress — MERN Order Management App

A full-stack food ordering & admin management system built with **MongoDB, Express, React, Node.js** and **Tailwind CSS**.

---

## 📁 Project Structure

```
food-order-app/
├── backend/                  # Node.js + Express API
│   ├── models/
│   │   ├── Product.js        # Product schema
│   │   ├── Order.js          # Order schema with status history
│   │   └── Admin.js          # Admin auth schema
│   ├── routes/
│   │   ├── productRoutes.js  # CRUD product endpoints
│   │   ├── orderRoutes.js    # Order creation & management
│   │   └── adminRoutes.js    # Admin auth endpoints
│   ├── middleware/
│   │   └── auth.js           # JWT auth middleware
│   ├── server.js             # Express app entry
│   ├── seed.js               # DB seeder (products + admin)
│   ├── .env.example          # Environment variables template
│   └── package.json
│
└── frontend/                 # React + Vite + Tailwind
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx           # Top navigation
    │   │   ├── ProductCard.jsx      # Product display card
    │   │   └── admin/
    │   │       ├── AdminLayout.jsx  # Admin sidebar layout
    │   │       └── ProtectedRoute.jsx
    │   ├── context/
    │   │   ├── CartContext.jsx      # Cart state management
    │   │   └── AuthContext.jsx      # Admin auth state
    │   ├── pages/
    │   │   ├── HomePage.jsx         # Menu listing page
    │   │   ├── CartPage.jsx         # Cart review
    │   │   ├── CheckoutPage.jsx     # Customer details + order
    │   │   ├── OrderSuccessPage.jsx # Order confirmation
    │   │   └── admin/
    │   │       ├── AdminLogin.jsx   # Admin login
    │   │       ├── AdminDashboard.jsx # Stats overview
    │   │       ├── AdminOrders.jsx  # Order management
    │   │       └── AdminProducts.jsx # Product management
    │   ├── utils/
    │   │   └── api.js               # Axios instance
    │   ├── App.jsx                  # Routes & providers
    │   └── main.jsx
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

### 1. Clone / setup the project

```bash
cd food-order-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env
# Edit .env with your MongoDB URI

# Seed database with sample products and admin user
npm run seed

# Start development server
npm run dev
```

Backend will start at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start at `http://localhost:3000`

---

## 🔑 Admin Credentials

After seeding, use these to login at `/admin/login`:
- **Username:** `admin`
- **Password:** `admin123`

---

## 🌐 Pages & Routes

### Customer-Facing
| Route | Description |
|-------|-------------|
| `/` | Menu listing with categories & search |
| `/cart` | Shopping cart review |
| `/checkout` | Customer details form & order placement |
| `/order-success` | Order confirmation page |

### Admin Panel
| Route | Description |
|-------|-------------|
| `/admin/login` | Admin authentication |
| `/admin/dashboard` | Stats overview (orders, revenue) |
| `/admin/orders` | View, filter, bulk-update orders |
| `/admin/products` | Add/edit/delete products, manage stock |

---

## 📡 API Endpoints

### Products
```
GET    /api/products           - List available products (public)
GET    /api/products/admin/all - All products including inactive (admin)
GET    /api/products/:id       - Single product
POST   /api/products           - Create product (admin)
PUT    /api/products/:id       - Update product (admin)
DELETE /api/products/:id       - Delete product (admin)
```

### Orders
```
POST   /api/orders              - Place order (public)
GET    /api/orders              - Get all orders (admin)
GET    /api/orders/:id          - Single order (admin)
PUT    /api/orders/:id/status   - Update order status (admin)
PUT    /api/orders/bulk/status  - Bulk status update (admin)
GET    /api/orders/stats/overview - Dashboard stats (admin)
```

### Admin Auth
```
POST   /api/admin/login         - Login
GET    /api/admin/verify        - Verify JWT token
PUT    /api/admin/change-password - Change password (admin)
```

---

## ✨ Features

### Customer Side
- 🍽️ Browse full menu with category filtering & search
- 🛒 Add to cart with quantity controls, persistent across sessions
- 📦 Checkout with Name, Phone, Email (optional), Address
- 💰 Automatic delivery fee, tax calculation
- ✅ Order confirmation with order number

### Admin Panel
- 🔐 Secure JWT-based login
- 📊 Dashboard with live stats (total orders, revenue, pending, delivered)
- 📋 Order management with status filtering and search
- ✅ Bulk order status updates (select multiple orders → mark as Delivered)
- 🔍 Order detail modal with full info + status history
- 🍕 Product management — add, edit, delete products
- 💲 Manage pricing and stock quantities
- 🔄 Toggle product availability (enable/disable)
- 📱 Fully responsive on mobile and desktop

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Icons | Lucide React |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcryptjs |

---

## 🎨 Customization

### Add more categories
Edit `CATEGORIES` in:
- `backend/models/Product.js` (enum)
- `frontend/src/pages/HomePage.jsx`
- `frontend/src/pages/admin/AdminProducts.jsx`

### Change delivery fee logic
Edit `CartPage.jsx` and `CheckoutPage.jsx`:
```js
const deliveryFee = totalPrice > 500 ? 0 : 40; // free above ₹500
```

### Add more admin users
Use the MongoDB shell or add a route:
```js
const admin = new Admin({ username: 'manager', password: 'pass123' });
await admin.save(); // password auto-hashed
```
