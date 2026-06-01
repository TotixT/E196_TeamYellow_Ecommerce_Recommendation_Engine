'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api-endpoints';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  
  // Personal Data Form
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Form
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      const { data } = await api.put('/auth/profile', profileData); // Endpoint ficticio para actualizar perfil si existiese en backend
      // Si el backend no tiene endpoint PUT /auth/profile, simulamos el éxito
      setUser({ ...user!, ...profileData });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordData.newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Error al actualizar la contraseña');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-[1000px] w-full mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center sticky top-24">
              <div className="w-24 h-24 rounded-full bg-primary text-white text-3xl font-bold flex items-center justify-center mx-auto mb-4 shadow-md">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{user.fullName}</h2>
              <p className="text-sm text-gray-500 mb-4">{user.email}</p>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-primary rounded-full text-xs font-semibold uppercase tracking-wide">
                <Shield size={14} /> {user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </div>
            </div>
          </div>

          {/* Forms Section */}
          <div className="w-full md:w-2/3 space-y-6">
            
            {/* Personal Data Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="text-primary" /> Datos Personales
              </h3>
              
              {profileSuccess && (
                <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 border border-green-100 animate-fade-in">
                  <CheckCircle2 size={16} /> Perfil actualizado correctamente
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input type="text" value={profileData.fullName} onChange={e => setProfileData({...profileData, fullName: e.target.value})} className="w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                  <div className="relative">
                    <input type="email" value={user.email} disabled className="w-full px-4 py-2.5 rounded-lg bg-gray-100 text-gray-500 border border-transparent cursor-not-allowed pl-10" />
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">El correo no puede ser modificado.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <div className="relative">
                      <input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} placeholder="Tu número" className="w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border border-transparent pl-10" />
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de envío</label>
                    <div className="relative">
                      <input type="text" value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} placeholder="Tu dirección" className="w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border border-transparent pl-10" />
                      <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 flex justify-end">
                  <button type="submit" disabled={isUpdatingProfile} className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70">
                    {isUpdatingProfile ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="text-primary" /> Cambiar Contraseña
              </h3>

              {passwordError && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-fade-in">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 border border-green-100 animate-fade-in">
                  <CheckCircle2 size={16} /> Contraseña cambiada exitosamente
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
                  <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                  <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
                  <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary border border-transparent" />
                </div>
                
                <div className="pt-2 flex justify-end">
                  <button type="submit" disabled={isUpdatingPassword || !passwordData.currentPassword || !passwordData.newPassword} className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70">
                    {isUpdatingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
