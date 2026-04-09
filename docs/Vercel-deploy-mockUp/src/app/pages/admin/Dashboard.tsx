import { useNavigate } from "react-router";
import { TrendingUp, Users, Package, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Navbar } from "../../components/Navbar";
import { AdminSidebar } from "../../components/AdminSidebar";
import { useApp } from "../../context/AppContext";

const MONTHLY_SALES = [
  { mes: "Ene", ventas: 12400000 },
  { mes: "Feb", ventas: 18900000 },
  { mes: "Mar", ventas: 15600000 },
  { mes: "Abr", ventas: 22100000 },
  { mes: "May", ventas: 19800000 },
  { mes: "Jun", ventas: 28300000 },
  { mes: "Jul", ventas: 24700000 },
  { mes: "Ago", ventas: 31200000 },
  { mes: "Sep", ventas: 27500000 },
  { mes: "Oct", ventas: 33800000 },
  { mes: "Nov", ventas: 45200000 },
  { mes: "Dic", ventas: 52600000 },
];

const TOP_PRODUCTS = [
  { name: "Audífonos Inalámbricos Pro", sales: 142, revenue: 26965800 },
  { name: "Smartphone Galaxy X12", sales: 87, revenue: 191392300 },
  { name: "Smartwatch FitPro Series 5", sales: 201, revenue: 130629900 },
  { name: "Teclado Gaming Mecánico RGB", sales: 115, revenue: 34488500 },
  { name: "Altavoz Bluetooth 360°", sales: 98, revenue: 24490200 },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { users, products, orders } = useApp();

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p);

  const kpis = [
    { label: "Ventas este mes", value: formatPrice(52600000), icon: TrendingUp, color: "#2E75B6", bg: "bg-blue-50", change: "+18.2%" },
    { label: "Usuarios activos", value: users.filter(u => u.status === "Activo").length.toString(), icon: Users, color: "#16a34a", bg: "bg-green-50", change: "+5 este mes" },
    { label: "Productos activos", value: products.filter(p => p.status === "Activo").length.toString(), icon: Package, color: "#7c3aed", bg: "bg-purple-50", change: `${products.length} total` },
    { label: "Tasa de conversión", value: "3.8%", icon: BarChart2, color: "#ea580c", bg: "bg-orange-50", change: "+0.4% vs anterior" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-gray-900 text-xl">Dashboard</h1>
              <p className="text-sm text-gray-500">Panel de administración — resumen general</p>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Año 2026</span>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map(kpi => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">{kpi.label}</span>
                    <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                      <Icon size={16} style={{ color: kpi.color }} />
                    </div>
                  </div>
                  <p className="text-xl font-semibold text-gray-900 mb-1">{kpi.value}</p>
                  <p className="text-xs" style={{ color: kpi.color }}>{kpi.change}</p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Bar chart */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-gray-800 text-sm mb-4">Ventas mensuales — 2026</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={MONTHLY_SALES} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={v => `$${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(v: number) => [formatPrice(v), "Ventas"]} labelStyle={{ fontSize: 12 }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="ventas" fill="#2E75B6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top 5 products */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-800 text-sm">Top 5 productos más vendidos</h2>
                <button onClick={() => navigate("/admin/products")} className="text-xs hover:underline" style={{ color: "#2E75B6" }}>Ver todos</button>
              </div>
              <div className="space-y-3">
                {TOP_PRODUCTS.map((p, i) => (
                  <div key={p.name} className="flex items-start gap-3">
                    <span
                      className="text-xs font-medium w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: i === 0 ? "#2E75B6" : "#f3f4f6", color: i === 0 ? "white" : "#6b7280" }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sales} unidades · {formatPrice(p.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
              <p className="text-xs text-gray-500 mt-1">Pedidos totales</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-2xl font-semibold text-gray-900">{orders.filter(o => o.status === "Procesado").length}</p>
              <p className="text-xs text-gray-500 mt-1">Pedidos procesados</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <p className="text-2xl font-semibold text-gray-900">{orders.filter(o => o.status === "Entregado").length}</p>
              <p className="text-xs text-gray-500 mt-1">Entregados</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
