import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Edit2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { AdminSidebar } from "../../components/AdminSidebar";
import { useApp, Product } from "../../context/AppContext";

interface ConfirmModal {
  product: Product;
}

export function AdminProducts() {
  const navigate = useNavigate();
  const { products, setProducts } = useApp();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null);

  const categories = ["Todas", ...Array.from(new Set(products.map(p => p.category)))];

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p);

  const filtered = products.filter(p => {
    const matchQuery = !query || p.name.toLowerCase().includes(query.toLowerCase());
    const matchCat = categoryFilter === "Todas" || p.category === categoryFilter;
    return matchQuery && matchCat;
  });

  const handleToggleClick = (product: Product) => {
    if (product.status === "Activo") {
      setConfirmModal({ product });
    } else {
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, status: "Activo" } : p
      ));
    }
  };

  const confirmDeactivate = () => {
    if (!confirmModal) return;
    setProducts(prev => prev.map(p =>
      p.id === confirmModal.product.id ? { ...p, status: "Inactivo" } : p
    ));
    setConfirmModal(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-gray-900 text-xl">Gestión de productos</h1>
              <p className="text-sm text-gray-500">{products.length} productos en total</p>
            </div>
            <button
              onClick={() => navigate("/admin/products/new")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
              style={{ backgroundColor: "#2E75B6" }}
            >
              <Plus size={15} /> Nuevo producto
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white text-gray-700"
            >
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Imagen</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider hidden md:table-cell">Precio</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider hidden lg:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-800 max-w-[180px] truncate">{product.name}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500">{product.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-700">{formatPrice(product.price)}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs ${product.stock <= 5 ? "text-orange-600" : "text-gray-600"}`}>{product.stock} uds.</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.status === "Activo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#2E75B6] transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleClick(product)}
                          className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${product.status === "Activo" ? "text-green-600" : "text-gray-400"}`}
                          title={product.status === "Activo" ? "Desactivar" : "Activar"}
                        >
                          {product.status === "Activo" ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">No se encontraron productos.</div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">{filtered.length} productos mostrados</p>
        </main>
      </div>

      {/* Deactivate product confirmation modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">¿Desactivar producto?</h3>
              <button onClick={() => setConfirmModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              El producto <span className="font-medium text-gray-800">'{confirmModal.product.name}'</span> dejará de mostrarse en el catálogo. Podrás reactivarlo en cualquier momento.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeactivate}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors"
                style={{ backgroundColor: "#DC2626" }}
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}