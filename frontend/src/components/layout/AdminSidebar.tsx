'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FolderTree, Package, ShoppingBag, BarChart2, Star } from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/categories', label: 'Categorías', icon: FolderTree },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/stats', label: 'Estadísticas', icon: BarChart2 },
  // { href: '/admin/recommendations', label: 'Recomendaciones', icon: Star },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-[#F5F5F5] min-h-[calc(100vh-64px)] border-r border-gray-200 flex flex-col hidden md:flex">
      <div className="p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
          Administración
        </p>
        <nav className="flex flex-col gap-1">
          {ADMIN_LINKS.map((link) => {
            const isActive = link.exact 
              ? pathname === link.href 
              : pathname?.startsWith(link.href);
              
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
