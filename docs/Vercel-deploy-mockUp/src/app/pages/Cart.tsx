import { useState } from "react";
import { useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useApp } from "../context/AppContext";

// Simulate stock limits for conflict detection
const MOCK_AVAILABLE_STOCK: Record<number, number> = {
  1: 1, // simulate low stock for first product
};

export function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, products } = useApp();
  const [dismissed, setDismissed] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 15000 : 0;
  const total = subtotal + shipping;

  // Check for stock conflicts: item quantity > available product stock
  const getAvailableStock = (itemId: number) => {
    const product = products.find(p => p.id === itemId);
    return product ? product.stock : 0;
  };

  const conflicts = cart.filter(item => item.quantity > getAvailableStock(item.id));
  const hasConflicts = conflicts.length > 0 && !dismissed;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[1280px] mx-auto px-6 py-20 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-6">
            <ShoppingBag size={40} className="text-gray-300" />
          </div>
          <h2 className="text-gray-700 text-xl mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-xs">
            Agrega productos desde el catálogo para comenzar tu compra
          </p>
          <button
            onClick={() => navigate("/catalog")}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-white text-sm"
            style={{ backgroundColor: "#2E75B6" }}
          >
            Explorar catálogo →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <h1 className="text-gray-900 text-2xl mb-6">Carrito de compras</h1>

        {/* Stock conflict warning banner */}
        {hasConflicts && (
          <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-amber-500" />
            <div className="flex-1">
              <span>Algunos productos ya no tienen el stock solicitado. Revisa las cantidades antes de continuar.</span>
            </div>
            <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-600 text-lg leading-none">×</button>
          </div>
        )}

        <div className="flex gap-8 flex-col lg:flex-row">
          {/* Cart items */}
          <div className="flex-1">
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <span className="col-span-5">Producto</span>
                <span className="col-span-2 text-center">Precio</span>
                <span className="col-span-3 text-center">Cantidad</span>
                <span className="col-span-2 text-right">Subtotal</span>
              </div>

              {cart.map(item => {
                const availableStock = getAvailableStock(item.id);
                const hasStockConflict = item.quantity > availableStock && availableStock > 0;

                return (
                  <div
                    key={item.id}
                    className={`grid grid-cols-12 gap-2 items-center px-4 py-4 border-b border-gray-50 last:border-0 ${
                      hasStockConflict ? "border-l-4 border-l-amber-400 bg-amber-50/30" : ""
                    }`}
                  >
                    {/* Product */}
                    <div className="col-span-5 flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg bg-gray-50 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-800 line-clamp-2">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                        {hasStockConflict && (
                          <p className="text-xs mt-0.5" style={{ color: "#D97706" }}>
                            Solo quedan {availableStock} unidades disponibles
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Unit price */}
                    <div className="col-span-2 text-center text-sm text-gray-700">
                      {formatPrice(item.price)}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-3 flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateQuantity(item.id, Number(e.target.value))}
                        className={`w-10 text-center text-sm border rounded px-1 py-0.5 focus:outline-none ${
                          hasStockConflict ? "border-red-400 bg-red-50" : "border-gray-200"
                        }`}
                        min={1}
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Subtotal + delete */}
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className="text-sm font-medium text-gray-800">{formatPrice(item.price * item.quantity)}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-600 transition-colors ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:w-72">
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 sticky top-20">
              <h3 className="text-gray-800 mb-4">Resumen del pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} artículos)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium text-gray-900">
                  <span>Total</span>
                  <span className="text-[#2E75B6]">{formatPrice(total)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium"
                style={{ backgroundColor: "#2E75B6" }}
              >
                Proceder al pago <ArrowRight size={15} />
              </button>
              <button
                onClick={() => navigate("/catalog")}
                className="w-full mt-2 py-2.5 rounded-xl text-sm text-gray-600 border border-gray-200 hover:bg-white"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}