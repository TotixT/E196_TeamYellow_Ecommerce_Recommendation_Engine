'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Check, ChevronRight, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { formatCOP } from '@/types';
import type { Product } from '@/types';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToCart, isLoading: isCartLoading } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showAddedSuccess, setShowAddedSuccess] = useState(false);

  // Fetch Product
  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['product', resolvedParams.id],
    queryFn: async () => {
      const res = await api.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(resolvedParams.id));
      // Track product view asynchronously
      api.post('/recommendations/track-view', { productId: Number(resolvedParams.id) }).catch(() => {});
      return res.data;
    },
  });

  // Fetch Similar Recommendations
  const { data: similarProducts = [] } = useQuery({
    queryKey: ['recommendations', 'product', resolvedParams.id],
    queryFn: async () => {
      try {
        const res = await api.get<Product[]>(API_ENDPOINTS.RECOMMENDATIONS.PRODUCT(resolvedParams.id));
        return res.data.filter(p => p.id !== Number(resolvedParams.id)).slice(0, 4);
      } catch (err) {
        return [];
      }
    },
    enabled: !!product, // Only fetch after we have the product
  });

  const handleAddToCart = async () => {
    // Allow anonymous carts
    
    if (!product) return;

    try {
      await addToCart(product.id, quantity);
      setShowAddedSuccess(true);
      setTimeout(() => setShowAddedSuccess(false), 3000);
    } catch (error) {
      // Error handled in store
    }
  };

  const isOutOfStock = product?.stock === 0;
  const isLowStock = product && product.stock > 0 && product.stock <= 5;
  const currentImage = activeImage || product?.mainImage;

  if (isProductLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-20 text-center flex flex-col items-center">
           <PackageOpen className="h-16 w-16 text-gray-300 mb-4" />
           <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
           <p className="text-gray-500 mb-6">El producto que buscas no existe o ha sido retirado.</p>
           <button onClick={() => router.push('/catalog')} className="bg-primary text-white px-6 py-2 rounded-lg font-medium">Volver al catálogo</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link href="/catalog" className="hover:text-primary transition-colors">Catálogo</Link>
          {product.categoryName && (
            <>
              <ChevronRight size={14} className="mx-2" />
              <Link href={`/catalog?category=${product.categoryId}`} className="hover:text-primary transition-colors">
                {product.categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={14} className="mx-2" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Images Section */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center relative">
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt={product.name} 
                  className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                />
              ) : (
                <div className="text-gray-300">Sin imagen</div>
              )}

              {isOutOfStock ? (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  Agotado
                </div>
              ) : isLowStock ? (
                <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  ¡Últimas unidades!
                </div>
              ) : (
                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  Disponible
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                  onClick={() => setActiveImage(product.mainImage || null)}
                  className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${currentImage === product.mainImage ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={product.mainImage!} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
                {product.images.map((img) => (
                  <button 
                    key={img.id}
                    onClick={() => setActiveImage(img.imageUrl)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${currentImage === img.imageUrl ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <span className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
              {product.categoryName}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>
            
            <div className="text-3xl font-bold text-gray-900 mb-6">
              {formatCOP(product.price)}
            </div>

            <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
              <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>

            <div className="border-t border-gray-100 pt-8 mt-auto">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Quantity */}
                <div className="w-full sm:w-auto flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={isOutOfStock || quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    disabled={isOutOfStock || quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isCartLoading || showAddedSuccess}
                  className={`flex-1 w-full h-12 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                    ${showAddedSuccess 
                      ? 'bg-green-500 text-white' 
                      : isOutOfStock 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md'
                    }
                  `}
                >
                  {showAddedSuccess ? (
                    <><Check size={20} /> Agregado al carrito</>
                  ) : (
                    <><ShoppingCart size={20} /> {isOutOfStock ? 'Sin stock disponible' : 'Agregar al carrito'}</>
                  )}
                </button>
              </div>
              
              {!isOutOfStock && product.stock > 0 && (
                 <p className="text-xs text-gray-500 mt-3 text-center sm:text-left">
                   Disponibles: <span className="font-medium text-gray-900">{product.stock} unidades</span>
                 </p>
              )}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Productos similares que podrían interesarte</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
