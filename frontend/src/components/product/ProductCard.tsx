'use client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import type { Product } from '@/types';
import { formatCOP } from '@/types';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, isLoading: isCartLoading } = useCartStore();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isAuthenticated } = useAuthStore();

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    // Allow anonymous carts

    try {
      await addToCart(product.id, 1);
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer relative"
    >
      {/* Image Area */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={product.mainImage} 
            alt={product.name} 
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No image
          </div>
        )}

        {/* Badges */}
        {isOutOfStock ? (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">
            Agotado
          </div>
        ) : isLowStock ? (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
            ¡Últimas unidades!
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1">
        {product.categoryName && (
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">
            {product.categoryName}
          </span>
        )}
        
        <h3 className={`font-medium text-gray-900 leading-tight mb-2 flex-1 ${compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'}`}>
          {product.name}
        </h3>
        
        <div className="flex items-end justify-between mt-auto">
          <span className={`${compact ? 'text-sm' : 'text-base'} font-bold text-gray-900`}>
            {formatCOP(product.price)}
          </span>
        </div>

        {/* Add to Cart Button (Hidden on compact) */}
        {!compact && (
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isCartLoading}
            className={`mt-3 w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors
              ${isOutOfStock 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary-dark'
              }
            `}
          >
            <ShoppingCart size={14} />
            {isOutOfStock ? 'Sin stock' : 'Agregar'}
          </button>
        )}
      </div>
    </div>
  );
}
