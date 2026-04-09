import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [credentialsError, setCredentialsError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const validateEmpty = (): boolean => {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "El correo electrónico es obligatorio";
    if (!password) errors.password = "La contraseña es obligatoria";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsError(false);
    if (!validateEmpty()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(email, password);
    setLoading(false);
    if (ok) {
      const isAdmin = email === "admin@eie.com";
      navigate(isAdmin ? "/admin" : "/");
    } else {
      setCredentialsError(true);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
    setCredentialsError(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
    setCredentialsError(false);
  };

  const emailHasError = credentialsError || !!fieldErrors.email;
  const passwordHasError = credentialsError || !!fieldErrors.password;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F5F5" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center flex-1 px-16 py-12" style={{ backgroundColor: "#2E75B6" }}>
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-[#2E75B6] text-sm font-bold">EIE</span>
            </div>
            <div>
              <h1 className="text-white text-xl">Ecommerce Intelligent Engine</h1>
              <p className="text-blue-200 text-sm">Sistema de Recomendación Inteligente</p>
            </div>
          </div>
          <h2 className="text-white text-3xl mb-4">Bienvenido de nuevo</h2>
          <p className="text-blue-100 text-base leading-relaxed">
            Accede a tu cuenta para disfrutar de recomendaciones personalizadas, 
            gestionar tus pedidos y explorar miles de productos.
          </p>
          <div className="mt-10 space-y-4">
            {[
              "Recomendaciones inteligentes basadas en tus preferencias",
              "Historial completo de compras y seguimiento de pedidos",
              "Experiencia de compra rápida y segura",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-blue-100 text-sm">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20">
            <p className="text-blue-100 text-xs mb-2 font-medium">Cuentas de prueba:</p>
            <p className="text-white text-xs">👤 user@eie.com / 123456 → Usuario</p>
            <p className="text-white text-xs mt-1">🔧 admin@eie.com / 123456 → Administrador</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2E75B6" }}>
              <span className="text-white text-xs font-bold">EIE</span>
            </div>
            <span className="text-gray-800 font-medium">Ecommerce Intelligent Engine</span>
          </div>

          <h2 className="text-gray-900 text-2xl mb-1">Iniciar sesión</h2>
          <p className="text-gray-500 text-sm mb-8">Ingresa tus credenciales para continuar</p>

          {credentialsError && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>Las credenciales ingresadas son incorrectas. Verifica tu correo y contraseña.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="correo@ejemplo.com"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  emailHasError ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-200"
                }`}
              />
              {fieldErrors.email && !credentialsError && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent pr-10 transition-colors ${
                    passwordHasError ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && !credentialsError && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm hover:underline" style={{ color: "#2E75B6" }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-70"
              style={{ backgroundColor: "#2E75B6" }}
            >
              {loading ? "Verificando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-medium hover:underline" style={{ color: "#2E75B6" }}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}