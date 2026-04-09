import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ShoppingCart, Plus, Minus, ArrowLeft, CheckCircle2, Sparkles, ChevronRight } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { ProductCard } from "../components/ProductCard";
import { useApp } from "../context/AppContext";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart, isAuthenticated } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedThumb, setSelectedThumb] = useState(0);

  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[1280px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500 mb-4">Producto no encontrado.</p>
          <button onClick={() => navigate("/catalog")} className="text-[#2E75B6] hover:underline text-sm">Ir al catálogo</button>
        </div>
      </div>
    );
  }

  // Simulate multiple thumbnails with same image
  const thumbnails = [product.image, product.image, product.image];

  const similar = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 6);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

  const handleAddToCart = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    for (let i = 0; i < quantity; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const stockBadge = () => {
    if (product.stock === 0) return <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full">Agotado</span>;
    if (product.stock <= 5) return <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full">Últimas {product.stock} unidades</span>;
    return <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full">Disponible ({product.stock} en stock)</span>;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[1280px] mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-[#2E75B6]">Inicio</button>
          <ChevronRight size={12} />
          <button onClick={() => navigate("/catalog")} className="hover:text-[#2E75B6]">Catálogo</button>
          <ChevronRight size={12} />
          <button onClick={() => navigate(`/catalog?category=${encodeURIComponent(product.category)}`)} className="hover:text-[#2E75B6]">{product.category}</button>
          <ChevronRight size={12} />
          <span className="text-gray-600">{product.name}</span>
        </nav>

        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft size={15} /> Volver
        </button>

        {/* Main product section */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Image gallery */}
          <div>
            <div className="bg-gray-50 rounded-2xl overflow-hidden h-80 mb-3">
              <img src={thumbnails[selectedThumb]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2">
              {thumbnails.map((thumb, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedThumb(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${selectedThumb === i ? "border-[#2E75B6]" : "border-gray-100"}`}
                >
                  <img src={thumb} alt={`Vista ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div>
            <span className="text-sm text-[#2E75B6] mb-2 block">{product.category}</span>
            <h1 className="text-gray-900 text-2xl mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              {stockBadge()}
            </div>
            <p className="text-3xl text-[#2E75B6] font-bold mb-5">{formatPrice(product.price)}</p>

            {/* Quantity selector */}
            <div className="mb-5">
              <label className="block text-sm text-gray-700 mb-2">Cantidad</label>
              <div className={`flex items-center gap-3 ${product.stock === 0 ? "opacity-40" : ""}`}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={product.stock === 0}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <Minus size={15} />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={product.stock === 0}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium transition-all mb-3 ${
                product.stock === 0 ? "cursor-not-allowed" : ""
              }`}
              style={{
                backgroundColor: product.stock === 0 ? "#9CA3AF" : added ? "#16a34a" : "#2E75B6",
              }}
            >
              {added ? (
                <><CheckCircle2 size={16} /> ¡Agregado al carrito!</>
              ) : product.stock === 0 ? (
                <><ShoppingCart size={16} /> Sin stock disponible</>
              ) : (
                <><ShoppingCart size={16} /> Agregar al carrito</>
              )}
            </button>

            {/* Out of stock notice */}
            {product.stock === 0 && (
              <p className="text-xs text-gray-500 text-center mb-4">
                Te avisaremos cuando vuelva a estar disponible.{" "}
                <button className="hover:underline" style={{ color: "#2E75B6" }}>
                  Notificarme 🔔
                </button>
              </p>
            )}

            {/* Description */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-gray-800 mb-3">Descripción del producto</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Similar products */}
        {similar.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-[#2E75B6]" />
              <h2 className="text-gray-900">Productos similares</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">IA</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {similar.map(p => (
                <div key={p.id} className="flex-shrink-0 w-48">
                  <ProductCard product={p} compact />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}