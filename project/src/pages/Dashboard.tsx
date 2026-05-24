import React from 'react';
import { DashboardLayout } from '../components/common/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/mockDb';
import { CarnetDigital } from '../components/cuotas/CarnetDigital';
import { EstadoCuenta } from '../components/cuotas/EstadoCuenta';
import { AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (user?.rol === 'Ingeniero') {
    const ingeniero = db.getIngenieroByEmail(user.email);

    if (!ingeniero) {
      return (
        <DashboardLayout title="Dashboard">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron datos del ingeniero</p>
          </div>
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout title="Mi Dashboard">
        <div className="space-y-8">
          {ingeniero.estado === 'Inhabilitado' && (
            <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-red-900">Membresía Suspendida</h3>
                <p className="text-sm text-red-700 mt-1">
                  Su membresía ha sido suspendida por cuotas impagas. Suba el comprobante de cada cuota vencida para que la administración valide su pago y reactive su estado.
                </p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Carnet Digital</h2>
            <div className="flex justify-center">
              <CarnetDigital ingeniero={ingeniero} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Estado de Cuotas</h2>
            <EstadoCuenta />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Panel de Control">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">CIP</div>
          <p className="text-gray-600">Sistema de Colegiatura</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-md p-8 border-2 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">Bienvenido al Portal</h3>
          <p className="text-sm text-blue-700">
            Use el menú lateral para acceder a las diferentes funciones del sistema.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
