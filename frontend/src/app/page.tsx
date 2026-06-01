'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ArrowRight, ChevronRight, Package } from 'lucide-react';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { useAuthStore } from '@/store/auth-store';
import type { Category, Product } from '@/types';

const CATEGORY_ICONS: Record<string, string> = {
  'Audio': '🎧',
  'Computadores': '💻',
  'Laptops': '💻',
  'Celulares': '📱',
  'Smartphones': '📱',
  'Accesorios': '🔌',
  'Fotografía': '📷',
  'Cámaras': '📷',
  'Tablets': '📱',
  'Gaming': '🎮',
  'Consolas': '🎮',
  'Smartwatches': '⌚',
  'Monitores': '🖥️',
  'Drones': '🚁',
  'Hogar Inteligente': '🏠',
  'Componentes PC': '⚙️',
};

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Fetch Categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<{ data: Category[] }>(API_ENDPOINTS.CATEGORIES.BASE);
      return res.data.data;
    },
  });

  // Pick 2 random categories for exploration
  const [randomCategories, setRandomCategories] = useState<Category[]>([]);
  useEffect(() => {
    if (categories.length > 0) {
      const shuffled = [...categories].sort(() => 0.5 - Math.random());
      setRandomCategories(shuffled.slice(0, 2));
    }
  }, [categories]);

  // Fetch Recommendations (or popular products if empty)
  const { data: recommendations = [], isLoading: isRecsLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      try {
        const res = await api.get<Product[]>(API_ENDPOINTS.RECOMMENDATIONS.HOME);
        if (res.data && res.data.length > 0) return res.data.slice(0, 6);
        throw new Error('Empty recs');
      } catch (err) {
        // Fallback to popular products
        const fallback = await api.get<{ data: Product[] }>(API_ENDPOINTS.PRODUCTS.BASE, {
          params: { limit: 6, sortBy: 'purchaseCount', sortOrder: 'desc' }
        });
        return fallback.data.data;
      }
    },
    staleTime: 0, // Always fetch fresh recommendations on mount
    refetchOnMount: true,
  });

  // Drag to scroll logic for categories
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Banner */}
      <section 
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a5296 0%, #2E75B6 50%, #4a9fd4 100%)' }}
      >
        <div className="max-w-[1280px] mx-auto px-6 py-16 flex items-center gap-8">
          <div className="flex-1 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs px-3 py-1.5 rounded-full mb-4 border border-white/10 backdrop-blur-sm">
              <Sparkles size={13} />
              Recomendaciones impulsadas por IA
            </div>
            <h1 className="text-white text-4xl mb-4 leading-tight font-bold">
              Tecnología de última generación, <span className="text-yellow-300">a tu alcance</span>
            </h1>
            <p className="text-blue-100 text-base mb-8 leading-relaxed">
              Descubre miles de productos con recomendaciones personalizadas. 
              Nuestro motor inteligente aprende de tus preferencias para mostrarte exactamente lo que buscas.
            </p>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => router.push('/catalog')}
                className="bg-white text-primary px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                Explorar catálogo <ArrowRight size={16} />
              </button>
              {!isAuthenticated && (
                <button 
                  onClick={() => router.push('/register')}
                  className="border border-white/50 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Crear cuenta gratis
                </button>
              )}
            </div>
          </div>
          
          <div className="hidden lg:block flex-1 relative h-[320px] z-10">
            {/* Abstract decorative grid highlighting features */}
            <div className="absolute inset-0 grid grid-cols-2 gap-4 animate-slide-up">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col justify-center items-center text-center hover:bg-white/20 transition-colors cursor-default">
                <Sparkles className="text-yellow-300 mb-3" size={32} />
                <h3 className="text-white font-bold text-sm">Motor Predictivo</h3>
                <p className="text-blue-100/70 text-xs mt-1">Aprende de tus gustos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col justify-center items-center text-center hover:bg-white/20 transition-colors cursor-default">
                <Package className="text-green-300 mb-3" size={32} />
                <h3 className="text-white font-bold text-sm">Stock en Tiempo Real</h3>
                <p className="text-blue-100/70 text-xs mt-1">Inventario actualizado</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col justify-center items-center text-center hover:bg-white/20 transition-colors cursor-default">
                <ArrowRight className="text-blue-300 mb-3" size={32} />
                <h3 className="text-white font-bold text-sm">Entregas Rápidas</h3>
                <p className="text-blue-100/70 text-xs mt-1">A todo el país</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col justify-center items-center text-center hover:bg-white/20 transition-colors cursor-default">
                <Sparkles className="text-purple-300 mb-3" size={32} />
                <h3 className="text-white font-bold text-sm">Recomendaciones</h3>
                <p className="text-blue-100/70 text-xs mt-1">100% Personalizadas</p>
              </div>
            </div>
          </div>
          
          {/* Background Glows */}
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-black/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-[1280px] w-full mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900 font-bold text-xl">Categorías</h2>
          <button 
            onClick={() => router.push('/catalog')}
            className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
          >
            Ver todas <ChevronRight size={16} />
          </button>
        </div>
        
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        >
          {categories.length > 0 ? (
            categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => router.push(`/catalog?category=${cat.id}`)}
                className="snap-start flex-shrink-0 flex flex-col items-center gap-2 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl px-6 py-4 transition-all hover:shadow-sm min-w-[120px]"
              >
                <span className="text-3xl">{CATEGORY_ICONS[cat.name] || '📦'}</span>
                <span className="text-xs font-medium text-gray-700">{cat.name}</span>
              </button>
            ))
          ) : (
            // Skeletons
            [...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[120px] h-[92px] bg-gray-100 rounded-xl animate-pulse"></div>
            ))
          )}
        </div>
      </section>

      {/* Recomendados */}
      <section className="max-w-[1280px] w-full mx-auto px-6 py-6 pb-16">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Sparkles size={14} className="text-white" />
            </div>
            <h2 className="text-gray-900 font-bold text-xl">Recomendados para ti</h2>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-1 uppercase tracking-wider">IA</span>
          </div>
          <button 
            onClick={() => router.push('/catalog')}
            className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
          >
            Ver más <ChevronRight size={16} />
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Seleccionados especialmente para ti según tu comportamiento.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {isRecsLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 aspect-[3/4] rounded-xl animate-pulse"></div>
            ))
          ) : recommendations.length > 0 ? (
            recommendations.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
             <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
               <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
               <p>No hay recomendaciones disponibles en este momento.</p>
             </div>
          )}
        </div>
      </section>

      {/* Random Categories for Exploration */}
      {!isCategoriesLoading && randomCategories.map(cat => (
        <CategoryRow key={cat.id} category={cat} />
      ))}

      {/* CTA Banner */}
      {!isAuthenticated && (
        <section className="max-w-[1280px] w-full mx-auto px-6 pb-16">
          <div className="rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bg-primary">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            
            <div className="relative z-10 text-center md:text-left">
              <h2 className="text-white text-2xl font-bold mb-2">¿Eres nuevo por aquí?</h2>
              <p className="text-blue-100 text-sm max-w-md">
                Regístrate y comienza a disfrutar de un motor de recomendaciones que se adapta a tus gustos en tiempo real.
              </p>
            </div>
            
            <button 
              onClick={() => router.push('/register')}
              className="relative z-10 bg-white text-primary px-8 py-3 rounded-lg text-sm font-bold hover:bg-gray-50 hover:shadow-lg transition-all flex-shrink-0"
            >
              Registrarme ahora
            </button>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

// Subcomponent to fetch and render products for a specific category
function CategoryRow({ category }: { category: Category }) {
  const router = useRouter();
  
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'category', category.id],
    queryFn: async () => {
      const res = await api.get<{ data: Product[] }>(API_ENDPOINTS.PRODUCTS.BASE, {
        params: { categoryId: category.id, limit: 6, status: 'active' }
      });
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  if (isLoading) {
    return (
      <section className="max-w-[1280px] w-full mx-auto px-6 pb-16">
        <h2 className="text-gray-900 font-bold text-xl mb-6">Explora {category.name}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 aspect-[3/4] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="max-w-[1280px] w-full mx-auto px-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900 font-bold text-xl">Explora {category.name}</h2>
        <button 
          onClick={() => router.push(`/catalog?category=${category.id}`)}
          className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
        >
          Ver más <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
