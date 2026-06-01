'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '@/services/api';
import Link from 'next/link';

// Component that uses useSearchParams inside Suspense boundary
function VerifyAccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const emailParam = searchParams.get('email');
  const tokenParam = searchParams.get('token');
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const verifyCodeOrToken = async (codeOrToken: string) => {
    setStatus('loading');
    setMessage('');
    try {
      const res = await api.post('/auth/verify', { codeOrToken });
      setStatus('success');
      setMessage(res.data.message || 'Cuenta verificada exitosamente.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Código o enlace inválido/expirado.');
    }
  };

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (tokenParam) {
      verifyCodeOrToken(tokenParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenParam]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only 1 digit per input
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto submit if all 6 digits are filled
    if (index === 5 && value && newCode.every(c => c !== '')) {
      verifyCodeOrToken(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    try {
      setStatus('loading');
      await api.post('/auth/resend-verification', { email: emailParam });
      setCountdown(60); // Start 60 seconds cooldown
      setStatus('idle');
      setMessage('Código reenviado exitosamente a tu correo.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Error al reenviar el código.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      verifyCodeOrToken(fullCode);
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cuenta verificada!</h2>
        <p className="text-gray-500 mb-6">{message}</p>
        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
          <div className="bg-green-500 h-full w-full animate-progress-bar"></div>
        </div>
        <p className="text-xs text-gray-400 mt-4">Serás redirigido al inicio de sesión en un momento...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-fade-in">
      <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-6 relative">
        <Mail size={28} />
        <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifica tu correo</h2>
      <p className="text-gray-500 mb-8 text-sm">
        Hemos enviado un código de 6 dígitos a <br/>
        <strong className="text-gray-900">{emailParam || 'tu correo electrónico'}</strong>
      </p>

      {status === 'error' && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-left">
          <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{message}</p>
        </div>
      )}

      {message && status !== 'error' && (
        <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-600">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex justify-center gap-2 mb-8">
          {code.map((digit, idx) => (
            <input
              key={idx}
              id={`code-${idx}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={digit}
              onChange={(e) => handleCodeChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              disabled={status === 'loading'}
              className="w-12 h-14 text-center text-2xl font-bold border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              autoComplete="off"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || code.join('').length < 6}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center gap-2 h-[50px] disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {status === 'loading' ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Verificar cuenta <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      {emailParam && (
        <div className="text-sm text-gray-500">
          ¿No recibiste el código?{' '}
          <button 
            onClick={handleResend}
            disabled={countdown > 0 || status === 'loading'}
            className="font-medium text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar código'}
          </button>
        </div>
      )}
      
      <div className="mt-8 pt-6 border-t border-gray-100">
        <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}

export default function VerifyAccountPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Suspense fallback={
        <div className="w-full max-w-md h-[400px] bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      }>
        <VerifyAccountContent />
      </Suspense>
    </div>
  );
}
