# 🍽️ Booking & Delivery @CUTM, PKD

A full-stack web application for **event bookings and food/gift delivery**. Customers can book events or order food and gifts online; admins manage everything from a rich dashboard.

**Live:** [https://bookingatcutmpkd.vercel.app](https://bookingatcutmpkd.vercel.app)  
**API:** [https://nutrition-club.onrender.com/api](https://nutrition-club.onrender.com/api)

---

## ✨ Features

### 👥 Customer Side
- **Event Bookings** — Book Birthday, Inauguration, Departmental, Corporate, or custom events
- **Plan Selection** — Choose from Basic, Standard, Premium, or Only Access (Birthday) tiers
- **Smart Time Slots** — 2-hour slots for Birthday events, 3-hour slots for all others with real-time availability
- **Slot Conflict Prevention** — Overlapping slots blocked automatically (e.g. booking 2–5 PM blocks the 2–4 PM birthday slot)
- **2-Day Advance Booking** — Enforced on both frontend and backend
- **Food Delivery** — Browse and order from the Food catalog with category filters
- **Gift Delivery** — Browse and order from the Gift catalog
- **Cart** — Persistent cart with stock enforcement; quantity capped at available stock
- **Checkout** — Cash on Delivery with order confirmation

### 🛠️ Admin Panel
- **Dashboard** — Live stats for orders and bookings; revenue visible to Super Admin and Owner only
- **Order Management** — View, update status, bulk update, delete (superadmin+)
- **Booking Management** — View enquiries, update status, add notes, delete (superadmin+)
- **Product Management** — Manage Food and Gift catalogs with stock control
- **Event Plans** — Create and manage plans per event type and tier
- **Admin Management** — Full role-based user management with 3 tiers

### 🔐 Role Hierarchy
| Role | Access |
|------|--------|
| **Admin** | Orders, bookings, products, plans |
| **Super Admin** | All of the above + admin management, delete records, revenue |
| **Owner** | All of the above + demote superadmins, promote to owner |

### 🔑 Forgot Password Flow
Admins can submit a password reset request from the login page. Super Admin sees a notification in the Admin Management panel and can reset the password directly.

---

## 🧰 Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework |
| Redux Toolkit + React-Redux | Global state management |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| Axios | HTTP client |
| React Hot Toast | Notifications |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |

### Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database |

---

## 📁 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, ProductCard
│   │   ├── context/          # CartContext, AuthContext
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── DeliveryPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   └── admin/        # All admin pages
│   │   ├── store/
│   │   │   ├── index.js
│   │   │   └── slices/       # ordersSlice, bookingsSlice
│   │   └── utils/            # api.js (axios instance)
│   └── vercel.json
│
└── backend/
    ├── models/               # Admin, Order, Booking, Product, EventPlan,
    │                         #   PasswordResetRequest
    ├── routes/               # adminRoutes, orderRoutes, bookingRoutes,
    │                         #   productRoutes, paymentRoutes, eventPlanRoutes
    ├── middleware/           # auth.js (protect, superAdminOnly, ownerOnly)
    ├── seed.js               # Seed products + admin accounts
    ├── seedPlans.js          # Seed event plans
    └── server.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/booking-delivery-cutm.git
cd booking-delivery-cutm
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Start the server:
```bash
npm run dev
```

Seed the database (optional):
```bash
npm run seed        # Products + admin accounts
npm run seed:plans  # Event plans
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:
```bash
npm run dev
```

---

## 🔐 Default Admin Accounts

> These are created by `npm run seed`. **Change passwords before going to production.**

| Username | Password | Role |
|----------|----------|------|
| `owner` | `owner123` | Owner |
| `superadmin` | `superadmin123` | Super Admin |
| `admin` | `admin123` | Admin |

Admin panel: `/admin/login`

---

## 📡 API Overview

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List products (supports `?catalogType`, `?category`, `?search`) |
| `POST` | `/api/orders` | Place a new order |
| `POST` | `/api/bookings` | Submit a booking enquiry |
| `GET` | `/api/bookings/availability` | Check available time slots for a date |
| `GET` | `/api/event-plans` | List event plans (supports `?eventType`) |
| `POST` | `/api/admin/login` | Admin login |
| `POST` | `/api/admin/forgot-password` | Submit password reset request |

### Admin (requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | List orders with pagination |
| `PUT` | `/api/orders/:id/status` | Update order status |
| `DELETE` | `/api/orders/:id` | Delete order (superadmin+) |
| `GET` | `/api/bookings` | List booking enquiries |
| `PUT` | `/api/bookings/:id` | Update booking status / notes |
| `DELETE` | `/api/bookings/:id` | Delete booking (superadmin+) |
| `GET` | `/api/admin/all` | List all admins (superadmin+) |
| `PUT` | `/api/admin/:id/promote` | Promote admin → superadmin |
| `PUT` | `/api/admin/:id/demote` | Demote superadmin → admin (owner only) |
| `PUT` | `/api/admin/:id/promote-owner` | Promote superadmin → owner (owner only) |

---

## ⏰ Time Slot Logic

| Event Type | Slot Duration | Available Slots |
|------------|--------------|----------------|
| Birthday Event | 2 hours | 2 PM–4 PM, 5 PM–7 PM |
| All others | 3 hours | 10 AM–1 PM, 2 PM–5 PM, 6 PM–9 PM |

**Cross-slot blocking:** Booking a 3-hour slot automatically blocks overlapping 2-hour slots and vice versa (e.g. booking `2 PM–5 PM` blocks `2 PM–4 PM` for birthday bookings on the same date).

---

## 📦 Deployment Notes

### Vercel (Frontend)
Add `vercel.json` at the frontend root to handle SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Add environment variable in Vercel dashboard:
- `VITE_API_URL` → your Render backend URL

### Render (Backend)
- Build command: `npm install`
- Start command: `node server.js`
- Add all `.env` variables in Render's Environment settings
- CORS is configured to allow all `*.vercel.app` subdomains automatically

---

## 📄 License

MIT — feel free to use, modify, and distribute.

---