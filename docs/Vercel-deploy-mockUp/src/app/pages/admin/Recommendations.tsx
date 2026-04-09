import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Navbar } from "../../components/Navbar";
import { AdminSidebar } from "../../components/AdminSidebar";
import { MousePointerClick, TrendingUp, Sparkles, BarChart2 } from "lucide-react";

const CTR_TREND = [
  { mes: "Ene", ctr: 2.1 },
  { mes: "Feb", ctr: 2.4 },
  { mes: "Mar", ctr: 2.8 },
  { mes: "Abr", ctr: 3.1 },
  { mes: "May", ctr: 2.9 },
  { mes: "Jun", ctr: 3.5 },
  { mes: "Jul", ctr: 3.8 },
  { mes: "Ago", ctr: 4.2 },
  { mes: "Sep", ctr: 4.0 },
  { mes: "Oct", ctr: 4.6 },
  { mes: "Nov", ctr: 5.1 },
  { mes: "Dic", ctr: 5.4 },
];

const TOP_RECOMMENDED = [
  { name: "Audífonos Inalámbricos Pro", clicks: 1842, conversions: 312, rate: "16.9%" },
  { name: "Smartwatch FitPro Series 5", clicks: 2105, conversions: 389, rate: "18.5%" },
  { name: "Teclado Gaming Mecánico RGB", clicks: 987, conversions: 201, rate: "20.4%" },
  { name: "Altavoz Bluetooth 360°", clicks: 1354, conversions: 218, rate: "16.1%" },
  { name: "Smartphone Galaxy X12", clicks: 2893, conversions: 412, rate: "14.2%" },
  { name: "Tablet Pro 11\"", clicks: 765, conversions: 134, rate: "17.5%" },
];

export function AdminRecommendations() {
  const kpis = [
    { label: "CTR promedio", value: "5.4%", icon: MousePointerClick, color: "#2E75B6", bg: "bg-blue-50", desc: "+0.8% vs mes anterior" },
    { label: "Conversión desde recomendaciones", value: "17.1%", icon: TrendingUp, color: "#16a34a", bg: "bg-green-50", desc: "+2.3% vs mes anterior" },
    { label: "Productos recomendados activos", value: "6", icon: Sparkles, color: "#7c3aed", bg: "bg-purple-50", desc: "Motor IA activo" },
    { label: "Ingresos por recomendaciones", value: "$48.2M", icon: BarChart2, color: "#ea580c", bg: "bg-orange-50", desc: "COP estimado este mes" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-gray-900 text-xl">Métricas de recomendaciones</h1>
            <p className="text-sm text-gray-500">Rendimiento del sistema de recomendación inteligente</p>
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
                  <p className="text-xs" style={{ color: kpi.color }}>{kpi.desc}</p>
                </div>
              );
            })}
          </div>

          {/* CTR line chart */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-800 text-sm">Tendencia del CTR por mes — 2026</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "#2E75B6" }} />
                Click-Through Rate (%)
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={CTR_TREND} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v: number) => [`${v}%`, "CTR"]} labelStyle={{ fontSize: 12 }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="ctr" stroke="#2E75B6" strokeWidth={2.5} dot={{ fill: "#2E75B6", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top recommended products table */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h2 className="text-gray-800 text-sm mb-4">Productos más recomendados y su conversión</h2>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 rounded-xl">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider rounded-tl-xl">Producto</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider hidden md:table-cell">Clics</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider hidden md:table-cell">Conversiones</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider rounded-tr-xl">Tasa de conversión</th>
                </tr>
              </thead>
              <tbody>
                {TOP_RECOMMENDED.map((item, i) => (
                  <tr key={item.name} className="border-t border-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-medium w-5 h-5 rounded flex items-center justify-center"
                          style={{ backgroundColor: i === 0 ? "#2E75B6" : "#f3f4f6", color: i === 0 ? "white" : "#6b7280" }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{item.clicks.toLocaleString("es-CO")}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{item.conversions.toLocaleString("es-CO")}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: item.rate, backgroundColor: "#2E75B6" }}
                          />
                        </div>
                        <span className="text-sm font-medium" style={{ color: "#2E75B6" }}>{item.rate}</span>
                      </div>
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
