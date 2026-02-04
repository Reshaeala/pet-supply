import React, { memo, useCallback, useState } from "react";
import { Star } from "lucide-react";

const ProductCard = memo(({ product, addToCart }) => {
  const [imageError, setImageError] = useState(false);
  const handleAddToCart = useCallback(() => {
    addToCart(product);
  }, [product, addToCart]);

  const isImageUrl = product.image && product.image.startsWith("http");

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="text-center mb-3 min-h-[200px] flex items-center justify-center bg-gray-50 rounded overflow-hidden">
        {isImageUrl && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className="max-h-[200px] max-w-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-6xl">{product.image || "🛍️"}</div>
        )}
      </div>

      {/* Animal and Category Badges */}
      <div className="flex flex-wrap gap-1 mb-2">
        {product.animal && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            {product.animal}
          </span>
        )}
        {product.category && (
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
            {product.category}
          </span>
        )}
        {product.brand && (
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
            {product.brand}
          </span>
        )}
      </div>

      <h3
        className="font-semibold text-sm mb-2 line-clamp-2 min-h-[40px] flex-grow"
        title={product.name}
      >
        {product.name}
      </h3>

      {product.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
          {product.description}
        </p>
      )}

      {product.rating && (
        <div className="flex items-center gap-1 mb-2">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm">{product.rating}</span>
        </div>
      )}

      <div className="mt-auto">
        <div className="text-xl font-bold text-blue-600 mb-3">
          ₦{product.price?.toLocaleString() || "0"}
        </div>
        {product.stock !== undefined && (
          <div className="text-xs text-gray-500 mb-2">
            {product.stock > 0 ? (
              <span className="text-green-600">In Stock ({product.stock})</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>
        )}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          aria-label={`Add ${product.name} to cart`}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
