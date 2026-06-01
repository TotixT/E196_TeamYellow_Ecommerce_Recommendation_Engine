'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingCart, Users, Target } from 'lucide-react';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { formatCOP, toNumber } from '@/types';
import type { MonthlySalesReport, TopProduct, TopUser, ConversionData } from '@/types';

type Period = 'month' | '3months' | 'year';

export default function AdminStatsPage() {
  const [period, setPeriod] = useState<Period>('year');

  const { data: salesData } = useQuery({
    queryKey: ['admin', 'stats', 'sales'],
    queryFn: async () => {
      const res = await api.get<MonthlySalesReport>(API_ENDPOINTS.ADMIN.REPORTS.SALES);
      return res.data;
    },
  });

  const { data: conversionData } = useQuery({
    queryKey: ['admin', 'stats', 'conversion', period],
    queryFn: async () => {
      const res = await api.get<ConversionData>(API_ENDPOINTS.ADMIN.REPORTS.CONVERSION, { params: { period } });
      return res.data;
    },
  });

  const { data: topProducts } = useQuery({
    queryKey: ['admin', 'stats', 'top-products', period],
    queryFn: async () => {
      const res = await api.get<any>(API_ENDPOINTS.ADMIN.REPORTS.TOP_PRODUCTS, { params: { period } });
      return Array.isArray(res.data) ? res.data : res.data.products ?? res.data.data ?? [];
    },
  });

  const { data: topUsers } = useQuery({
    queryKey: ['admin', 'stats', 'top-users', period],
    queryFn: async () => {
      const res = await api.get<any>(API_ENDPOINTS.ADMIN.REPORTS.TOP_USERS, { params: { period } });
      return Array.isArray(res.data) ? res.data : res.data.users ?? res.data.data ?? [];
    },
  });

  const chartData = salesData?.months?.map(m => ({
    name: m.monthName?.substring(0, 3) ?? `M${m.month}`,
    revenue: toNumber(m.totalRevenue),
    orders: m.totalOrders,
  })) ?? [];

  const conversionChartData = conversionData?.monthlyTrend?.map(m => ({
    name: m.monthName?.substring(0, 3) ?? `M${m.month}`,
    rate: m.rate,
    sessions: m.sessions,
    purchases: m.purchases,
  })) ?? [];

  const periods: { value: Period; label: string }[] = [
    { value: 'month', label: 'Mes' },
    { value: '3months', label: '3 Meses' },
    { value: 'year', label: 'Año' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estadísticas y Reportes</h1>
          <p className="text-sm text-gray-500 mt-1">Módulo 5 — Análisis de rendimiento de la tienda</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === p.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-emerald-100 p-2 rounded-lg"><TrendingUp size={18} className="text-emerald-600" /></div>
            <span className="text-sm font-medium text-emerald-700">Ingresos Acumulados</span>
          </div>
          <p className="text-2xl font-bold text-emerald-800">{formatCOP(salesData?.totalAccumulated ?? 0)}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg"><ShoppingCart size={18} className="text-blue-600" /></div>
            <span className="text-sm font-medium text-blue-700">Pedidos Totales</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">{salesData?.months?.reduce((s, m) => s + m.totalOrders, 0) ?? 0}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg"><Users size={18} className="text-purple-600" /></div>
            <span className="text-sm font-medium text-purple-700">Sesiones Totales</span>
          </div>
          <p className="text-2xl font-bold text-purple-800">{conversionData?.totalSessions ?? 0}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-amber-100 p-2 rounded-lg"><Target size={18} className="text-amber-600" /></div>
            <span className="text-sm font-medium text-amber-700">Tasa de Conversión</span>
          </div>
          <p className="text-2xl font-bold text-amber-800">{(conversionData?.conversionRate ?? 0).toFixed(1)}%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Trend */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Tendencia Mensual de Ventas</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E75B6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2E75B6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [formatCOP(value), 'Ingresos']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#2E75B6" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-[280px] flex items-center justify-center text-gray-400">Sin datos</div>}
        </div>

        {/* Conversion Rate Trend */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Tendencia de Conversión</h3>
          {conversionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={conversionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(value: number, name: string) => [name === 'rate' ? `${value.toFixed(1)}%` : value, name === 'rate' ? 'Tasa' : name === 'sessions' ? 'Sesiones' : 'Compras']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                <Line type="monotone" dataKey="rate" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="h-[280px] flex items-center justify-center text-gray-400">Sin datos</div>}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Products */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Top 10 Productos Más Vendidos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left py-2.5 px-4 font-semibold text-gray-600">#</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-gray-600">Producto</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-gray-600">Vendidos</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-gray-600">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts && topProducts.length > 0 ? topProducts.map((p, i) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-4 text-gray-400 font-medium">{i + 1}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {p.mainImage && <img src={p.mainImage} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-xs truncate max-w-[150px]">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.categoryName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-gray-700">{p.unitsSold}</td>
                    <td className="py-2.5 px-4 font-medium text-gray-900">{formatCOP(toNumber(p.revenue))}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">Sin datos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 10 Customers */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Top 10 Clientes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left py-2.5 px-4 font-semibold text-gray-600">#</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-gray-600">Cliente</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-gray-600">Pedidos</th>
                  <th className="text-left py-2.5 px-4 font-semibold text-gray-600">Total Gastado</th>
                </tr>
              </thead>
              <tbody>
                {topUsers && topUsers.length > 0 ? topUsers.map((u, i) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-4 text-gray-400 font-medium">{i + 1}</td>
                    <td className="py-2.5 px-4">
                      <p className="font-medium text-gray-900 text-xs">{u.fullName}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-gray-700">{u.totalOrders}</td>
                    <td className="py-2.5 px-4 font-medium text-gray-900">{formatCOP(toNumber(u.totalSpent))}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">Sin datos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
