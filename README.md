# Balajee - E-Commerce Application (Premium Fashion Store)

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) e-commerce web application, focused on clothing products.

## 🚀 Features

### User Features
- ✅ User registration and login with JWT authentication
- ✅ Browse clothing products (Men, Women, Kids categories)
- ✅ Product details with size (S, M, L, XL) and color selection
- ✅ Add to cart and update cart items
- ✅ Checkout with address form
- ✅ Payment integration (Razorpay / Dummy payment)
- ✅ Order placement and order tracking (Pending → Shipped → Delivered)
- ✅ User profile with order history
- ✅ Search and filter products
- ✅ Wishlist functionality
- ✅ Ratings and reviews

### Admin Features
- ✅ Admin login with role-based access
- ✅ Dashboard with total users, orders, products, and revenue
- ✅ Add, edit, and delete products (with sizes, colors, stock, images)
- ✅ Manage orders and update delivery status
- ✅ Manage users (activate/deactivate)
- ✅ Low stock alert on dashboard

## 🛠️ Tech Stack

| Technology | Usage |
|-----------|-------|
| **React.js** | Frontend UI |
| **Node.js** | Backend Runtime |
| **Express.js** | REST API Framework |
| **MongoDB** | Database |
| **Mongoose** | ODM |
| **JWT** | Authentication |
| **bcryptjs** | Password Hashing |
| **Vite** | Build Tool |

## 📁 Folder Structure

```
p/
├── client/                  # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable components (Navbar, Footer, ProductCard)
│   │   ├── context/         # React Context (Auth, Cart, Wishlist)
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin panel pages
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Wishlist.jsx
│   │   ├── utils/           # API configuration
│   │   ├── App.jsx          # Main app with routing
│   │   ├── index.css        # Global styles
│   │   └── main.jsx         # Entry point
│   └── package.json
├── server/                  # Express Backend
│   ├── middleware/           # Auth & upload middleware
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   └── Wishlist.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── wishlist.js
│   │   ├── reviews.js
│   │   ├── categories.js
│   │   ├── admin.js
│   │   └── payment.js
│   ├── uploads/             # Uploaded files
│   ├── seed.js              # Database seeder
│   ├── server.js            # Express server
│   ├── .env                 # Environment variables
│   └── package.json
├── package.json             # Root scripts
└── README.md
```

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### 1. Clone and Install

```bash
# Install root dependencies
npm install

# Install all dependencies (server + client)
npm run install-all
```

Or manually:
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` in the `/server` folder:
```bash
cd server
cp .env.example .env
```

Update values in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flipkart-clone
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed the Database

```bash
cd server
node seed.js
```

This creates:
- **Admin account**: `admin@flipkart.com` / `admin123`
- **Test user**: `john@example.com` / `user123`
- **10 categories** and **16 sample products**

### 4. Run the Application

```bash
# From root directory - runs both server and client
npm run dev

# Or separately:
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@flipkart.com | admin123 |
| User | john@example.com | user123 |

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/address` | Add address |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all (with filters) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create (admin) |
| PUT | `/api/products/:id` | Update (admin) |
| DELETE | `/api/products/:id` | Delete (admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/add` | Add to cart |
| PUT | `/api/cart/update/:itemId` | Update quantity |
| DELETE | `/api/cart/remove/:itemId` | Remove item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place order |
| GET | `/api/orders/my-orders` | Get user orders |
| GET | `/api/orders/:id` | Get order details |
| PUT | `/api/orders/:id/cancel` | Cancel order |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/orders` | All orders |
| PUT | `/api/admin/orders/:id/status` | Update order status |

## 📝 Database Collections

- **Users** - User accounts with addresses
- **Products** - Product catalog with sizes, colors, stock
- **Categories** - Product categories
- **Cart** - User shopping carts
- **Orders** - Order records with items (price at purchase)
- **Reviews** - Product ratings and reviews
- **Wishlist** - User wishlists

## 📄 License

This project is for educational purposes.
