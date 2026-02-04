import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Users,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Activity,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { apiRequest } from "../utils/api";
import MetricCard from "../components/dashboard/MetricCard";
import OrdersTable from "../components/dashboard/OrdersTable";
import StockTable from "../components/dashboard/StockTable";
import RevenueChart from "../components/dashboard/RevenueChart";
import TopCategoriesTable from "../components/dashboard/TopCategoriesTable";

const SuperAdminDashboard = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    revenue: 0,
    ordersCount: 0,
    productsCount: 0,
    customersCount: 0,
  });
  const [formData, setFormData] = useState({
    name: "",
    animal: "Dogs",
    category: "Food",
    price: "",
    image: "🐕",
    stock: "",
    rating: "4.5",
    brand: "Save My Pet",
    description: "",
  });
  const [userFormData, setUserFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "customer",
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== "superadmin") {
      navigate("/");
      return;
    }
    loadData();
  }, [currentUser, navigate, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === "dashboard") {
        const [dashboardData, metricsData, categoriesData, revenueData] =
          await Promise.all([
            apiRequest("/api/dashboard"),
            apiRequest("/api/metrics"),
            apiRequest("/api/metrics/categories"),
            apiRequest("/api/metrics/monthly-revenue"),
          ]);
        setDashboardData(dashboardData);
        setMetrics(metricsData);
        setCategories(categoriesData);
        setMonthlyRevenue(revenueData);
      } else if (activeTab === "orders") {
        const data = await apiRequest("/api/orders");
        setOrders(data);
      } else if (activeTab === "stock") {
        const data = await apiRequest("/api/stock");
        setStock(data);
      } else if (activeTab === "products") {
        const data = await apiRequest("/api/products");
        setProducts(data);
      } else if (activeTab === "users") {
        const data = await apiRequest("/api/users");
        setUsers(data);
      } else if (activeTab === "logs") {
        const data = await apiRequest("/api/activity-logs");
        setActivityLogs(data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await apiRequest(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiRequest("/api/products", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      setShowProductModal(false);
      setEditingProduct(null);
      resetForm();
      loadData();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      await apiRequest(`/api/products/${id}`, { method: "DELETE" });
      loadData();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      animal: product.animal,
      category: product.category,
      price: product.price.toString(),
      image: product.image,
      stock: product.stock.toString(),
      rating: product.rating.toString(),
      brand: product.brand || "Save My Pet",
      description: product.description || "",
    });
    setShowProductModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest("/api/users", {
        method: "POST",
        body: JSON.stringify(userFormData),
      });
      setShowUserModal(false);
      setUserFormData({ email: "", password: "", name: "", role: "customer" });
      loadData();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    try {
      await apiRequest(`/api/users/${id}`, { method: "DELETE" });
      loadData();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await apiRequest(`/api/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      loadData();
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  const staleOrdersCount = useMemo(() => {
    if (activeTab !== "orders") return 0;
    return orders.filter(order => {
      if (order.status === "delivered" || order.status === "cancelled") {
        return false;
      }
      const lastUpdate = new Date(order.lastStatusUpdate || order.date);
      const now = new Date();
      const daysDiff = (now - lastUpdate) / (1000 * 60 * 60 * 24);
      return daysDiff >= 2;
    }).length;
  }, [orders, activeTab]);

  const resetForm = () => {
    setFormData({
      name: "",
      animal: "Dogs",
      category: "Food",
      price: "",
      image: "🐕",
      stock: "",
      rating: "4.5",
      brand: "Save My Pet",
      description: "",
    });
    setEditingProduct(null);
  };

  const productCategories = {
    Dogs: ["Food", "Toys", "Grooming", "Treats", "Accessories"],
    Cats: ["Food", "Toys", "Grooming", "Treats", "Litter", "Accessories"],
    Birds: ["Food", "Toys", "Accessories", "Treats"],
  };

  if (loading && activeTab === "dashboard" && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Super Admin Dashboard
          </h1>
          <div className="flex gap-2">
            {activeTab === "products" && (
              <button
                onClick={() => {
                  resetForm();
                  setShowProductModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus size={20} />
                Add Product
              </button>
            )}
            {activeTab === "users" && (
              <button
                onClick={() => {
                  setShowUserModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <UserPlus size={20} />
                Add User
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          {["dashboard", "orders", "products", "users", "logs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && metrics && (
          <div className="space-y-8">
            {/* Revenue Snapshot Cards */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Revenue Snapshots
                </h2>
                <button
                  onClick={() => navigate("/revenue-details")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
                >
                  View Detailed Revenue
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                  title="Today's Revenue"
                  value={`₦${metrics.todayRevenue.toLocaleString()}`}
                  icon={DollarSign}
                  color="green"
                />
                <MetricCard
                  title="Weekly Revenue"
                  value={`₦${metrics.weekRevenue.toLocaleString()}`}
                  icon={TrendingUp}
                  color="blue"
                />
                <MetricCard
                  title="Monthly Revenue"
                  value={`₦${metrics.monthRevenue.toLocaleString()}`}
                  icon={TrendingUp}
                  color="purple"
                />
                <MetricCard
                  title="6-Month Revenue"
                  value={`₦${metrics.sixMonthRevenue.toLocaleString()}`}
                  icon={BarChart3}
                  color="orange"
                />
                <MetricCard
                  title="Year-to-Date"
                  value={`₦${metrics.yearRevenue.toLocaleString()}`}
                  icon={BarChart3}
                  color="green"
                />
              </div>
            </div>

            {/* Customer & Sales Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Panel */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Customer Metrics
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <MetricCard
                    title="Total Active Customers"
                    value={metrics.totalCustomers.toLocaleString()}
                    icon={Users}
                    color="blue"
                  />
                  <MetricCard
                    title="New Customers"
                    value={metrics.newCustomers.toLocaleString()}
                    subtitle="Recent additions"
                    icon={UserPlus}
                    color="green"
                  />
                  <MetricCard
                    title="Returning Customer Rate"
                    value={`${metrics.returningCustomerRate}%`}
                    icon={TrendingUp}
                    color="purple"
                  />
                </div>
              </div>

              {/* Sales Panel */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Sales Metrics
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <MetricCard
                    title="Total Orders"
                    value={metrics.totalOrders.toLocaleString()}
                    icon={ShoppingCart}
                    color="blue"
                  />
                  <MetricCard
                    title="Total Products"
                    value={metrics.totalProducts.toLocaleString()}
                    subtitle="Units in catalog"
                    icon={Package}
                    color="green"
                  />
                  <MetricCard
                    title="Refund / Return Rate"
                    value={`${metrics.refundRate}%`}
                    subtitle={`${metrics.cancelledOrders} cancelled orders`}
                    icon={AlertTriangle}
                    color="red"
                  />
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                12-Month Revenue Trend
              </h2>
              <RevenueChart
                monthlyRevenue={monthlyRevenue}
                totalRevenue={metrics.twelveMonthRevenue}
              />
            </div>

            {/* Top Categories & Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Categories */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Top Categories
                </h2>
                <TopCategoriesTable categories={categories} />
              </div>

              {/* Inventory Metrics */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Inventory Status
                </h2>
                <div className="space-y-4">
                  <MetricCard
                    title="Stockouts"
                    value={metrics.stockouts.toLocaleString()}
                    subtitle="Products out of stock"
                    icon={AlertTriangle}
                    color="red"
                  />
                  <MetricCard
                    title="Total Products"
                    value={metrics.totalProducts.toLocaleString()}
                    subtitle="Products in catalog"
                    icon={Package}
                    color="blue"
                  />
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                      Stock Health
                    </h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {(
                        ((metrics.totalProducts - metrics.stockouts) /
                          metrics.totalProducts) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-sm text-gray-500">
                      Products in stock
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <>
            {staleOrdersCount > 0 && (
              <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded">
                <div className="flex items-center">
                  <AlertTriangle className="text-red-600 mr-3" size={24} />
                  <div>
                    <h3 className="text-red-800 font-bold">
                      {staleOrdersCount} {staleOrdersCount === 1 ? "order needs" : "orders need"} attention
                    </h3>
                    <p className="text-red-700 text-sm">
                      {staleOrdersCount === 1 ? "This order has" : "These orders have"} not been updated in 2+ days. Please review and update their status.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <OrdersTable orders={orders} onStatusUpdate={handleStatusUpdate} />
          </>
        )}

        {/* Stock Tab */}
        {activeTab === "stock" && <StockTable stock={stock} />}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Animal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium">{product.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.animal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ₦{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={
                          product.stock === 0
                            ? "text-red-600 font-semibold"
                            : ""
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.role === "superadmin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activityLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.email || "System"}
                    </td>
                    <td className="px-6 py-4">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h3>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Animal
                    </label>
                    <select
                      value={formData.animal}
                      onChange={(e) =>
                        setFormData({ ...formData, animal: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2"
                    >
                      <option>Dogs</option>
                      <option>Cats</option>
                      <option>Birds</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2"
                    >
                      {productCategories[formData.animal]?.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Image (emoji or URL)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2"
                      placeholder="🐕"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      required
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({ ...formData, rating: e.target.value })
                      }
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-4 py-2"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingProduct ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      resetForm();
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-6">Add User</h3>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={userFormData.password}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        password: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={userFormData.name}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, name: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, role: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserModal(false);
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
