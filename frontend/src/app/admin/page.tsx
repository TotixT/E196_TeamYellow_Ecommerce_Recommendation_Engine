'use client';

import { useQuery } from '@tanstack/react-query';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { formatCOP, toNumber } from '@/types';
import type { MonthlySalesReport, TopProduct, ConversionData } from '@/types';

export default function AdminDashboardPage() {
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['admin', 'sales'],
    queryFn: async () => {
      const res = await api.get<MonthlySalesReport>(API_ENDPOINTS.ADMIN.REPORTS.SALES);
      return res.data;
    },
  });

  const { data: topProducts, isLoading: topLoading } = useQuery({
    queryKey: ['admin', 'top-products'],
    queryFn: async () => {
      const res = await api.get<any>(API_ENDPOINTS.ADMIN.REPORTS.TOP_PRODUCTS, { params: { period: 'year' } });
      return Array.isArray(res.data) ? res.data : res.data.products ?? res.data.data ?? [];
    },
  });

  const { data: conversionData } = useQuery({
    queryKey: ['admin', 'conversion'],
    queryFn: async () => {
      const res = await api.get<ConversionData>(API_ENDPOINTS.ADMIN.REPORTS.CONVERSION);
      return res.data;
    },
  });

  const totalRevenue = salesData?.totalAccumulated ?? 0;
  const totalOrders = salesData?.months?.reduce((sum, m) => sum + m.totalOrders, 0) ?? 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const conversionRate = conversionData?.conversionRate ?? 0;

  const chartData = salesData?.months?.map(m => ({
    name: m.monthName?.substring(0, 3) ?? `M${m.month}`,
    revenue: toNumber(m.totalRevenue),
    orders: m.totalOrders,
  })) ?? [];

  const stats = [
    { label: 'Ingresos Totales', value: formatCOP(totalRevenue), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', iconBg: 'bg-emerald-100' },
    { label: 'Pedidos Totales', value: totalOrders.toLocaleString(), icon: ShoppingCart, color: 'bg-blue-50 text-blue-600', iconBg: 'bg-blue-100' },
    { label: 'Valor Promedio', value: formatCOP(avgOrderValue), icon: Package, color: 'bg-purple-50 text-purple-600', iconBg: 'bg-purple-100' },
    { label: 'Tasa Conversión', value: `${conversionRate.toFixed(1)}%`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600', iconBg: 'bg-amber-100' },
  ];

  if (salesLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen general de tu tienda</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-5 border border-gray-100`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium opacity-80">{stat.label}</span>
              <div className={`${stat.iconBg} p-2 rounded-lg`}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Tendencia Mensual de Ventas</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [formatCOP(value), 'Ingresos']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
                <Bar dataKey="revenue" fill="#2E75B6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No hay datos de ventas disponibles
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Top 5 Productos</h3>
          {topLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : topProducts && topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, i) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {product.mainImage && (
                      <img src={product.mainImage} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.unitsSold} vendidos</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{formatCOP(toNumber(product.revenue))}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Sin datos</p>
          )}
        </div>
      </div>
    </div>
  );
}
