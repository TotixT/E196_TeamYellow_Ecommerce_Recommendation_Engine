'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { formatCOP } from '@/types';

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, itemCount, isLoading, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleUpdateQuantity = async (itemId: number, currentQuantity: number, maxStock: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemove = async (itemId: number) => {
    await removeItem(itemId);
  };

  // Determine if there are stock conflicts
  const stockConflicts = items.filter(item => item.quantity > item.product.stock);
  const hasConflicts = stockConflicts.length > 0;

  const shippingCost = 15; // Standard flat shipping cost
  const total = subtotal + (items.length > 0 ? shippingCost : 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Carrito</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center flex flex-col items-center border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Aún no has agregado ningún producto. Explora nuestro catálogo y descubre productos ideales para ti.
            </p>
            <Link 
              href="/catalog" 
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-sm"
            >
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Cart Items List */}
            <div className="flex-1">
              {hasConflicts && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <span className="text-amber-500 mt-0.5">⚠️</span>
                  <div>
                    <h3 className="text-sm font-bold text-amber-800">Atención con el inventario</h3>
                    <p className="text-sm text-amber-700">Algunos productos en tu carrito superan el stock disponible actualmente. Por favor, ajusta las cantidades.</p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                  <div className="col-span-6">Producto</div>
                  <div className="col-span-2 text-center">Precio Un.</div>
                  <div className="col-span-2 text-center">Cantidad</div>
                  <div className="col-span-2 text-right pr-2">Subtotal</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const product = item.product;
                    const conflict = item.quantity > product.stock;
                    
                    return (
                      <div key={item.id} className={`p-4 md:p-6 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                        
                        {/* Product Info */}
                        <div className="md:col-span-6 flex gap-4">
                          <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                            {product.mainImage ? (
                               // eslint-disable-next-line @next/next/no-img-element
                               <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">N/A</div>
                            )}
                          </div>
                          <div className="flex flex-col justify-center">
                            <span className="text-xs font-bold text-primary mb-1">{product.categoryName}</span>
                            <Link href={`/product/${product.id}`} className="text-sm font-medium text-gray-900 hover:underline line-clamp-2">
                              {product.name}
                            </Link>
                            {conflict && <span className="text-xs text-red-500 font-medium mt-1">Stock disponible: {product.stock}</span>}
                          </div>
                        </div>

                        {/* Unit Price (Mobile & Desktop) */}
                        <div className="md:col-span-2 md:text-center text-sm font-medium text-gray-600 flex justify-between md:block">
                          <span className="md:hidden text-gray-400">Precio:</span>
                          {formatCOP(item.unitPrice)}
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                           <span className="md:hidden text-sm text-gray-400">Cantidad:</span>
                           <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                              <button 
                                onClick={() => handleUpdateQuantity(item.id, item.quantity, product.stock, -1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className={`w-8 text-center text-sm font-medium ${conflict ? 'text-red-600' : 'text-gray-900'}`}>
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => handleUpdateQuantity(item.id, item.quantity, product.stock, 1)}
                                disabled={item.quantity >= product.stock}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                           </div>
                        </div>

                        {/* Subtotal & Delete */}
                        <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
                           <span className="md:hidden text-sm text-gray-400">Total:</span>
                           <span className="text-sm font-bold text-gray-900">
                             {formatCOP(Number(item.unitPrice) * item.quantity)}
                           </span>
                           <button 
                             onClick={() => handleRemove(item.id)}
                             className="text-gray-400 hover:text-red-500 transition-colors p-2 md:p-0"
                             title="Eliminar producto"
                           >
                             <Trash2 size={18} />
                           </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Resumen de orden</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})</span>
                    <span className="font-medium">{formatCOP(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Envío</span>
                    <span className="font-medium">{formatCOP(shippingCost)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-base">Total</span>
                    <span className="font-bold text-primary text-xl">{formatCOP(total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push('/login?redirect=/checkout');
                    } else {
                      router.push('/checkout');
                    }
                  }}
                  disabled={hasConflicts || isLoading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceder al pago <ArrowRight size={18} />
                </button>

                <div className="mt-4 text-center">
                   <Link href="/catalog" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                     Continuar comprando
                   </Link>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
