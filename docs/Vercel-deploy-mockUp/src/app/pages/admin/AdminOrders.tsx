import { useState } from "react";
import { Package } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { AdminSidebar } from "../../components/AdminSidebar";
import { useApp, Order } from "../../context/AppContext";

const STATUS_COLORS: Record<Order["status"], string> = {
  Procesado: "bg-yellow-100 text-yellow-700",
  Enviado: "bg-blue-100 text-blue-700",
  Entregado: "bg-green-100 text-green-700",
};

const ALL_ORDERS: Order[] = [
  { id: "ORD-202600001", date: "2026-01-05", total: 2449800, status: "Entregado", items: [] },
  { id: "ORD-202600002", date: "2026-01-20", total: 3499900, status: "Enviado", items: [] },
  { id: "ORD-202600003", date: "2026-02-10", total: 299900, status: "Procesado", items: [] },
  { id: "ORD-202600004", date: "2026-02-15", total: 1899900, status: "Procesado", items: [] },
  { id: "ORD-202600005", date: "2026-02-18", total: 649900, status: "Enviado", items: [] },
  { id: "ORD-202600006", date: "2026-02-20", total: 4899900, status: "Procesado", items: [] },
  { id: "ORD-202600007", date: "2026-02-22", total: 189900, status: "Entregado", items: [] },
];

export function AdminOrders() {
  const { orders: userOrders } = useApp();
  const allOrders = [...userOrders, ...ALL_ORDERS.filter(o => !userOrders.find(u => u.id === o.id))];
  const [statusFilter, setStatusFilter] = useState("Todos");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);
  const formatDate = (d: string) => new Date(d).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });

  const filtered = allOrders.filter(o => statusFilter === "Todos" || o.status === statusFilter);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-gray-900 text-xl">Gestión de pedidos</h1>
              <p className="text-sm text-gray-500">{allOrders.length} pedidos en total</p>
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700"
            >
              <option>Todos</option>
              <option>Procesado</option>
              <option>Enviado</option>
              <option>Entregado</option>
            </select>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Pedido</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider hidden md:table-cell">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">{order.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{formatDate(order.date)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-800">{formatPrice(order.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-xs text-[#2E75B6] hover:underline">Ver detalle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
