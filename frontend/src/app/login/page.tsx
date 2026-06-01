'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFieldErrors({});
    
    let hasError = false;
    const errors: { email?: string; password?: string } = {};
    
    if (!email) { errors.email = 'El correo es requerido'; hasError = true; }
    if (!password) { errors.password = 'La contraseña es requerida'; hasError = true; }
    
    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    try {
      await login(email, password);
      // Wait for auth state to update, then route
      const isAdmin = useAuthStore.getState().isAdmin;
      if (isAdmin) {
        router.replace('/admin');
      } else if (redirectUrl) {
        router.replace(redirectUrl);
      } else {
        router.replace('/');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel (Hidden on Mobile) */}
      <div 
        className="hidden lg:flex flex-col flex-1 relative overflow-hidden text-white p-12 justify-center"
        style={{ background: 'linear-gradient(135deg, #1a5296 0%, #2E75B6 50%, #4a9fd4 100%)' }}
      >
        <div className="relative z-10 max-w-md">
          <Link href="/" className="inline-flex bg-white/10 w-16 h-16 rounded-2xl items-center justify-center mb-8 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors shadow-lg overflow-hidden" title="Volver al inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://res.cloudinary.com/ds7js53vz/image/upload/v1779898616/eie/logos/EIE_Imagen.jpg" alt="Logo" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Bienvenido de nuevo
          </h1>
          <p className="text-blue-100 text-lg flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-300" />
            Accede a tu cuenta para ver recomendaciones personalizadas.
          </p>
        </div>
        
        {/* Background Decorative Logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 select-none pointer-events-none rounded-full overflow-hidden mix-blend-overlay">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src="https://res.cloudinary.com/ds7js53vz/image/upload/v1779898616/eie/logos/EIE_Imagen.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        
        {/* Background Decorative Circles */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-black/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right Panel (Form) */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white">
        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8 lg:hidden flex justify-between items-center">
             <Link href="/" className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md hover:opacity-90 transition-opacity overflow-hidden" title="Volver al inicio">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://res.cloudinary.com/ds7js53vz/image/upload/v1779898616/eie/logos/EIE_Imagen.jpg" alt="Logo" className="w-full h-full object-cover" />
            </Link>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-gray-900">Iniciar sesión</h2>
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-primary hidden lg:block">Volver al inicio</Link>
          </div>
          <p className="text-gray-500 mb-8">Ingresa tus datos para continuar.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${fieldErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'}`}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${fieldErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center h-[46px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
