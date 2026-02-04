import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import Toast from "./components/Toast";
import { useApp } from "./contexts/AppContext";

// Lazy load pages for code splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const AnimalProductsPage = lazy(() => import("./pages/AnimalProductsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const RevenueDetailsPage = lazy(() => import("./pages/RevenueDetailsPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const AppContent = () => {
  const { currentUser, toast, hideToast } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <LoginModal />
      <SignupModal />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:animal" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          {/* <Route path="/products/dogs" element={<AnimalProductsPage />} />
          <Route path="/products/cats" element={<AnimalProductsPage />} />
          <Route path="/products/birds" element={<AnimalProductsPage />} /> */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/revenue-details" element={<RevenueDetailsPage />} />
          <Route
            path="/admin"
            element={
              currentUser?.role === "superadmin" ? (
                <SuperAdminDashboard />
              ) : (
                <AdminDashboard />
              )
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router future={{ v7_startTransition: true }}>
          <AppContent />
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
