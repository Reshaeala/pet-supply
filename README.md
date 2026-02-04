# Pet Supply App

## Overview
The Pet Supply App is a full-stack application built with React for the frontend and Express with SQLite for the backend. It allows users to browse and purchase pet supplies, manage their shopping cart, and provides an admin dashboard for managing products and orders.

## Project Structure
```
pet-supply-app
├── backend
│   ├── db
│   │   ├── schema.sql        # SQL schema for the SQLite database
│   │   └── sqlite.db         # SQLite database file
│   ├── routes
│   │   └── api.js            # API routes for handling requests
│   ├── server.js             # Entry point for the backend server
│   └── package.json          # Backend dependencies and scripts
├── frontend
│   ├── public
│   │   └── index.html        # Main HTML file for the React app
│   ├── src
│   │   ├── components
│   │   │   ├── Header.jsx     # Navigation and branding component
│   │   │   ├── LoginModal.jsx  # User login modal component
│   │   │   └── ProductCard.jsx  # Individual product display component
│   │   ├── pages
│   │   │   ├── AdminDashboard.jsx  # Admin management interface
│   │   │   ├── CartPage.jsx        # User's shopping cart
│   │   │   ├── CheckoutPage.jsx    # Checkout process
│   │   │   ├── HomePage.jsx        # Landing page
│   │   │   └── ProductsPage.jsx    # Product listing page
│   │   ├── App.jsx                # Main application component
│   │   └── main.jsx               # Entry point for the React app
│   ├── vite.config.js             # Vite configuration
│   └── package.json               # Frontend dependencies and scripts
└── README.md                      # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node package manager)
- SQLite

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd pet-supply-app
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

### Database Setup
- Navigate to the `backend/db` directory and run the SQL schema to set up the database:
  ```
  sqlite3 sqlite.db < schema.sql
  ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   node server.js
   ```

2. Start the frontend development server:
   ```
   cd ../frontend
   npm run dev
   ```

### Usage
- Access the application in your browser at `http://localhost:3000`.
- Use the admin login credentials to access the admin dashboard.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License
This project is licensed under the MIT License.# pet-supply
