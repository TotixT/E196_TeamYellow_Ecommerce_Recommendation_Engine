'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, X, PackageOpen } from 'lucide-react';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import type { Category, PaginatedProducts } from '@/types';

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [page, setPage] = useState(1);

  // Fetch Categories for Sidebar
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<{ data: Category[] }>(API_ENDPOINTS.CATEGORIES.BASE);
      return res.data.data;
    },
  });

  // Fetch Products based on filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { search, selectedCategory, minPrice, maxPrice, page }],
    queryFn: async () => {
      const params: any = { page, limit: 12 };
      if (search) params.search = search;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await api.get<PaginatedProducts>(API_ENDPOINTS.PRODUCTS.BASE, { params });
      return res.data;
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    router.replace('/catalog');
  };

  return (
    <div className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-8 flex gap-8">
      
      {/* Sidebar Filters (Desktop) */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Filter size={18} /> Filtros
            </h3>
            {(search || selectedCategory || minPrice || maxPrice) && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                <X size={12} /> Limpiar
              </button>
            )}
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Categorías</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="category"
                  checked={selectedCategory === ''} 
                  onChange={() => { setSelectedCategory(''); setPage(1); }}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary" 
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">Todas</span>
              </label>
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.id.toString()} 
                    onChange={() => { setSelectedCategory(cat.id.toString()); setPage(1); }}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary" 
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Precio (USD)</h4>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Mín" 
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary"
              />
              <span className="text-gray-400">-</span>
              <input 
                type="number" 
                placeholder="Máx" 
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile Search & Header */}
        <div className="mb-6">
          <form onSubmit={handleSearchSubmit} className="relative md:hidden mb-4">
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>

          <h1 className="text-2xl font-bold text-gray-900">
            {search ? `Resultados para "${search}"` : 'Catálogo de Productos'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {productsData ? `Mostrando ${productsData.data.length} de ${productsData.total} productos` : 'Cargando...'}
          </p>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
               <div key={i} className="bg-gray-100 aspect-[3/4] rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : productsData && productsData.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsData.data.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {productsData.totalPages > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <div className="flex items-center px-4 text-sm font-medium text-gray-700">
                  Página {page} de {productsData.totalPages}
                </div>
                <button 
                  disabled={page === productsData.totalPages}
                  onClick={() => setPage(p => Math.min(productsData.totalPages, p + 1))}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
            <PackageOpen className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No encontramos resultados</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Intenta con otras palabras clave o elimina los filtros para ver más productos.
            </p>
            <button 
              onClick={clearFilters}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <CatalogContent />
      </Suspense>
      <Footer />
    </div>
  );
}
