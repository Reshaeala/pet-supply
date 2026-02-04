import React, { useEffect, useState, useMemo, memo, useRef } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useApp } from "../contexts/AppContext";
import { Filter, X, Search } from "lucide-react";

// Capitalize first letter for display
const capitalize = (str) => {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
};

const AnimalProductsPage = memo(() => {
  const { animal: animalParam } = useParams();
  const animal = capitalize(animalParam);
  const { addToCart } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedLifeStages, setSelectedLifeStages] = useState([]);
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 100000;
    return Math.max(...products.map((p) => p.price || 0), 100000);
  }, [products]);

  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Use capitalized animal name for API query
        const response = await fetch(
          `/api/products?animal=${encodeURIComponent(animal)}`
        );
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

    if (animal) {
      fetchProducts();
    }
  }, [animal]);

  // Get unique values for filters
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category))).sort();
  }, [products]);

  const brands = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.brand || "Save My Pet"))
    ).sort();
  }, [products]);

  const lifeStages = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.lifeStage || "Adult"))
    ).sort();
  }, [products]);

  // Update price range when products load
  useEffect(() => {
    if (products.length > 0 && maxPrice > 0 && priceRange.max === 100000) {
      setPriceRange({ min: 0, max: maxPrice });
    }
  }, [maxPrice, products.length, priceRange.max]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        selectedBrands.includes(product.brand || "Save My Pet")
      );
    }

    // Filter by life stages
    if (selectedLifeStages.length > 0) {
      filtered = filtered.filter((product) =>
        selectedLifeStages.includes(product.lifeStage || "Adult")
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange.min && product.price <= priceRange.max
    );

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
    selectedCategories,
    selectedBrands,
    selectedLifeStages,
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

  const toggleLifeStage = (lifeStage) => {
    setSelectedLifeStages((prev) =>
      prev.includes(lifeStage)
        ? prev.filter((l) => l !== lifeStage)
        : [...prev, lifeStage]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedLifeStages([]);
    setPriceRange({ min: 0, max: maxPrice });
    setSearchTerm("");
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedLifeStages.length > 0 ||
    priceRange.min > 0 ||
    priceRange.max < maxPrice ||
    searchTerm.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {animal} products...</p>
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

  const animalEmoji = {
    Dogs: "🐕",
    Cats: "🐱",
    Birds: "🐦",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{animalEmoji[animal] || "🛍️"}</span>
          <h1 className="text-3xl font-bold">{animal} Products</h1>
        </div>
        <p className="text-gray-600">
          Discover the best products for your {animal.toLowerCase()}
        </p>
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
            placeholder={`Search ${animal} products...`}
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
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({
                      ...priceRange,
                      min: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded px-2 py-1 text-sm"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({
                      ...priceRange,
                      max: parseInt(e.target.value) || maxPrice,
                    })
                  }
                  className="w-full border rounded px-2 py-1 text-sm"
                  max={maxPrice}
                />
              </div>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({
                    ...priceRange,
                    max: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">
                ₦{priceRange.min.toLocaleString()} - ₦
                {priceRange.max.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3 text-gray-700">
              Category
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((category) => {
                const count = products.filter(
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
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map((brand) => {
                const count = products.filter(
                  (p) => (p.brand || "Save My Pet") === brand
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

          {/* Life Stage Filter */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3 text-gray-700">
              Life Stage
            </h3>
            <div className="space-y-2">
              {lifeStages.map((lifeStage) => {
                const count = products.filter(
                  (p) => (p.lifeStage || "Adult") === lifeStage
                ).length;
                return (
                  <label
                    key={lifeStage}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLifeStages.includes(lifeStage)}
                      onChange={() => toggleLifeStage(lifeStage)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {lifeStage}
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
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Filter size={20} />
                Filters
              </button>
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
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {brand}
                  <button
                    onClick={() => toggleBrand(brand)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {selectedLifeStages.map((lifeStage) => (
                <span
                  key={lifeStage}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {lifeStage}
                  <button
                    onClick={() => toggleLifeStage(lifeStage)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {(priceRange.min > 0 || priceRange.max < maxPrice) && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  ₦{priceRange.min.toLocaleString()} - ₦
                  {priceRange.max.toLocaleString()}
                  <button
                    onClick={() => setPriceRange({ min: 0, max: maxPrice })}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
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
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                />
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
            {/* Same filter content as sidebar - can be extracted to a component */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 mb-4"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

AnimalProductsPage.displayName = "AnimalProductsPage";

export default AnimalProductsPage;
