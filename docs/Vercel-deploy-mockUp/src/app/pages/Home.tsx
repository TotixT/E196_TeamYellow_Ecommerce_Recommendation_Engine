import { useNavigate } from "react-router";
import { Sparkles, ArrowRight, ChevronRight } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { ProductCard } from "../components/ProductCard";
import { useApp } from "../context/AppContext";

const CATEGORIES = [
  { name: "Audio", icon: "🎧" },
  { name: "Computadores", icon: "💻" },
  { name: "Celulares", icon: "📱" },
  { name: "Accesorios", icon: "⌚" },
  { name: "Fotografía", icon: "📷" },
  { name: "Tablets", icon: "📟" },
  { name: "Gaming", icon: "🎮" },
];

export function Home() {
  const navigate = useNavigate();
  const { products } = useApp();

  // Shuffle for recommendations (simulated AI)
  const recommended = [...products].sort(() => 0.5 - Math.random()).slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Banner */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a5296 0%, #2E75B6 50%, #4a9fd4 100%)" }}
      >
        <div className="max-w-[1280px] mx-auto px-6 py-16 flex items-center gap-8">
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs px-3 py-1.5 rounded-full mb-4">
              <Sparkles size={13} />
              Recomendaciones impulsadas por IA
            </div>
            <h1 className="text-white text-4xl mb-4 leading-tight">
              Tecnología de última generación,{" "}
              <span className="text-yellow-300">a tu alcance</span>
            </h1>
            <p className="text-blue-100 text-base mb-8 leading-relaxed">
              Descubre miles de productos con recomendaciones personalizadas.
              Nuestro motor inteligente aprende de tus preferencias.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/catalog")}
                className="bg-white text-[#2E75B6] px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                Explorar catálogo <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate("/register")}
                className="border border-white/50 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                Crear cuenta gratis
              </button>
            </div>
          </div>
          <div className="hidden lg:block flex-1 relative h-64">
            <img
              src="https://images.unsplash.com/photo-1758874385215-c86fe62b446f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
              alt="Shopping"
              className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-30"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 4).map(p => (
                  <div key={p.id} className="w-28 h-28 bg-white/20 rounded-xl overflow-hidden backdrop-blur-sm">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-80" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900">Categorías</h2>
          <button onClick={() => navigate("/catalog")} className="text-sm flex items-center gap-1 hover:underline" style={{ color: "#2E75B6" }}>
            Ver todas <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => navigate(`/catalog?category=${encodeURIComponent(cat.name)}`)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl px-5 py-3 transition-colors"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs text-gray-700">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recommendations section */}
      <section className="max-w-[1280px] mx-auto px-6 py-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: "#2E75B6" }}>
              <Sparkles size={13} className="text-white" />
            </div>
            <h2 className="text-gray-900">Recomendados para ti</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-1">IA</span>
          </div>
          <button onClick={() => navigate("/catalog")} className="text-sm flex items-center gap-1 hover:underline" style={{ color: "#2E75B6" }}>
            Ver más <ChevronRight size={14} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5 -mt-3">
          Seleccionados especialmente para ti según tu historial de navegación y compras.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommended.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Banner section */}
      <section className="max-w-[1280px] mx-auto px-6 pb-12">
        <div
          className="rounded-2xl p-8 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #1e3a5f, #2E75B6)" }}
        >
          <div>
            <h2 className="text-white text-xl mb-2">¿Eres nuevo por aquí?</h2>
            <p className="text-blue-200 text-sm">Regístrate y obtén envío gratis en tu primera compra.</p>
          </div>
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-[#2E75B6] px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex-shrink-0"
          >
            Registrarme ahora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © 2026 Ecommerce Intelligent Engine. Todos los derechos reservados.
      </footer>
    </div>
  );
}
