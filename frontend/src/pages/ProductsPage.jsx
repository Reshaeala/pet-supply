import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { Filter, X, Search } from "lucide-react";
import FeaturedProductCard from "../components/FeaturedProductCard";

const ProductsPage = () => {
  const { animal } = useParams(); // Get animal from URL (dogs/cats/birds)
  const [searchParams] = useSearchParams();
  const { addToCart } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Set search term from URL query parameter
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  // Get categories and brands for current animal filter
  const categories = useMemo(() => {
    const filtered = animal
      ? products.filter((p) => p.animal?.toLowerCase() === animal.toLowerCase())
      : products;
    return Array.from(
      new Set(filtered.map((p) => p.category).filter(Boolean))
    ).sort();
  }, [products, animal]);

  const brands = useMemo(() => {
    const filtered = animal
      ? products.filter((p) => p.animal?.toLowerCase() === animal.toLowerCase())
      : products;
    return Array.from(
      new Set(filtered.map((p) => p.brand).filter(Boolean))
    ).sort();
  }, [products, animal]);

  // Filter products based on URL animal parameter and filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by URL animal parameter
    if (animal) {
      filtered = filtered.filter(
        (product) => product.animal?.toLowerCase() === animal.toLowerCase()
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        selectedBrands.includes(product.brand)
      );
    }

    // Filter by price range
    if (priceRange.min !== "") {
      filtered = filtered.filter(
        (product) => product.price >= Number(priceRange.min)
      );
    }
    if (priceRange.max !== "") {
      filtered = filtered.filter(
        (product) => product.price <= Number(priceRange.max)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    const sorted = [...filtered];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return sorted;
  }, [
    products,
    animal,
    selectedCategories,
    selectedBrands,
    priceRange,
    searchTerm,
    sortBy,
  ]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange({ min: "", max: "" });
    setSearchTerm("");
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    priceRange.min !== "" ||
    priceRange.max !== "" ||
    searchTerm.length > 0;

  const pageTitle = animal
    ? `${animal.charAt(0).toUpperCase() + animal.slice(1)} Products`
    : "All Products";

  const animalEmoji =
    animal === "dogs"
      ? "🐕"
      : animal === "cats"
      ? "🐱"
      : animal === "birds"
      ? "🐦"
      : "🏪";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Animal-specific header */}
      {/* TODO: This needs to be centered */}
      {animal && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">{animalEmoji}</span>
            <h1 className="text-3xl font-bold">{pageTitle}</h1>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search products"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside
          className={`${
            showMobileFilters ? "block" : "hidden"
          } md:block w-full md:w-64 flex-shrink-0 bg-white border rounded-lg p-4 h-fit sticky top-20`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3 text-gray-700">
              Price Range
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Min Price (₦)
                </label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                  placeholder="0"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">
                  Max Price (₦)
                </label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                  placeholder="Any"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3 text-gray-700">
              Category
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.map((category) => {
                const count = filteredProducts.filter(
                  (p) => p.category === category
                ).length;
                return (
                  <label
                    key={category}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {category}
                      <span className="text-gray-400 ml-1">({count})</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3 text-gray-700">Brand</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {brands.map((brand) => {
                const count = filteredProducts.filter(
                  (p) => p.brand === brand
                ).length;
                return (
                  <label
                    key={brand}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {brand}
                      <span className="text-gray-400 ml-1">({count})</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
              {hasActiveFilters && " found"}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mb-4 flex flex-wrap gap-2">
              {priceRange.min !== "" && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  Min: ₦{Number(priceRange.min).toLocaleString()}
                  <button
                    onClick={() => setPriceRange({ ...priceRange, min: "" })}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {priceRange.max !== "" && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  Max: ₦{Number(priceRange.max).toLocaleString()}
                  <button
                    onClick={() => setPriceRange({ ...priceRange, max: "" })}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedCategories.map((category) => (
                <span
                  key={category}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {category}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {selectedBrands.map((brand) => (
                <span
                  key={brand}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {brand}
                  <button
                    onClick={() => toggleBrand(brand)}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-600 text-lg mb-4">No products found</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <FeaturedProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Price Range
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Min Price (₦)
                  </label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                    placeholder="0"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Max Price (₦)
                  </label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                    placeholder="Any"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Category
              </h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const count = filteredProducts.filter(
                    (p) => p.category === category
                  ).length;
                  return (
                    <label
                      key={category}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {category}
                        <span className="text-gray-400 ml-1">({count})</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                Brand
              </h3>
              <div className="space-y-2">
                {brands.map((brand) => {
                  const count = filteredProducts.filter(
                    (p) => p.brand === brand
                  ).length;
                  return (
                    <label
                      key={brand}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {brand}
                        <span className="text-gray-400 ml-1">({count})</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
