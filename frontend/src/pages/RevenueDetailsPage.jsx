import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, Package, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { apiRequest } from "../utils/api";
import { useApp } from "../contexts/AppContext";

const RevenueDetailsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    if (!currentUser || currentUser.role !== "superadmin") {
      navigate("/");
      return;
    }

    fetchRevenueDetails();
  }, [currentUser, navigate]);

  const fetchRevenueDetails = async () => {
    try {
      const result = await apiRequest("/api/metrics/revenue-details");
      setData(result);
    } catch (err) {
      setError("Failed to load revenue details");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrder = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading revenue details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6">Revenue Details</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {data && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign size={32} className="text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(data.totalRevenue)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">From delivered orders only</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Package size={32} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-700">Delivered Orders</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{data.totalOrders}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Average: {formatCurrency(Math.round(data.totalRevenue / data.totalOrders || 0))}
                  </p>
                </div>
              </div>

              {/* Orders List */}
              <div>
                <h2 className="text-xl font-bold mb-4">Delivered Orders</h2>
                {data.orders.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No delivered orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {data.orders.map((order) => (
                      <div
                        key={order.orderId}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div
                          className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                          onClick={() => toggleOrder(order.orderId)}
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-semibold">Order #{order.orderId}</p>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(order.date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Customer</p>
                              <p className="font-semibold">{order.customerName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Order Total</p>
                              <p className="font-bold text-lg text-green-600">
                                {formatCurrency(order.total)}
                              </p>
                            </div>
                            {expandedOrders.has(order.orderId) ? (
                              <ChevronUp size={24} className="text-gray-400" />
                            ) : (
                              <ChevronDown size={24} className="text-gray-400" />
                            )}
                          </div>
                        </div>

                        {expandedOrders.has(order.orderId) && (
                          <div className="p-4 bg-white border-t">
                            <h4 className="font-semibold mb-3">Items Sold</h4>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                                >
                                  <div>
                                    <p className="font-semibold">{item.productName}</p>
                                    <p className="text-sm text-gray-600">
                                      {item.quantity} × {formatCurrency(item.price)}
                                    </p>
                                  </div>
                                  <p className="font-bold">{formatCurrency(item.itemTotal)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueDetailsPage;
