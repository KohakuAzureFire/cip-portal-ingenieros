import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Home, FileText, Users, CreditCard, Settings } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Inicio', path: '/dashboard', icon: Home, roles: ['Ingeniero', 'Postulante', 'Admin_General', 'Secretario'] },
    { label: 'Mis Solicitudes', path: '/solicitudes', icon: FileText, roles: ['Admin_General'] },
    { label: 'Padrón General', path: '/padron', icon: Users, roles: ['Secretario', 'Admin_General'] },
    { label: 'Cuotas', path: '/cuotas', icon: CreditCard, roles: ['Ingeniero', 'Secretario'] },
    { label: 'Mi Perfil', path: '/perfil', icon: Settings, roles: ['Ingeniero', 'Postulante', 'Admin_General', 'Secretario'] },
  ];

  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.rol || '')
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative md:w-64 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-blue-800">
          <h2 className="text-xl font-bold">CIP Portal</h2>
          <p className="text-xs text-blue-200 mt-1">{user?.nombre_completo}</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {visibleMenuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 transition duration-200"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">{user?.rol}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};
