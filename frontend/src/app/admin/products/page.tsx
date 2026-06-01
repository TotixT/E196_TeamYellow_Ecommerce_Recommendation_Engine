'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Power, Trash2, Search, Star, Upload, X, ImageIcon } from 'lucide-react';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { formatCOP, toNumber } from '@/types';
import type { Product, Category, PaginatedProducts, ProductImage } from '@/types';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', categoryId: '' });
  const [formError, setFormError] = useState('');
  const [replacingImageId, setReplacingImageId] = useState<number | null>(null);

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin', 'products', { search, page }],
    queryFn: async () => {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      const res = await api.get<PaginatedProducts>(API_ENDPOINTS.PRODUCTS.BASE, { params });
      return res.data;
    },
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.CATEGORIES.BASE);
      const d = res.data;
      return (Array.isArray(d) ? d : d.data ?? []) as Category[];
    },
  });

  // Fetch product detail (for images when editing)
  const { data: productDetail, refetch: refetchDetail } = useQuery({
    queryKey: ['admin', 'product-detail', editingProduct?.id],
    queryFn: async () => {
      if (!editingProduct) return null;
      const res = await api.get(API_ENDPOINTS.PRODUCTS.DETAIL(editingProduct.id));
      return res.data as Product;
    },
    enabled: !!editingProduct,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(API_ENDPOINTS.ADMIN.PRODUCTS.BASE, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); closeModal(); },
    onError: (err: any) => setFormError(err.response?.data?.message || 'Error al crear producto'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(API_ENDPOINTS.ADMIN.PRODUCTS.DETAIL(id), data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); refetchDetail(); closeModal(); },
    onError: (err: any) => setFormError(err.response?.data?.message || 'Error al actualizar'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => api.patch(API_ENDPOINTS.ADMIN.PRODUCTS.ACTIVATE(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => api.patch(API_ENDPOINTS.ADMIN.PRODUCTS.DEACTIVATE(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(API_ENDPOINTS.ADMIN.PRODUCTS.DETAIL(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const uploadImagesMutation = useMutation({
    mutationFn: async ({ productId, files }: { productId: number; files: FileList | File[] }) => {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append('images', files[i]);
      }
      
      const token = localStorage.getItem('eie_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${baseUrl}${API_ENDPOINTS.ADMIN.PRODUCTS.IMAGES(productId)}`, {
        method: 'POST',
        body: fd,
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Error al subir imágenes');
      }
      return response.json();
    },
    onSuccess: () => { refetchDetail(); queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); },
    onError: (err: any) => setFormError(err.message || err.response?.data?.message || 'Error al subir imágenes'),
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      api.delete(API_ENDPOINTS.ADMIN.PRODUCTS.IMAGE(productId, imageId)),
    onSuccess: () => { refetchDetail(); queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      api.patch(API_ENDPOINTS.ADMIN.PRODUCTS.IMAGE_PRIMARY(productId, imageId)),
    onSuccess: () => { refetchDetail(); queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); },
  });

  const replaceImageMutation = useMutation({
    mutationFn: async ({ productId, imageId, file }: { productId: number; imageId: number; file: File }) => {
      const fd = new FormData();
      fd.append('image', file);
      
      const token = localStorage.getItem('eie_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${baseUrl}${API_ENDPOINTS.ADMIN.PRODUCTS.IMAGE(productId, imageId)}`, {
        method: 'PUT',
        body: fd,
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Error al reemplazar imagen');
      }
      return response.json();
    },
    onSuccess: () => { 
      refetchDetail(); 
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); 
      setReplacingImageId(null); 
    },
    onError: (err: any) => setFormError(err.message || err.response?.data?.message || 'Error al reemplazar imagen'),
  });

  // Handlers
  const openCreate = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', stock: '', categoryId: '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: String(toNumber(product.price)),
      stock: String(product.stock),
      categoryId: String(product.categoryId),
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.stock || !formData.categoryId) {
      setFormError('Todos los campos marcados son requeridos');
      return;
    }
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId),
    };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleToggle = (product: Product) => {
    if (product.status === 'active') {
      if (confirm(`¿Desactivar "${product.name}"?`)) deactivateMutation.mutate(product.id);
    } else {
      activateMutation.mutate(product.id);
    }
  };

  const handleDelete = (product: Product) => {
    if (confirm(`¿ELIMINAR PERMANENTEMENTE "${product.name}"?\n\nEsta acción es IRREVERSIBLE y eliminará el producto y sus imágenes de Cloudinary.`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && editingProduct) {
      const filesArray = Array.from(e.target.files);
      uploadImagesMutation.mutate({ productId: editingProduct.id, files: filesArray });
      e.target.value = '';
    }
  };

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && editingProduct && replacingImageId) {
      const fileCopy = e.target.files[0];
      replaceImageMutation.mutate({ productId: editingProduct.id, imageId: replacingImageId, file: fileCopy });
      e.target.value = '';
    }
  };

  const images: ProductImage[] = (productDetail as any)?.images ?? editingProduct?.images ?? [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Buscar productos..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Imagen</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Categoría</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Precio</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Estado</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={7} className="py-4 px-4"><div className="h-10 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : productsData?.data && productsData.data.length > 0 ? (
                productsData.data.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2 px-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                        {product.mainImage ? (
                          <img src={product.mainImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={16} /></div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-[200px] truncate">{product.name}</td>
                    <td className="py-3 px-4 text-gray-600">{product.categoryName || '—'}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{formatCOP(toNumber(product.price))}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${product.stock < 5 ? 'text-red-600' : 'text-gray-700'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(product)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Editar"><Pencil size={15} /></button>
                        <button onClick={() => handleToggle(product)} className={`p-2 rounded-lg ${product.status === 'active' ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`} title={product.status === 'active' ? 'Desactivar' : 'Activar'}><Power size={15} /></button>
                        <button onClick={() => handleDelete(product)} className="p-2 rounded-lg text-red-500 hover:bg-red-50" title="Eliminar"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No se encontraron productos</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {productsData && productsData.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Mostrando {productsData.data.length} de {productsData.total}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">Anterior</button>
              <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {productsData.totalPages}</span>
              <button disabled={page === productsData.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
      <input ref={replaceFileRef} type="file" accept="image/*" className="hidden" onChange={handleReplaceFile} />

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={closeModal}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">{formError}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (USD) *</label>
                  <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input type="number" min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white">
                    <option value="">Seleccionar categoría...</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Management (only when editing) */}
              {editingProduct && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Imágenes del Producto</h4>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadImagesMutation.isPending}
                      className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Upload size={14} /> {uploadImagesMutation.isPending ? 'Subiendo...' : 'Subir Imágenes'}
                    </button>
                  </div>
                  {images.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {images.map((img) => (
                        <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square">
                          <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                          {img.isPrimary && (
                            <div className="absolute top-1.5 left-1.5 bg-yellow-400 text-white p-1 rounded-md shadow-sm">
                              <Star size={12} fill="white" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            {!img.isPrimary && (
                              <button type="button" onClick={() => setPrimaryMutation.mutate({ productId: editingProduct.id, imageId: img.id })} className="p-1.5 bg-yellow-400 text-white rounded-lg text-xs" title="Hacer principal"><Star size={14} /></button>
                            )}
                            <button type="button" onClick={() => { setReplacingImageId(img.id); replaceFileRef.current?.click(); }} className="p-1.5 bg-blue-500 text-white rounded-lg text-xs" title="Reemplazar"><Upload size={14} /></button>
                            <button type="button" onClick={() => { if (confirm('¿Eliminar esta imagen?')) deleteImageMutation.mutate({ productId: editingProduct.id, imageId: img.id }); }} className="p-1.5 bg-red-500 text-white rounded-lg text-xs" title="Eliminar"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-6">No hay imágenes. Sube hasta 5 imágenes.</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center">
                  {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
