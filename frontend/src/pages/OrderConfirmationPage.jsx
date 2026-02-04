import React, { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { CheckCircle, Package, Phone, Home } from "lucide-react";

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, orderData } = location.state || {};

  useEffect(() => {
    // Redirect to home if no order data
    if (!orderId && !orderData) {
      navigate("/");
    }
  }, [orderId, orderData, navigate]);

  if (!orderId && !orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle size={80} className="mx-auto text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Thank you for your order</p>
          </div>

          {orderId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                <strong>Order ID:</strong> #{orderId}
              </p>
            </div>
          )}

          <div className="border-t border-b border-gray-200 py-6 mb-6 space-y-4">
            <div className="flex items-start gap-3 text-left">
              <Phone size={24} className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-1">We'll Contact You Soon</h3>
                <p className="text-gray-600">
                  Our team will call you shortly to confirm your order and discuss delivery
                  arrangements and fees based on your location.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left">
              <Package size={24} className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-1">Track Your Order</h3>
                <p className="text-gray-600">
                  You can view your order status and history anytime from your account.
                </p>
              </div>
            </div>
          </div>

          {orderData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-semibold">{orderData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{orderData.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{orderData.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Address:</span>
                  <span className="font-semibold text-right">
                    {orderData.shippingAddress}, {orderData.shippingCity},{" "}
                    {orderData.shippingState}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between">
                  <span className="text-gray-600">Order Total:</span>
                  <span className="font-bold text-lg">₦{orderData.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/orders"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold transition flex items-center justify-center gap-2"
            >
              <Package size={20} />
              View My Orders
            </Link>
            <Link
              to="/"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 font-bold transition flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Back to Home
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-600">
            <p>
              A confirmation email has been sent to <strong>{orderData?.customerEmail}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
