'use client';

import { useQuery } from '@tanstack/react-query';
import { Star, TrendingUp, Eye } from 'lucide-react';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api-endpoints';

export default function AdminRecommendationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'recommendations-history'],
    queryFn: async () => {
      try {
        const res = await api.get(API_ENDPOINTS.ADMIN.RECOMMENDATIONS_HISTORY);
        return res.data;
      } catch {
        return null;
      }
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Motor de Recomendaciones</h1>
        <p className="text-sm text-gray-500 mt-1">Estado y rendimiento del sistema de recomendaciones inteligentes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg"><Star size={18} className="text-purple-600" /></div>
            <span className="text-sm font-medium text-purple-700">Estado del Motor</span>
          </div>
          <p className="text-xl font-bold text-purple-800">Activo ✓</p>
          <p className="text-xs text-purple-600 mt-1">Basado en historial de compras, vistas y popularidad</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg"><Eye size={18} className="text-blue-600" /></div>
            <span className="text-sm font-medium text-blue-700">Fuentes de Datos</span>
          </div>
          <p className="text-xl font-bold text-blue-800">3 Fuentes</p>
          <p className="text-xs text-blue-600 mt-1">Compras, vistas de producto, productos populares</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-emerald-100 p-2 rounded-lg"><TrendingUp size={18} className="text-emerald-600" /></div>
            <span className="text-sm font-medium text-emerald-700">Algoritmo</span>
          </div>
          <p className="text-xl font-bold text-emerald-800">Híbrido</p>
          <p className="text-xs text-emerald-600 mt-1">Colaborativo + basado en contenido</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3">Cómo funciona el motor</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
            <p><strong>Historial de Compras:</strong> Analiza los productos que el usuario ya compró y recomienda productos similares de las mismas categorías.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
            <p><strong>Vistas Recientes:</strong> Registra los productos que el usuario ha visitado y sugiere productos relacionados.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
            <p><strong>Popularidad Global:</strong> Como respaldo, muestra los productos más populares de la tienda basándose en el volumen de ventas.</p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {data && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Historial de Recomendaciones</h3>
          <pre className="text-xs text-gray-600 bg-gray-50 p-4 rounded-lg overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
