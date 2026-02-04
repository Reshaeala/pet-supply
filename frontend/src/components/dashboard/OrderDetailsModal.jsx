import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiRequest } from "../../utils/api";

const OrderDetailsModal = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/api/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (!orderId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error: {error}</p>
            </div>
          ) : order ? (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Order Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Order ID:</span>
                      <span className="ml-2 font-medium">#{order.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <span className="ml-2 font-medium">{order.customerName}</span>
                    </div>
                    {order.customerEmail && (
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-medium">{order.customerEmail}</span>
                      </div>
                    )}
                    {order.customerPhone && (
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="ml-2 font-medium">{order.customerPhone}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium">
                        {new Date(order.date).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                  {order.shippingAddress || order.shippingCity || order.shippingState ? (
                    <div className="space-y-1">
                      {order.shippingAddress && (
                        <p className="text-gray-800">{order.shippingAddress}</p>
                      )}
                      {(order.shippingCity || order.shippingState) && (
                        <p className="text-gray-800">
                          {[order.shippingCity, order.shippingState].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No shipping address available</p>
                  )}

                  <h3 className="text-lg font-semibold mb-3 mt-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Total Items:</span>
                      <span className="ml-2 font-medium">
                        {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="ml-2 font-medium text-lg">
                        ₦{order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                {order.items && order.items.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Product
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            Price
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {order.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">{item.productName}</td>
                            <td className="px-4 py-3 text-right">
                              ₦{item.price.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-medium">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-100">
                        <tr>
                          <td colSpan="3" className="px-4 py-3 text-right font-semibold">
                            Total:
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-lg">
                            ₦{order.total.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800">
                      No items found for this order. This order may have been created before the order items tracking system was implemented.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
