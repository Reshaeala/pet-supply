import React, { useState, useCallback, memo } from "react";
import { X } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";

const LoginModal = memo(() => {
  const { showLoginModal, loginError, login, closeLoginModal } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const user = await login(email, password);
        setEmail("");
        setPassword("");

        // Auto-route based on user role
        if (user.role === "superadmin" || user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } catch (error) {
        // Error is handled by context
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, login, navigate]
  );

  const handleClose = useCallback(() => {
    setEmail("");
    setPassword("");
    closeLoginModal();
  }, [closeLoginModal]);

  if (!showLoginModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="login-modal-title" className="text-2xl font-bold">
            Login
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="hover:bg-gray-100 rounded-full p-1 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="email"
            aria-label="Email address"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="current-password"
            aria-label="Password"
          />

          {loginError && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              role="alert"
            >
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <div className="text-xs text-gray-600 text-center space-y-1">
            <p className="font-semibold">Demo Accounts:</p>
            <p>SuperAdmin: superadmin@petmart.ng / super123</p>
            <p>Admin: admin@petmart.ng / admin123</p>
            <p>Customer: customer@petmart.ng / customer123</p>
          </div>
        </form>
      </div>
    </div>
  );
});

LoginModal.displayName = "LoginModal";

export default LoginModal;
