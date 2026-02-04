# Pet Supply App - Setup Guide

## Database Seeding

To populate the database with 120+ products (40+ per animal) and user accounts:

### Step 1: Navigate to backend directory

```bash
cd backend
```

### Step 2: Run the seed script

```bash
node db/seed.js
```

This will:

- Create/Reset the database tables
- Add 120+ products (40+ for Dogs, 40+ for Cats, 40+ for Birds)
- Create 3 user accounts:
  - **Super Admin**: `superadmin@petmart.ng` / `super123`
  - **Admin**: `admin@petmart.ng` / `admin123`
  - **Customer**: `customer@petmart.ng` / `customer123`

## Product Categories

Each animal has 3 categories:

- **Food & Treats** (15 items)
- **Toys & Accessories** (15 items)
- **Health & Grooming** (10 items)

## User Roles & Permissions

### Super Admin (`superadmin@petmart.ng` / `super123`)

- ✅ Full access to everything
- ✅ Manage Products (Create, Read, Update, Delete)
- ✅ View Orders & Stock
- ✅ Add/Remove Admins
- ✅ View Activity Logs

### Admin (`admin@petmart.ng` / `admin123`)

- ✅ View Orders (can update order status)
- ✅ View Stock (read-only, monitoring levels)
- ✅ Dashboard access
- ❌ Cannot add products
- ❌ Cannot manage users

### Customer (`customer@petmart.ng` / `customer123`)

- ✅ Browse products without login
- ✅ Login required only at checkout
- ✅ Place orders after login

## Starting the Application

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Authentication

The API uses a simple header-based authentication:

- Header: `x-user-id` (set automatically after login)
- User ID is stored in localStorage after successful login

## Notes

- The app starts on the home page for everyone
- Admins use the "Admin" button in the header to access their dashboards
- Super Admin sees a different dashboard with product/user management
- Regular Admin sees order management and stock monitoring
