import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Package, Users, ShoppingBag, AlertTriangle } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { apiRequest } from "../utils/api";
import OrdersTable from "../components/dashboard/OrdersTable";
import StockTable from "../components/dashboard/StockTable";

const AdminDashboard = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    revenue: 0,
    ordersCount: 0,
    productsCount: 0,
    customersCount: 0,
  });
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Only regular admins should access this dashboard
    // Superadmins should use the SuperAdminDashboard
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
      return;
    }
    loadData();
  }, [currentUser, navigate, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === "dashboard") {
        const data = await apiRequest("/api/dashboard");
        setDashboardData(data);
      } else if (activeTab === "orders") {
        const data = await apiRequest("/api/orders");
        setOrders(data);
      } else if (activeTab === "stock") {
        const data = await apiRequest("/api/stock");
        setStock(data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
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

  if (loading && activeTab === "dashboard") {
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
      </div>

      <div className="flex gap-4 mb-6 border-b">
        {["dashboard", "orders", "stock"].map((tab) => (
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

      {activeTab === "dashboard" && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="bg-green-500 text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <DollarSign size={24} />
              </div>
              <div className="text-2xl font-bold mb-1">
                ₦{dashboardData.revenue.toLocaleString()}
              </div>
              <div className="text-gray-600">Revenue</div>
            </div> */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="bg-blue-500 text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag size={24} />
              </div>
              <div className="text-2xl font-bold mb-1">
                {dashboardData.ordersCount}
              </div>
              <div className="text-gray-600">Orders</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="bg-purple-500 text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Package size={24} />
              </div>
              <div className="text-2xl font-bold mb-1">
                {dashboardData.productsCount}
              </div>
              <div className="text-gray-600">Products</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              <div className="text-2xl font-bold mb-1">
                {dashboardData.customersCount}
              </div>
              <div className="text-gray-600">Customers</div>
            </div>
          </div>
        </>
      )}

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

      {activeTab === "stock" && (
        <StockTable stock={stock} showAdminNote={true} />
      )}
    </div>
  );
};

export default AdminDashboard;
