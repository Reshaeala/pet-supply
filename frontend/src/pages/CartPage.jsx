import React, { memo, useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { PaystackButton } from "react-paystack";
import { useApp } from "../contexts/AppContext";
import StockIssueModal from "../components/StockIssueModal";

const CartPage = memo(() => {
  const {
    cart,
    cartTotal,
    currentUser,
    updateQuantity,
    removeFromCart,
    openLoginModal,
    clearCart,
  } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState("cart"); // 'cart' or 'checkout'
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Card Payment");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [stockData, setStockData] = useState({});
  const [stockCheckLoading, setStockCheckLoading] = useState(false);
  const [showStockIssueModal, setShowStockIssueModal] = useState(false);
  const [stockIssues, setStockIssues] = useState([]);

  // Pre-fill user info when moving to checkout
  useEffect(() => {
    if (step === "checkout" && currentUser?.email && !shippingInfo.email) {
      setShippingInfo((prev) => ({
        ...prev,
        email: currentUser.email,
        phone: currentUser.phone || "",
      }));
    }
  }, [step, currentUser, shippingInfo.email]);

  const handleQuantityChange = useCallback(
    (productId, newQuantity) => {
      updateQuantity(productId, newQuantity);
    },
    [updateQuantity]
  );

  const handleProceedToCheckout = useCallback(async () => {
    if (!currentUser) {
      openLoginModal(false);
      return;
    }

    // Check stock availability before proceeding
    setStockCheckLoading(true);
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch product data");
      }
      const products = await response.json();

      // Create a map of product stock
      const stockMap = {};
      products.forEach(product => {
        stockMap[product.id] = product.stock;
      });
      setStockData(stockMap);

      // Check if any cart items are out of stock or exceed available quantity
      const stockIssues = [];
      cart.forEach(item => {
        const availableStock = stockMap[item.id];
        if (availableStock === 0) {
          stockIssues.push(`${item.name} is out of stock`);
        } else if (item.quantity > availableStock) {
          stockIssues.push(`${item.name}: Only ${availableStock} available (you have ${item.quantity} in cart)`);
        }
      });

      if (stockIssues.length > 0) {
        setStockIssues(stockIssues);
        setShowStockIssueModal(true);
        setStockCheckLoading(false);
        return;
      }

      setStep("checkout");
    } catch (error) {
      console.error("Error checking stock:", error);
      alert("Failed to verify stock availability. Please try again.");
    } finally {
      setStockCheckLoading(false);
    }
  }, [currentUser, openLoginModal, cart]);

  const handleBackToCart = useCallback(() => {
    setStep("cart");
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setShippingInfo((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!shippingInfo.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!shippingInfo.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!shippingInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!shippingInfo.phone.trim())
      newErrors.phone = "Phone number is required";
    if (!shippingInfo.address.trim()) newErrors.address = "Address is required";
    if (!shippingInfo.city.trim()) newErrors.city = "City is required";
    if (!shippingInfo.state.trim()) newErrors.state = "State is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [shippingInfo]);

  const onSuccess = useCallback(
    async (reference) => {
      console.log("Payment success callback triggered with reference:", reference);
      setIsSubmitting(true);
      try {
        const { apiRequest } = await import("../utils/api");

        // Verify payment status with Paystack
        console.log("Calling payment verification API...");
        const verificationResponse = await apiRequest(
          `/api/verify-payment/${reference.reference}`,
          {
            method: "GET",
          }
        );

        console.log("Payment verification response:", verificationResponse);
        console.log("Payment status:", verificationResponse.data?.status);
        console.log("Full verification data:", JSON.stringify(verificationResponse, null, 2));

        // Only proceed if payment status is "success"
        if (verificationResponse.data?.status !== "success") {
          console.error("Payment verification failed. Status:", verificationResponse.data?.status);
          alert(
            `Payment verification failed. Status: ${
              verificationResponse.data?.status || "unknown"
            }. Please contact support with reference: ${reference.reference}`
          );
          setIsSubmitting(false);
          return;
        }

        console.log("Payment verified successfully! Proceeding to create order...");

        const orderData = {
          customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          customerEmail: shippingInfo.email,
          customerPhone: shippingInfo.phone,
          shippingAddress: shippingInfo.address,
          shippingCity: shippingInfo.city,
          shippingState: shippingInfo.state,
          total: cartTotal,
          paymentReference: reference.reference,
          items: cart.map((item) => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        };

        console.log("Creating order with data:", orderData);
        const response = await apiRequest("/api/orders", {
          method: "POST",
          body: JSON.stringify(orderData),
        });

        console.log("Order created successfully:", response);

        // Clear cart and navigate only after successful verification
        console.log("Clearing cart and navigating to confirmation page...");
        clearCart();
        navigate("/order-confirmation", {
          replace: true,
          state: {
            orderId: response.orderId,
            orderData,
            reference: reference.reference,
          },
        });
        console.log("Navigation complete!");
      } catch (error) {
        console.error("Checkout error:", error);
        console.error("Error details:", error.message, error.stack);
        alert(
          "Failed to save order. Please contact support with your payment reference: " +
            reference.reference
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [cart, shippingInfo, cartTotal, clearCart, navigate]
  );

  const onClose = useCallback(() => {
    console.log("Payment window closed by user");
    // Don't show alert - onClose fires even after successful payment
  }, []);

  const closeStockIssueModal = useCallback(() => {
    setShowStockIssueModal(false);
    setStockIssues([]);
  }, []);

  // Handle payment button click with validation
  const handlePaymentClick = useCallback(async () => {
    console.log("Payment button clicked - validating form...");
    if (!validateForm()) {
      console.log("Form validation failed - preventing payment");
      return false; // Prevent payment from opening
    }

    // Check stock availability one more time before payment
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        alert("Failed to verify stock availability. Please try again.");
        return false;
      }
      const products = await response.json();

      // Create a map of product stock
      const stockMap = {};
      products.forEach(product => {
        stockMap[product.id] = product.stock;
      });

      // Check if any cart items are out of stock or exceed available quantity
      const stockIssues = [];
      cart.forEach(item => {
        const availableStock = stockMap[item.id];
        if (availableStock === 0) {
          stockIssues.push(`${item.name} is out of stock`);
        } else if (item.quantity > availableStock) {
          stockIssues.push(`${item.name}: Only ${availableStock} available (you have ${item.quantity} in cart)`);
        }
      });

      if (stockIssues.length > 0) {
        setStockIssues(stockIssues);
        setShowStockIssueModal(true);
        return false;
      }
    } catch (error) {
      console.error("Error checking stock:", error);
      alert("Failed to verify stock availability. Please try again.");
      return false;
    }

    console.log("Form validated and stock verified - proceeding with payment");
    return true;
  }, [validateForm, cart]);

  // Paystack component props
  const componentProps = useMemo(() => {
    const timestamp = new Date().getTime();
    const props = {
      reference: `order_${timestamp}`,
      email: shippingInfo.email,
      amount: cartTotal * 100,
      publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      // Pass customer name and phone - Paystack will update customer record
      firstname: shippingInfo.firstName,
      lastname: shippingInfo.lastName,
      phone: shippingInfo.phone,
      // Include name and phone in metadata as well (for receipts/emails)
      metadata: {
        // Customer information that will appear in emails
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customer_phone: shippingInfo.phone,
        custom_fields: [
          {
            display_name: "Full Name",
            variable_name: "full_name",
            value: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          },
          {
            display_name: "Phone Number",
            variable_name: "phone_number",
            value: shippingInfo.phone,
          },
          {
            display_name: "Shipping Address",
            variable_name: "shipping_address",
            value: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}`,
          },
        ],
        // Disable card tokenization for this transaction
        custom_filters: {
          recurring: false,
        },
      },
      text: isSubmitting ? "Placing Order..." : "Place Order",
      onSuccess,
      onClose,
    };

    if (paymentMethod === "Bank Transfer") {
      props.channels = ["bank_transfer"];
    }

    console.log("Paystack component props created:", props);
    return props;
  }, [shippingInfo, cartTotal, paymentMethod, isSubmitting, onSuccess, onClose]);

  // Empty cart view
  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Shopping Cart</h2>
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Checkout step
  if (step === "checkout") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Checkout</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Shipping Form */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>Delivery Information:</strong> We will call you to
                arrange delivery and discuss delivery fees based on your
                location.
              </p>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-xl font-bold mb-4">Shipping Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={shippingInfo.firstName}
                    onChange={handleInputChange}
                    className={`border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 ${
                      errors.firstName
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={shippingInfo.lastName}
                    onChange={handleInputChange}
                    className={`border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 ${
                      errors.lastName
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    className={`border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className={`border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 ${
                      errors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    className={`border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 ${
                      errors.address
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className={`border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 ${
                      errors.city
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    className={`border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 ${
                      errors.state
                        ? "border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-xl font-bold mb-4">Payment Method</h3>
              {["Card Payment", "Bank Transfer"].map((method) => (
                <label
                  key={method}
                  className="flex items-center gap-3 p-3 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50 transition"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="cursor-pointer"
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBackToCart}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Back to Cart
              </button>
              <div
                className="flex-1"
                onClick={(e) => {
                  if (!handlePaymentClick()) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <PaystackButton
                  {...componentProps}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg border p-6 h-fit sticky top-20">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="truncate mr-2">
                    {item.name} x{item.quantity}
                  </span>
                  <span>
                    ₦{((item.price || 0) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2" />
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₦{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee:</span>
                <span>Will be discussed</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₦{cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Issue Modal */}
        <StockIssueModal
          isOpen={showStockIssueModal}
          onClose={closeStockIssueModal}
          stockIssues={stockIssues}
        />
      </div>
    );
  }

  // Cart step (default)
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Shopping Cart</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border p-4 flex items-center gap-4"
            >
              <div className="w-20 h-20">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  ₦{item.price?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity - 1)
                  }
                  className="w-8 h-8 border rounded hover:bg-gray-100 transition flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-semibold">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity + 1)
                  }
                  className="w-8 h-8 border rounded hover:bg-gray-100 transition flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="font-bold min-w-[100px] text-right">
                ₦{((item.price || 0) * item.quantity).toLocaleString()}
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 transition p-1"
                aria-label={`Remove ${item.name} from cart`}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border p-6 h-fit sticky top-20">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery Fee:</span>
              <span>Call for quote</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Delivery fee will be discussed when we contact you
          </p>
          <button
            onClick={handleProceedToCheckout}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            {currentUser ? "Proceed to Checkout" : "Sign In to Checkout"}
          </button>
        </div>
      </div>

      {/* Stock Issue Modal */}
      <StockIssueModal
        isOpen={showStockIssueModal}
        onClose={closeStockIssueModal}
        stockIssues={stockIssues}
      />
    </div>
  );
});

CartPage.displayName = "CartPage";

export default CartPage;
