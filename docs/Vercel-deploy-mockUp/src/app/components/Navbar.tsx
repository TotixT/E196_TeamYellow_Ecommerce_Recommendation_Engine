import { useState } from "react";
import { useNavigate } from "react-router";
import { ShoppingCart, Search, User, ChevronDown, LogOut, Package, Settings } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout, cart, role } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/catalog");
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/login");
  };

  return (
    <nav style={{ backgroundColor: "#2E75B6" }} className="sticky top-0 z-50 shadow-md">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <button onClick={() => navigate(role === "admin" ? "/admin" : "/")} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <span className="text-[#2E75B6] text-xs font-bold">EIE</span>
          </div>
          <span className="text-white text-sm font-semibold leading-tight hidden sm:block">
            Ecommerce<br />Intelligent Engine
          </span>
        </button>

        {/* Search bar */}
        {role !== "admin" && (
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-4 pr-10 py-2 rounded-lg text-sm bg-white border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2E75B6]">
                <Search size={18} />
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center gap-3 ml-auto">
          {/* Cart icon */}
          {role !== "admin" && isAuthenticated && (
            <button
              onClick={() => navigate("/cart")}
              className="relative text-white hover:text-blue-200 transition-colors p-1"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
          )}

          {/* User menu */}
          {isAuthenticated && currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-sm hidden md:block">{currentUser.name.split(" ")[0]}</span>
                <ChevronDown size={14} />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-100 min-w-48 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                  </div>
                  {role === "user" && (
                    <>
                      <button onClick={() => { navigate("/profile"); setShowUserMenu(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings size={15} /> Mi perfil
                      </button>
                      <button onClick={() => { navigate("/orders"); setShowUserMenu(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Package size={15} /> Mis pedidos
                      </button>
                    </>
                  )}
                  {role === "admin" && (
                    <button onClick={() => { navigate("/admin"); setShowUserMenu(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Settings size={15} /> Panel Admin
                    </button>
                  )}
                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={15} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="text-white border border-white/50 hover:bg-white/10 px-4 py-1.5 rounded-lg text-sm transition-colors"
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
