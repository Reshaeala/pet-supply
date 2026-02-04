import React, { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FeaturedProductCard from "../components/FeaturedProductCard";
import HeroBanner from "../components/HeroBanner";
import puppyImage from "../assets/puppy.jpeg";
import kittenImage from "../assets/kitten.jpg";
import birdImage from "../assets/bird.jpg";

const HomePage = memo(() => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        // Get top 8 products with highest ratings as featured products
        const featured = data
          .filter((product) => product.rating >= 4.0)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 8);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Save My Pet
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your one-stop shop for all pet supplies
          </p>
          <HeroBanner />
          <div className="mb-8">
            {/* I want to add our animal type cards here */}
            <div className="flex justify-center space-x-6 mb-4">
              <Link
                to="/products/dogs"
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
              >
                <img
                  src={puppyImage}
                  alt="Dogs"
                  className="h-40 w-40 object-cover rounded-lg mb-2 mx-auto"
                />
                <p className="text-gray-800 font-semibold">Dogs</p>
              </Link>
              <Link
                to="/products/cats"
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
              >
                <img
                  src={kittenImage}
                  alt="Cats"
                  className="h-40 w-40 object-cover rounded-lg mb-2 mx-auto"
                />
                <p className="text-gray-800 font-semibold">Cats</p>
              </Link>
              <Link
                to="/products/birds"
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
              >
                <img
                  src={birdImage}
                  alt="Birds"
                  className="h-40 w-40 object-cover rounded-lg mb-2 mx-auto"
                />
                <p className="text-gray-800 font-semibold">Birds</p>
              </Link>
            </div>
          </div>
          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Shop Now
          </Link>
        </div>
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading featured products...</p>
          </div>
        ) : featuredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {featuredProducts.map((product) => (
                <FeaturedProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/products"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                View All Products →
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No featured products available</p>
            <Link
              to="/products"
              className="text-blue-600 hover:underline mt-4 inline-block"
            >
              Browse all products →
            </Link>
          </div>
        )}
      </div>
    </>
  );
});

HomePage.displayName = "HomePage";

export default HomePage;
