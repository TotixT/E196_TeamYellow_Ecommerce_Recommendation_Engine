import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Navbar } from "../../components/Navbar";
import { AdminSidebar } from "../../components/AdminSidebar";

const SALES_DATA = [
  { mes: "Ene", ventas: 12400000, pedidos: 34 },
  { mes: "Feb", ventas: 18900000, pedidos: 52 },
  { mes: "Mar", ventas: 15600000, pedidos: 43 },
  { mes: "Abr", ventas: 22100000, pedidos: 61 },
  { mes: "May", ventas: 19800000, pedidos: 55 },
  { mes: "Jun", ventas: 28300000, pedidos: 78 },
  { mes: "Jul", ventas: 24700000, pedidos: 68 },
  { mes: "Ago", ventas: 31200000, pedidos: 86 },
  { mes: "Sep", ventas: 27500000, pedidos: 76 },
  { mes: "Oct", ventas: 33800000, pedidos: 93 },
  { mes: "Nov", ventas: 45200000, pedidos: 124 },
  { mes: "Dic", ventas: 52600000, pedidos: 145 },
];

const CATEGORY_DATA = [
  { name: "Celulares", value: 32 },
  { name: "Computadores", value: 24 },
  { name: "Accesorios", value: 18 },
  { name: "Audio", value: 14 },
  { name: "Gaming", value: 8 },
  { name: "Tablets", value: 4 },
];

const COLORS = ["#2E75B6", "#4a9fd4", "#7cb8e0", "#a8d1ef", "#c5e2f6", "#daeefb"];

export function AdminStats() {
  const formatPrice = (p: number) => `$${(p / 1000000).toFixed(1)}M`;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-gray-900 text-xl">Estadísticas</h1>
            <p className="text-sm text-gray-500">Análisis de rendimiento de la plataforma — 2026</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bar chart - ventas */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-gray-800 text-sm mb-4">Ventas mensuales (COP)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={SALES_DATA} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={formatPrice} />
                  <Tooltip formatter={(v: number) => [new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v), "Ventas"]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="ventas" fill="#2E75B6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line chart - pedidos */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-gray-800 text-sm mb-4">Número de pedidos por mes</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={SALES_DATA} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <Tooltip formatter={(v: number) => [v, "Pedidos"]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="pedidos" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: "#16a34a", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart - categories */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-gray-800 text-sm mb-4">Distribución de ventas por categoría</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={CATEGORY_DATA} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false} fontSize={10}>
                    {CATEGORY_DATA.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, "Participación"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h2 className="text-gray-800 text-sm mb-4">Resumen del año 2026</h2>
              <div className="space-y-4">
                {[
                  { label: "Total ventas acumuladas", value: "$332.1M COP", bar: 100 },
                  { label: "Pedidos procesados", value: "815 pedidos", bar: 81 },
                  { label: "Clientes activos", value: "4 usuarios", bar: 40 },
                  { label: "Productos activos", value: "8 productos", bar: 60 },
                  { label: "Tasa de satisfacción", value: "94.2%", bar: 94 },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{stat.label}</span>
                      <span className="font-medium text-gray-800">{stat.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${stat.bar}%`, backgroundColor: "#2E75B6" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
