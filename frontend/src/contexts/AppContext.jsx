import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState(() => {
    // Initialize cart from localStorage
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [toast, setToast] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Restore user session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const response = await fetch(`/api/users/${userId}`, {
            headers: {
              "x-user-id": userId,
            },
          });
          if (response.ok) {
            const user = await response.json();
            setCurrentUser(user);
          } else {
            // Invalid session, clear localStorage
            localStorage.removeItem("userId");
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
          localStorage.removeItem("userId");
        }
      }
      setIsLoadingUser(false);
    };

    restoreSession();
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Toast notification
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Cart operations
  const addToCart = useCallback((product) => {
    // Check if product is out of stock
    if (product.stock === 0) {
      showToast(`${product.name} is out of stock`, "error");
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      // Check if adding would exceed stock
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity > product.stock) {
          showToast(`Only ${product.stock} ${product.name} available in stock`, "error");
          return prevCart; // Don't add, return cart unchanged
        }
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      return [...prevCart, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} added to cart!`, "success");
  }, [showToast]);

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => {
      const item = prevCart.find((item) => item.id === productId);
      if (item) {
        showToast(`${item.name} removed from cart`, "info");
      }
      return prevCart.filter((item) => item.id !== productId);
    });
  }, [showToast]);

  const updateQuantity = useCallback(
    (productId, quantity) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      setCart((prevCart) =>
        prevCart.map((item) => {
          if (item.id === productId) {
            // Check if new quantity exceeds available stock
            if (item.stock && quantity > item.stock) {
              showToast(`Only ${item.stock} ${item.name} available in stock`, "error");
              return item; // Return unchanged
            }
            return { ...item, quantity };
          }
          return item;
        })
      );
    },
    [removeFromCart, showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Auth operations - unified login for all user types
  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || "Login failed");
      }

      const user = await response.json();
      setCurrentUser(user);
      setShowLoginModal(false);
      setLoginError("");
      // Store user ID in localStorage for API requests
      localStorage.setItem("userId", user.id.toString());
      showToast(`Welcome back, ${user.name}!`, "success");
      return user;
    } catch (error) {
      setLoginError(error.message);
      throw error;
    }
  }, [showToast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCart([]);
    localStorage.removeItem("userId");
    localStorage.removeItem("cart");
    showToast("Logged out successfully", "info");
  }, [showToast]);

  const openLoginModal = useCallback(() => {
    setShowLoginModal(true);
    setLoginError("");
  }, []);

  const closeLoginModal = useCallback(() => {
    setShowLoginModal(false);
    setLoginError("");
  }, []);

  // Signup operations
  const signup = useCallback(async (name, email, phone, password) => {
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || "Signup failed");
      }

      const user = await response.json();
      setCurrentUser(user);
      setShowSignupModal(false);
      setSignupError("");
      // Store user ID in localStorage for API requests
      localStorage.setItem("userId", user.id.toString());
      showToast(`Welcome to Save My Pet, ${user.name}!`, "success");
      return user;
    } catch (error) {
      setSignupError(error.message);
      throw error;
    }
  }, [showToast]);

  const openSignupModal = useCallback(() => {
    setShowSignupModal(true);
    setSignupError("");
  }, []);

  const closeSignupModal = useCallback(() => {
    setShowSignupModal(false);
    setSignupError("");
  }, []);

  // Memoized cart calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const value = useMemo(
    () => ({
      // State
      currentUser,
      cart,
      showLoginModal,
      showSignupModal,
      loginError,
      signupError,
      cartTotal,
      cartItemCount,
      toast,
      isLoadingUser,
      // Actions
      setCurrentUser,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      login,
      logout,
      openLoginModal,
      closeLoginModal,
      setLoginError,
      signup,
      openSignupModal,
      closeSignupModal,
      setSignupError,
      showToast,
      hideToast,
    }),
    [
      currentUser,
      cart,
      showLoginModal,
      showSignupModal,
      loginError,
      signupError,
      cartTotal,
      cartItemCount,
      toast,
      isLoadingUser,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      login,
      logout,
      openLoginModal,
      closeLoginModal,
      signup,
      openSignupModal,
      closeSignupModal,
      showToast,
      hideToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
