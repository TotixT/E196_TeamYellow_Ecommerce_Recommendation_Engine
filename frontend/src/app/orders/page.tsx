'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { formatCOP } from '@/types';
import type { Order } from '@/types';
import { useState } from 'react';

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      // The backend returns a PaginatedOrders object: { data: Order[], total, page, limit, totalPages }
      const res = await api.get<{ data: Order[] }>(API_ENDPOINTS.ORDERS.BASE);
      return res.data.data;
    },
  });

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'processing': return { label: 'Procesado', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'shipped': return { label: 'Enviado', color: 'bg-blue-100 text-blue-800', icon: Package };
      case 'delivered': return { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle2 };
      case 'cancelled': return { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle };
      default: return { label: status, color: 'bg-gray-100 text-gray-800', icon: Package };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-[1000px] w-full mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-gray-100 animate-pulse"></div>)}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center flex flex-col items-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes pedidos aún</h2>
            <p className="text-gray-500 mb-8 max-w-md">Cuando realices una compra, podrás hacerle seguimiento desde aquí.</p>
            <Link href="/catalog" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-sm">Explorar productos</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const statusCfg = getStatusConfig(order.status);
              const StatusIcon = statusCfg.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div key={order.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden transition-all">
                  <div 
                    className="p-5 flex flex-wrap items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-gray-900">Pedido #{order.orderNumber}</span>
                          <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.color}`}>
                             <StatusIcon size={12} /> {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto">
                      <div className="flex-1 sm:flex-initial text-right">
                        <p className="text-xs text-gray-500 mb-0.5">Total pagado</p>
                        <p className="font-bold text-gray-900 text-lg">{formatCOP(order.total)}</p>
                      </div>
                      <ChevronRight className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Items details */}
                  {isExpanded && (
                    <div className="border-t border-gray-50 bg-gray-50/50 p-5 animate-fade-in">
                      <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Productos en esta orden</h4>
                      <div className="space-y-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex gap-4 items-center bg-white p-3 border border-gray-100 rounded-lg">
                            <div className="w-16 h-16 bg-gray-50 rounded-md overflow-hidden border border-gray-50 flex-shrink-0">
                              {item.product?.mainImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.product.mainImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex justify-center items-center text-[10px] text-gray-400">Sin img</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/product/${item.productId}`} className="text-sm font-medium text-gray-900 hover:text-primary transition-colors line-clamp-1">
                                {item.product?.name || `Producto ID #${item.productId}`}
                              </Link>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Cantidad: {item.quantity} × {formatCOP(item.unitPrice)}
                              </p>
                            </div>
                            <div className="text-sm font-bold text-gray-900 text-right">
                              {formatCOP(item.lineTotal)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {(order.shippingAddress || order.shippingCity) && (
                        <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                             <p className="text-xs font-bold text-gray-500 uppercase">Enviado a</p>
                             <p className="text-sm text-gray-900 mt-1">{order.shippingAddress}, {order.shippingCity}</p>
                           </div>
                           <div>
                             <p className="text-xs font-bold text-gray-500 uppercase">Contacto</p>
                             <p className="text-sm text-gray-900 mt-1">{order.shippingPhone || 'N/A'}</p>
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
