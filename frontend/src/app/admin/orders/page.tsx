'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, X, Package } from 'lucide-react';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { formatCOP, toNumber } from '@/types';
import type { Order } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  processing: { label: 'Procesando', color: 'bg-amber-100 text-amber-700' },
  shipped: { label: 'Enviado', color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

export default function AdminOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [detailLoading, setDetailLoading] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.ADMIN.ORDERS.BASE);
      const d = res.data;
      return (Array.isArray(d) ? d : d.data ?? []) as Order[];
    },
  });

  const openDetail = async (order: Order) => {
    setDetailLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.ORDERS.DETAIL(order.id));
      setSelectedOrder(res.data as Order);
    } catch {
      setSelectedOrder(order);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Historial de Pedidos</h1>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600"># Pedido</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Items</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={6} className="py-4 px-4"><div className="h-5 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : orders && orders.length > 0 ? (
                orders.map((order) => {
                  const statusConf = STATUS_CONFIG[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-gray-900 text-xs">{order.orderNumber}</td>
                      <td className="py-3 px-4 text-gray-600">{order.items?.length ?? 0} productos</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{formatCOP(toNumber(order.total))}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => openDetail(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Eye size={14} /> Ver Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Package className="mx-auto mb-2" size={32} />
                    No hay pedidos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Pedido {selectedOrder.orderNumber}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${(STATUS_CONFIG[selectedOrder.status] || { color: 'bg-gray-100 text-gray-600' }).color}`}>
                  {(STATUS_CONFIG[selectedOrder.status] || { label: selectedOrder.status }).label}
                </span>
                <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={20} /></button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Shipping Info */}
              {(selectedOrder.shippingAddress || selectedOrder.shippingCity) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Información de Envío</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {selectedOrder.shippingAddress && <p>{selectedOrder.shippingAddress}</p>}
                    {selectedOrder.shippingCity && <p>{selectedOrder.shippingCity}</p>}
                    {selectedOrder.shippingPhone && <p>Tel: {selectedOrder.shippingPhone}</p>}
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Productos</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.product?.name || `Producto #${item.productId}`}</p>
                        <p className="text-xs text-gray-500">Cantidad: {item.quantity} × {formatCOP(toNumber(item.unitPrice))}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatCOP(toNumber(item.lineTotal))}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCOP(toNumber(selectedOrder.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Envío</span>
                  <span>{formatCOP(toNumber(selectedOrder.shippingCost))}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCOP(toNumber(selectedOrder.total))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
