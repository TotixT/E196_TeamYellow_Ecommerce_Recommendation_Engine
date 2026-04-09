import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

// Simulated registered emails
const REGISTERED_EMAILS = ["admin@eie.com", "user@eie.com"];

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  const map: PasswordStrength[] = [
    { score: 1, label: "Muy débil", color: "#DC2626" },
    { score: 2, label: "Débil", color: "#D97706" },
    { score: 3, label: "Aceptable", color: "#CA8A04" },
    { score: 4, label: "Segura ✓", color: "#16A34A" },
  ];
  return map[Math.min(score, 4) - 1] || { score: 0, label: "", color: "" };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  const segmentColors = ["#E5E7EB", "#E5E7EB", "#E5E7EB", "#E5E7EB"];
  const activeColor =
    strength.score === 1 ? "#DC2626" :
    strength.score === 2 ? "#D97706" :
    strength.score === 3 ? "#CA8A04" : "#16A34A";

  for (let i = 0; i < strength.score; i++) {
    segmentColors[i] = activeColor;
  }

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {segmentColors.map((color, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-all duration-300"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      {strength.label && (
        <p className="text-xs" style={{ color: activeColor }}>
          {strength.label}
        </p>
      )}
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    } else if (form.name.trim().length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
    }

    if (!form.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Ingresa un correo válido (ej: usuario@correo.com)";
    } else if (REGISTERED_EMAILS.includes(form.email.toLowerCase())) {
      newErrors.email = "ALREADY_REGISTERED";
    }

    if (!form.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password)) {
      newErrors.password = "Mínimo 8 caracteres, 1 mayúscula y 1 carácter especial";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-4">
            <CheckCircle2 size={56} className="text-green-500" />
          </div>
          <h2 className="text-gray-900 text-xl mb-2">¡Registro exitoso!</h2>
          <p className="text-gray-500 text-sm">Tu cuenta ha sido creada. Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

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
          <h2 className="text-white text-3xl mb-4">Únete a nuestra comunidad</h2>
          <p className="text-blue-100 text-base leading-relaxed">
            Crea tu cuenta y empieza a disfrutar de una experiencia de compra personalizada con inteligencia artificial.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Regístrate gratis en menos de 2 minutos",
              "Recibe recomendaciones personalizadas desde el primer día",
              "Accede a ofertas exclusivas para miembros",
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

          <h2 className="text-gray-900 text-2xl mb-1">Crear cuenta</h2>
          <p className="text-gray-500 text-sm mb-8">Completa los campos para registrarte</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Juan Pérez García"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${errors.name ? "border-red-500 bg-red-50" : "border-gray-200"}`}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="correo@ejemplo.com"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${errors.email ? "border-red-500 bg-red-50" : "border-gray-200"}`}
              />
              {errors.email && errors.email !== "ALREADY_REGISTERED" && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
              {errors.email === "ALREADY_REGISTERED" && (
                <p className="text-xs text-red-600 mt-1">
                  Este correo ya está registrado. ¿Deseas{" "}
                  <Link to="/login" className="underline" style={{ color: "#2E75B6" }}>
                    iniciar sesión
                  </Link>
                  ?
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 pr-10 transition-colors ${errors.password ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrengthBar password={form.password} />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  placeholder="Repite tu contraseña"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 pr-10 transition-colors ${errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-70 mt-2"
              style={{ backgroundColor: "#2E75B6" }}
            >
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-medium hover:underline" style={{ color: "#2E75B6" }}>
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}