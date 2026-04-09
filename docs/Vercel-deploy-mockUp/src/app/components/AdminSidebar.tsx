import { useNavigate, useLocation } from "react-router";
import { LayoutDashboard, Package, ShoppingBag, Star, BarChart2, Users } from "lucide-react";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/admin/users", label: "Usuarios", icon: Users },
  { path: "/admin/products", label: "Productos", icon: Package },
  { path: "/admin/orders", label: "Pedidos", icon: ShoppingBag },
  { path: "/admin/recommendations", label: "Recomendaciones", icon: Star },
  { path: "/admin/stats", label: "Estadísticas", icon: BarChart2 },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside className="w-56 min-h-screen flex-shrink-0" style={{ backgroundColor: "#F5F5F5", borderRight: "1px solid #e0e0e0" }}>
      <nav className="py-4">
        <p className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wider">Menú Principal</p>
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                active
                  ? "text-white font-medium"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              style={active ? { backgroundColor: "#2E75B6" } : {}}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
