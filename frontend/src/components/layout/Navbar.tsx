'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, ChevronDown, LogOut, Package, Settings, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminRoute = pathname?.startsWith('/admin');
  
  const { isAuthenticated, user, isAdmin, logout } = useAuthStore();
  const { itemCount, fetchCart } = useCartStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Initial cart fetch if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full h-16 bg-primary shadow-sm">
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link 
          href={isAdmin ? '/admin' : '/'} 
          className="flex-shrink-0 bg-white text-primary px-3 py-1 rounded-md font-bold text-xl tracking-tight"
        >
          EIE
        </Link>

        {/* Search Bar (Hidden for admin or mobile) */}
        {!isAdminRoute && (
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl relative items-center"
          >
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-white/70 border border-white/20 rounded-full py-1.5 pl-4 pr-10 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 transition-colors"
            />
            <button type="submit" className="absolute right-3 text-white/70 hover:text-white">
              <Search size={18} />
            </button>
          </form>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          
          {/* Cart Icon */}
          {!isAdminRoute && (
            <Link href="/cart" className="relative text-white hover:text-white/80 transition-colors">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-medium text-sm border border-white/30">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown size={16} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    
                    {!isAdmin ? (
                      <>
                        <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                          <User size={16} /> Mi perfil
                        </Link>
                        <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                          <Package size={16} /> Mis pedidos
                        </Link>
                      </>
                    ) : (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                        <Shield size={16} /> Panel Admin
                      </Link>
                    )}
                    
                    <div className="border-t border-gray-50 my-1"></div>
                    
                    <button 
                      onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={16} /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link 
              href="/login"
              className="text-sm font-medium bg-white text-primary px-4 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
            >
              Iniciar sesión
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}
