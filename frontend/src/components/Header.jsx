import React, { memo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Shield, Search, Settings, Package } from "lucide-react";
import { useApp } from "../contexts/AppContext";

const Header = memo(() => {
  const { currentUser, cartItemCount, logout, openLoginModal, openSignupModal } = useApp();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="bg-blue-600 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold cursor-pointer">
            🐾 Save My Pet
          </Link>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white rounded-lg px-3 py-1.5">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="ml-2 text-gray-800 outline-none text-sm w-48"
                aria-label="Search products"
              />
            </form>

            <button
              onClick={handleCartClick}
              className="relative"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={22} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItemCount}
                </span>
              )}
            </button>

            {currentUser ? (
              <>
                {["admin", "superadmin"].includes(currentUser.role) && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="hidden md:flex items-center gap-1 bg-blue-700 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-800 transition"
                  >
                    <Shield size={16} />
                    Dashboard
                  </button>
                )}
                <div className="relative">
                  <button
                    className="flex items-center gap-2"
                    aria-label="User menu"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <User size={22} />
                    <span className="hidden md:inline text-sm">
                      {currentUser.name || currentUser.email}
                    </span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/settings");
                        }}
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Settings size={16} />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/orders");
                        }}
                        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Package size={16} />
                        My Orders
                      </button>
                      <hr className="my-2" />
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => openLoginModal()}
                  className="bg-white text-blue-600 px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openSignupModal()}
                  className="bg-blue-700 text-white px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-blue-800 transition"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";

export default Header;
