import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { ProductCard } from "../components/ProductCard";
import { useApp } from "../context/AppContext";

const CATEGORIES = ["Audio", "Computadores", "Celulares", "Accesorios", "Fotografía", "Tablets", "Gaming"];

export function Catalog() {
  const { products } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [showFilters, setShowFilters] = useState(false);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesQuery = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesQuery && matchesCategory && matchesPrice && p.status === "Activo";
    });
  }, [products, query, selectedCategories, priceRange]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 5000000]);
    setQuery("");
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000000 || query;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-[1280px] mx-auto px-6 py-6">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-xl">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar productos, categorías..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
            />
          </div>
          <button type="submit" className="px-5 py-2.5 rounded-lg text-white text-sm" style={{ backgroundColor: "#2E75B6" }}>
            Buscar
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 lg:hidden"
          >
            <SlidersHorizontal size={15} /> Filtros
          </button>
        </form>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`w-56 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-gray-800">Filtros</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs flex items-center gap-1 text-red-500 hover:text-red-700">
                    <X size={12} /> Limpiar
                  </button>
                )}
              </div>

              {/* Category filter */}
              <div className="mb-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Categoría</p>
                <div className="space-y-2">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="rounded"
                        style={{ accentColor: "#2E75B6" }}
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Rango de precio</p>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={5000000}
                    step={50000}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full"
                    style={{ accentColor: "#2E75B6" }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-800">{filtered.length}</span> productos encontrados
                {query && <span> para "<span className="text-[#2E75B6]">{query}</span>"</span>}
              </p>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                {/* Magnifying glass with X illustration */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full border-4 border-gray-200 flex items-center justify-center bg-gray-50">
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="18" cy="18" r="13" stroke="#D1D5DB" strokeWidth="3" fill="none"/>
                      <line x1="27.5" y1="27.5" x2="40" y2="40" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round"/>
                      <line x1="13" y1="13" x2="23" y2="23" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
                      <line x1="23" y1="13" x2="13" y2="23" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-gray-800 text-lg mb-2">
                  No encontramos resultados{query ? ` para "${query}"` : ""}
                </h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs">
                  Intenta con otro término o explora nuestras categorías
                </p>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm"
                  style={{ backgroundColor: "#2E75B6" }}
                >
                  Ver todos los productos →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}