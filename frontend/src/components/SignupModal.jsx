import React, { useState, useCallback, memo } from "react";
import { X } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";

const SignupModal = memo(() => {
  const { showSignupModal, signupError, signup, closeSignupModal } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError("");
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setValidationError("");

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setValidationError("Passwords do not match");
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        setValidationError("Password must be at least 6 characters");
        return;
      }

      setIsLoading(true);
      try {
        await signup(formData.name, formData.email, formData.phone, formData.password);
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
        navigate("/");
      } catch (error) {
        // Error is handled by context
      } finally {
        setIsLoading(false);
      }
    },
    [formData, signup, navigate]
  );

  const handleClose = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setValidationError("");
    closeSignupModal();
  }, [closeSignupModal]);

  if (!showSignupModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="signup-modal-title" className="text-2xl font-bold">
            Create Account
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
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="name"
            aria-label="Full name"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="email"
            aria-label="Email address"
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number (optional)"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="tel"
            aria-label="Phone number"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="new-password"
            aria-label="Password"
            minLength={6}
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="new-password"
            aria-label="Confirm password"
          />

          {(validationError || signupError) && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              role="alert"
            >
              {validationError || signupError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
});

SignupModal.displayName = "SignupModal";

export default SignupModal;
