import { useState } from "react";
import { Search, ToggleLeft, ToggleRight, X } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { AdminSidebar } from "../../components/AdminSidebar";
import { useApp } from "../../context/AppContext";

interface UserType {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export function AdminUsers() {
  const { users, setUsers } = useApp();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [confirmModal, setConfirmModal] = useState<UserType | null>(null);

  const filtered = users.filter(u => {
    const matchQuery = !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === "Todos" || u.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const handleToggleClick = (user: UserType) => {
    if (user.role === "Administrador") return;
    if (user.status === "Activo") {
      setConfirmModal(user);
    } else {
      setUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, status: "Activo" } : u
      ));
    }
  };

  const confirmDeactivate = () => {
    if (!confirmModal) return;
    setUsers(prev => prev.map(u =>
      u.id === confirmModal.id ? { ...u, status: "Inactivo" } : u
    ));
    setConfirmModal(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-gray-900 text-xl">Gestión de usuarios</h1>
            <p className="text-sm text-gray-500">{users.length} usuarios registrados</p>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar por nombre o correo..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 bg-white text-gray-700"
            >
              <option>Todos</option>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </div>

          {/* Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider hidden md:table-cell">Correo</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider hidden lg:table-cell">Rol</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">#{user.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                          style={{ backgroundColor: "#2E75B6" }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{user.email}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === "Administrador" ? "bg-purple-100 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.status === "Activo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleClick(user)}
                          disabled={user.role === "Administrador"}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-colors ${
                            user.status === "Activo"
                              ? "bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-30"
                              : "bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-30"
                          }`}
                        >
                          {user.status === "Activo" ? <><ToggleRight size={13} /> Desactivar</> : <><ToggleLeft size={13} /> Activar</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-10 text-center text-gray-400 text-sm">No se encontraron usuarios.</div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">{filtered.length} usuarios mostrados</p>
        </main>
      </div>

      {/* Deactivate user confirmation modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">¿Desactivar usuario?</h3>
              <button onClick={() => setConfirmModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              El usuario <span className="font-medium text-gray-800">{confirmModal.email}</span> no podrá iniciar sesión hasta que lo reactives.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeactivate}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors"
                style={{ backgroundColor: "#DC2626" }}
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}