import { useState } from "react";
import { CheckCircle2, User, Lock, AlertCircle } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useApp } from "../context/AppContext";

export function Profile() {
  const { currentUser } = useApp();
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (passwordForm.current !== "123456") {
      setPasswordError("La contraseña actual es incorrecta.");
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setPasswordSuccess(true);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[960px] mx-auto px-6 py-8">
        <h1 className="text-gray-900 text-xl mb-6">Mi perfil</h1>

        {/* Avatar section */}
        <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#2E75B6" }}>
            <User size={28} className="text-white" />
          </div>
          <div>
            <p className="text-gray-900 font-medium">{currentUser?.name}</p>
            <p className="text-sm text-gray-500">{currentUser?.email}</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">{currentUser?.role}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personal data form */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User size={16} className="text-[#2E75B6]" />
              <h2 className="text-gray-800">Datos personales</h2>
            </div>
            <form onSubmit={handleProfileSave} className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nombre completo</label>
                <input
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                  placeholder="Juan Pérez García"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Teléfono</label>
                <input
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                  placeholder="300 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Dirección</label>
                <input
                  value={profileForm.address}
                  onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                  placeholder="Calle 123 #45-67, Bogotá"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Correo electrónico</label>
                <input
                  value={currentUser?.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">El correo no puede modificarse.</p>
              </div>

              {profileSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                  <CheckCircle2 size={15} /> Cambios guardados correctamente.
                </div>
              )}

              <button type="submit" className="w-full py-2.5 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: "#2E75B6" }}>
                Guardar cambios
              </button>
            </form>
          </div>

          {/* Password form */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} className="text-[#2E75B6]" />
              <h2 className="text-gray-800">Cambiar contraseña</h2>
            </div>
            <form onSubmit={handlePasswordSave} className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Contraseña actual</label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  value={passwordForm.newPass}
                  onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                  placeholder="Repite la nueva contraseña"
                />
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  <AlertCircle size={15} /> {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                  <CheckCircle2 size={15} /> Contraseña actualizada correctamente.
                </div>
              )}

              <button type="submit" className="w-full py-2.5 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: "#2E75B6" }}>
                Actualizar contraseña
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
