'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSuccess, setIsSuccess] = useState(false);

  // Password requirements
  const reqs = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[\W_]/.test(formData.password)
  };
  const score = Object.values(reqs).filter(Boolean).length;
  const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-green-500'];
  const strengthLabels = ['', 'Muy débil', 'Débil', 'Buena', 'Segura'];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (formData.fullName.length < 3) errs.fullName = 'El nombre debe tener al menos 3 caracteres';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Correo inválido';
    if (score < 4) errs.password = 'La contraseña no cumple los requisitos';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden';
    return errs;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    try {
      setIsSubmitting(true);
      await register(formData.fullName, formData.email, formData.password);
      router.push(`/verify-account?email=${encodeURIComponent(formData.email)}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setLocalError(err.response?.data?.message || err.message || 'Ocurrió un error al registrarse. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cuenta creada!</h2>
          <p className="text-gray-500 mb-6">Tu registro ha sido exitoso. Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div 
        className="hidden lg:flex flex-col flex-1 relative overflow-hidden text-white p-12 justify-center"
        style={{ background: 'linear-gradient(135deg, #1a5296 0%, #2E75B6 50%, #4a9fd4 100%)' }}
      >
        <div className="relative z-10 max-w-md">
          <Link href="/" className="inline-flex bg-white/10 w-16 h-16 rounded-2xl items-center justify-center mb-8 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors shadow-lg overflow-hidden" title="Volver al inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://res.cloudinary.com/ds7js53vz/image/upload/v1780277735/eie/cat-12/prod-43/img-2.jpg" alt="Logo" className="w-full h-full object-cover" />
          </Link>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Únete a EIE
          </h1>
          <p className="text-blue-100 text-lg">
            Crea tu cuenta y descubre un mundo de recomendaciones a tu medida.
          </p>
        </div>
        
        {/* Background Decorative Logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 select-none pointer-events-none rounded-full overflow-hidden mix-blend-overlay">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src="https://res.cloudinary.com/ds7js53vz/image/upload/v1780277735/eie/cat-12/prod-43/img-2.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white py-12">
        <div className="max-w-sm w-full mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Crear cuenta</h2>
          <p className="text-gray-500 mb-8">Completa el formulario para registrarte.</p>

          {(error || localError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">{error || localError}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-2.5 border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border-gray-200"
              />
              {fieldErrors.fullName && <p className="mt-1 text-xs text-red-500">{fieldErrors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2.5 border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border-gray-200"
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border-gray-200"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Strength Bar & Requirements */}
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1 mb-1">
                    {[1, 2, 3, 4].map(num => (
                      <div key={num} className={`flex-1 rounded-full ${score >= num ? strengthColors[score] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-[10px] mb-2 font-medium ${strengthColors[score].replace('bg-', 'text-')}`}>{strengthLabels[score]}</p>
                  
                  <div className="space-y-1 mt-2">
                    <p className={`text-xs flex items-center gap-1.5 transition-colors ${reqs.length ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={14} className={reqs.length ? 'text-green-500' : 'text-gray-300'} /> Mínimo 8 caracteres
                    </p>
                    <p className={`text-xs flex items-center gap-1.5 transition-colors ${reqs.upper ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={14} className={reqs.upper ? 'text-green-500' : 'text-gray-300'} /> Al menos una letra mayúscula
                    </p>
                    <p className={`text-xs flex items-center gap-1.5 transition-colors ${reqs.number ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={14} className={reqs.number ? 'text-green-500' : 'text-gray-300'} /> Al menos un número
                    </p>
                    <p className={`text-xs flex items-center gap-1.5 transition-colors ${reqs.special ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={14} className={reqs.special ? 'text-green-500' : 'text-gray-300'} /> Al menos un carácter especial
                    </p>
                  </div>
                </div>
              )}
              {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-2.5 border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border-gray-200"
              />
              {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center h-[46px] mt-6"
            >
              {(isLoading || isSubmitting) ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta? <Link href="/login" className="font-medium text-primary hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
