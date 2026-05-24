import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './routes/PrivateRoute';
import { Login } from './components/auth/Login';
import { DashboardEstado } from './components/inscripcion/DashboardEstado';
import { Dashboard } from './pages/Dashboard';
import { PanelControl } from './components/admin/PanelControl';
import { PadronGeneral } from './components/admin/PadronGeneral';
import { DashboardLayout } from './components/common/DashboardLayout';
import { PerfilIngeniero } from './components/common/PerfilIngeniero';
import { EstadoCuenta } from './components/cuotas/EstadoCuenta';
import { LandingPage } from './pages/LandingPage';

const STORAGE_KEY = 'colegiatura_cip_db';

function App() {
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      let changed = false;

      if (Array.isArray(data.postulantes)) {
        const antes = data.postulantes.length;
        data.postulantes = data.postulantes.filter(
          (p: any) =>
            p.dni &&
            p.nombre_completo &&
            (p.estado === 'Pendiente' || p.estado === 'Aprobado')
        );
        if (data.postulantes.length !== antes) changed = true;
      }

      if (Array.isArray(data.ingenieros)) {
        const antes = data.ingenieros.length;
        data.ingenieros = data.ingenieros.filter(
          (i: any) =>
            i.dni &&
            i.nombre_completo &&
            i.cip &&
            (i.estado === 'Hábil' || i.estado === 'Inhabilitado')
        );
        if (data.ingenieros.length !== antes) changed = true;
      }

      if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch {
      // Si el JSON esta corrupto, no hacer nada; el mockDb lo resetea al inicializar
    }
  }, []);
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<DashboardEstado />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="Admin_General">
                <DashboardLayout title="Panel de Control">
                  <PanelControl />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          {/* Secretary Routes */}
          <Route
            path="/padron"
            element={
              <PrivateRoute requiredRole={['Secretario', 'Admin_General']}>
                <DashboardLayout title="Padrón General">
                  <PadronGeneral />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/cuotas"
            element={
              <PrivateRoute requiredRole={['Ingeniero']}>
                <DashboardLayout title="Estado de Cuenta">
                  <EstadoCuenta />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/solicitudes"
            element={
              <PrivateRoute requiredRole="Admin_General">
                <DashboardLayout title="Gestión de Solicitudes">
                  <PanelControl />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <DashboardLayout title="Mi Perfil">
                  <PerfilIngeniero />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
