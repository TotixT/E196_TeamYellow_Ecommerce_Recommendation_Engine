'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!email) return;

    try {
      const response = await forgotPassword(email);
      setSuccessMessage(response.message);
      setMaskedEmail(response.email);
      setIsSuccess(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Error handled by store
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100 text-center animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 mb-2">Revisa tu correo</h2>
            <p className="text-sm text-gray-500 mb-6">{successMessage}</p>
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <span className="text-sm font-medium text-gray-900">{maskedEmail}</span>
            </div>
            <Link href="/login" className="text-primary hover:text-primary-dark font-medium text-sm">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold mx-auto mb-6">
            EIE
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Recuperar contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu correo y te enviaremos las instrucciones.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border-gray-200"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center h-[46px] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Enviar enlace de recuperación'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft size={16} /> Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
