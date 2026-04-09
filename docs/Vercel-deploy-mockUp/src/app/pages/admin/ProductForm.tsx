import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Upload, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { AdminSidebar } from "../../components/AdminSidebar";
import { useApp, Product } from "../../context/AppContext";

const CATEGORIES = ["Audio", "Computadores", "Celulares", "Accesorios", "Fotografía", "Tablets", "Gaming"];

export function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { products, setProducts } = useApp();
  const isEdit = !!id && id !== "new";
  const existing = isEdit ? products.find(p => p.id === Number(id)) : null;

  const [form, setForm] = useState({
    name: existing?.name || "",
    description: existing?.description || "",
    category: existing?.category || "Audio",
    price: existing?.price?.toString() || "",
    stock: existing?.stock?.toString() || "",
    image: existing?.image || "",
    status: existing?.status || "Activo",
  });
  const [dragOver, setDragOver] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "El nombre del producto es obligatorio";
    if (!form.description.trim()) e.description = "La descripción es requerida";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "El precio debe ser mayor a $0";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = "El stock no puede ser negativo";
    if (!form.image.trim()) e.image = "Agrega al menos una imagen del producto";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const productData: Product = {
      id: isEdit ? Number(id) : Date.now(),
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image || "https://images.unsplash.com/photo-1631543561989-98c3bfd1bb73?w=400",
      status: form.status as "Activo" | "Inactivo",
    };

    if (isEdit) {
      setProducts(prev => prev.map(p => p.id === Number(id) ? productData : p));
    } else {
      setProducts(prev => [...prev, productData]);
    }
    setSaved(true);
    setTimeout(() => navigate("/admin/products"), 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <button onClick={() => navigate("/admin/products")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5">
            <ArrowLeft size={15} /> Volver a productos
          </button>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-gray-900 text-xl">{isEdit ? "Editar producto" : "Nuevo producto"}</h1>
          </div>

          <form onSubmit={handleSave} className="max-w-2xl">
            <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nombre del producto *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.name ? "border-red-400" : "border-gray-200"}`}
                  placeholder="Ej: Audífonos Inalámbricos Pro"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Descripción *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none ${errors.description ? "border-red-400" : "border-gray-200"}`}
                  placeholder="Describe las características del producto..."
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>

              {/* Category + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Categoría *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Estado</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white"
                  >
                    <option>Activo</option>
                    <option>Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Precio (COP) *</label>
                  <input
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.price ? "border-red-400" : "border-gray-200"}`}
                    placeholder="189900"
                    type="number"
                  />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Stock *</label>
                  <input
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errors.stock ? "border-red-400" : "border-gray-200"}`}
                    placeholder="50"
                    type="number"
                  />
                  {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Imagen del producto</label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    errors.image
                      ? "border-amber-400 bg-amber-50"
                      : dragOver
                      ? "border-[#2E75B6] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {form.image ? (
                    <div className="flex flex-col items-center gap-3">
                      <img src={form.image} alt="Preview" className="w-24 h-24 object-cover rounded-xl" />
                      <button type="button" onClick={() => setForm({ ...form, image: "" })} className="text-xs text-red-500 hover:text-red-700">Eliminar imagen</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-1">
                        <Upload size={20} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">Arrastra y suelta una imagen aquí</p>
                      <p className="text-xs text-gray-400">o ingresa una URL de imagen</p>
                    </div>
                  )}
                </div>
                {errors.image && (
                  <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-xs">
                    <span>⚠️</span>
                    <span>{errors.image}</span>
                  </div>
                )}
                <input
                  value={form.image}
                  onChange={e => { setForm({ ...form, image: e.target.value }); if (errors.image) setErrors(prev => ({ ...prev, image: undefined })); }}
                  className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              {saved && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  <CheckCircle2 size={16} /> Producto guardado correctamente. Redirigiendo...
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium"
                  style={{ backgroundColor: "#2E75B6" }}
                >
                  {isEdit ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}