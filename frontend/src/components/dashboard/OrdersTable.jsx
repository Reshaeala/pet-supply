import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import OrderDetailsModal from "./OrderDetailsModal";

const OrdersTable = ({ orders, onStatusUpdate, allowStatusUpdate = true }) => {
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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

  const isStaleOrder = (order) => {
    // Don't flag delivered or cancelled orders
    if (order.status === "delivered" || order.status === "cancelled") {
      return false;
    }

    const lastUpdate = new Date(order.lastStatusUpdate || order.date);
    const now = new Date();
    const daysDiff = (now - lastUpdate) / (1000 * 60 * 60 * 24);

    // Alert if status hasn't been updated in 2+ days
    return daysDiff >= 2;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">

              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              {allowStatusUpdate && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => {
              const isStale = isStaleOrder(order);
              return (
              <tr key={order.id} className={isStale ? "bg-red-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isStale && (
                    <div className="group relative inline-block">
                      <AlertTriangle className="text-red-600" size={20} />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                        Status hasn't been updated in {Math.floor((new Date() - new Date(order.lastStatusUpdate || order.date)) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedOrderId(order.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    #{order.id}
                  </button>
                </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {order.customerName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {order.customerPhone || "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ₦{order.total.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(order.date).toLocaleDateString()}
              </td>
              {allowStatusUpdate && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.status !== "delivered" &&
                    order.status !== "cancelled" && (
                      <select
                        value={order.status}
                        onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                        className="border rounded px-3 py-1 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                </td>
              )}
            </tr>
          );
            })}
        </tbody>
      </table>
    </div>

      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </>
  );
};

export default OrdersTable;
