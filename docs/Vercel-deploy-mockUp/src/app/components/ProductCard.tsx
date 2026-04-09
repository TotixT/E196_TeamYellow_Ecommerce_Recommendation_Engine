import { useNavigate } from "react-router";
import { ShoppingCart } from "lucide-react";
import { Product, useApp } from "../context/AppContext";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart, isAuthenticated } = useApp();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

  const isOutOfStock = product.stock === 0;

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className={`relative overflow-hidden bg-gray-50 ${compact ? "h-36" : "h-48"}`}>
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? "opacity-60" : ""}`}
        />
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-gray-100/20" />
        )}
        {/* Badges */}
        {isOutOfStock ? (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            Agotado
          </span>
        ) : product.stock <= 5 ? (
          <span className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
            ¡Últimas unidades!
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <p className="text-xs text-[#2E75B6] mb-0.5">{product.category}</p>
        <h3 className={`text-gray-800 mb-1 line-clamp-2 ${compact ? "text-sm" : "text-sm"}`}>{product.name}</h3>
        <p className={`font-semibold mb-2 ${isOutOfStock ? "text-gray-400" : "text-[#2E75B6]"}`}>{formatPrice(product.price)}</p>
        {!compact && (
          <button
            onClick={e => {
              e.stopPropagation();
              if (isOutOfStock) return;
              if (isAuthenticated) addToCart(product);
              else navigate("/login");
            }}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${
              isOutOfStock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "text-white"
            }`}
            style={isOutOfStock ? {} : { backgroundColor: "#2E75B6" }}
          >
            <ShoppingCart size={15} />
            {isOutOfStock ? "Sin stock" : "Agregar al carrito"}
          </button>
        )}
      </div>
    </div>
  );
}