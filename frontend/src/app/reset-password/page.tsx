'use client';

import { useState, Suspense } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!token) {
      setFieldErrors({ general: 'Enlace inválido o expirado. Vuelve a solicitar la recuperación.' });
      return;
    }

    if (password.length < 8) {
      setFieldErrors({ password: 'Debe tener al menos 8 caracteres' });
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Las contraseñas no coinciden' });
      return;
    }

    setFieldErrors({});

    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Store handles error
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100 text-center animate-fade-in">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 mb-2">Contraseña actualizada</h2>
        <p className="text-sm text-gray-500 mb-6">Tu contraseña ha sido cambiada exitosamente. Todas tus otras sesiones han sido cerradas.</p>
        <p className="text-xs text-gray-400">Redirigiendo al inicio de sesión...</p>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}
      
      {fieldErrors.general && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {fieldErrors.general}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border-gray-200"
              placeholder="••••••••"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border-gray-200"
            placeholder="••••••••"
          />
          {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center h-[46px] mt-6"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Cambiar contraseña'
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold mx-auto mb-6">
            EIE
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Nueva contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 mb-8">
            Ingresa tu nueva contraseña para acceder a tu cuenta.
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Suspense fallback={<div className="text-center p-8">Cargando...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
