import React, { memo, useState } from "react";
import { Link } from "react-router-dom";

const FeaturedProductCard = memo(({ product }) => {
  const [imageError, setImageError] = useState(false);
  const isImageUrl = product.image && product.image.startsWith("http");
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Link
      to={`/product/${product.id}`}
      className={`bg-white border rounded-lg p-4 hover:shadow-lg transition-all duration-200 flex flex-col cursor-pointer relative ${
        isOutOfStock ? "opacity-75" : ""
      }`}
    >
      {/* Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          Out of Stock
        </div>
      )}
      {isLowStock && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          Only {product.stock} left
        </div>
      )}

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

      <h3
        className="font-semibold text-sm mb-2 line-clamp-2 text-center"
        title={product.name}
      >
        {product.name}
      </h3>

      <div className="text-lg font-bold text-blue-600 text-center">
        ₦{product.price?.toLocaleString() || "0"}
      </div>
    </Link>
  );
});

FeaturedProductCard.displayName = "FeaturedProductCard";

export default FeaturedProductCard;
