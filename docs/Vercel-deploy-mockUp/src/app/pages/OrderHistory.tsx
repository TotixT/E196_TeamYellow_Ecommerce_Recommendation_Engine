import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useApp, Order } from "../context/AppContext";

const STATUS_COLORS: Record<Order["status"], string> = {
  Procesado: "bg-yellow-100 text-yellow-700",
  Enviado: "bg-blue-100 text-blue-700",
  Entregado: "bg-green-100 text-green-700",
};

export function OrderHistory() {
  const navigate = useNavigate();
  const { orders } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-[1280px] mx-auto px-6 py-20 flex flex-col items-center text-center">
          <Package size={64} className="text-gray-200 mb-6" />
          <h2 className="text-gray-700 text-xl mb-2">No tienes pedidos aún</h2>
          <p className="text-gray-400 text-sm mb-8">¡Haz tu primera compra!</p>
          <button onClick={() => navigate("/catalog")} className="px-6 py-2.5 rounded-xl text-white text-sm" style={{ backgroundColor: "#2E75B6" }}>
            Ir al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-gray-900 text-xl">Mis pedidos</h1>
          <span className="text-sm text-gray-400">{orders.length} pedido{orders.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Desktop table header */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 rounded-t-xl border border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
          <span className="col-span-3">Número de pedido</span>
          <span className="col-span-3">Fecha</span>
          <span className="col-span-2">Total</span>
          <span className="col-span-2">Estado</span>
          <span className="col-span-2 text-right">Detalle</span>
        </div>

        <div className="border border-gray-100 md:border-t-0 rounded-xl md:rounded-t-none overflow-hidden">
          {orders.map(order => (
            <div key={order.id} className="border-b border-gray-50 last:border-0">
              {/* Row */}
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="w-full text-left"
              >
                <div className="grid grid-cols-12 gap-2 items-center px-4 py-4 hover:bg-gray-50 transition-colors">
                  <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                    <Package size={15} className="text-gray-400 hidden md:block flex-shrink-0" />
                    <span className="text-sm text-gray-800 font-medium">{order.id}</span>
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <span className="text-sm text-gray-600 hidden md:block">{formatDate(order.date)}</span>
                    <span className="text-xs text-gray-400 md:hidden">{formatDate(order.date)}</span>
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <span className="text-sm font-medium text-gray-800">{formatPrice(order.total)}</span>
                  </div>
                  <div className="col-span-8 md:col-span-2 flex items-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end text-gray-400 gap-1">
                    <span className="text-xs hidden md:block">{expanded === order.id ? "Ocultar" : "Ver"}</span>
                    {expanded === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              {expanded === order.id && (
                <div className="px-4 pb-4 bg-gray-50/50 border-t border-gray-50">
                  <p className="text-xs text-gray-500 uppercase tracking-wider pt-3 mb-3">Productos del pedido</p>
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.category} · Cantidad: {item.quantity}</p>
                        </div>
                        <span className="text-sm text-gray-700">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total del pedido</p>
                      <p className="text-[#2E75B6] font-medium">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
