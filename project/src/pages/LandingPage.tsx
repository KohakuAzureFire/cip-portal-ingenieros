import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, LogIn, Award, Users, CheckCircle } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header */}
      <header className="bg-blue-950 border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 text-blue-200" />
            <div>
              <h1 className="text-2xl font-bold text-white">Colegio de Ingenieros del Perú</h1>
              <p className="text-blue-200 text-sm">Sistema de Colegiatura</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Shield className="w-10 h-10 text-blue-700" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Sistema de Colegiatura Profesional
          </h2>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Plataforma oficial para la inscripción, gestión y certificación de ingenieros colegiados en el Perú
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Inscripción Card */}
          <div className="bg-white rounded-xl shadow-2xl p-8 hover:shadow-3xl transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Iniciar Trámite de Inscripción</h3>
                <p className="text-gray-600 text-sm">Nuevo postulante</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Complete el proceso de inscripción en 3 pasos: valide su DNI, cargue sus documentos profesional y realice el pago de la cuota de inscripción.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Validación automática de identidad</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Carga de documentos digitales</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Cuota de inscripción: S/ 1,500.00</span>
              </li>
            </ul>
            <button
              onClick={() => navigate('/registro')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Comenzar Inscripción
            </button>
          </div>

          {/* Intranet Card */}
          <div className="bg-white rounded-xl shadow-2xl p-8 hover:shadow-3xl transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                <LogIn className="w-7 h-7 text-blue-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Intranet CIP</h3>
                <p className="text-gray-600 text-sm">Personal colegiado y administración</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Acceso al portal institucional para ingenieros colegiados, personal administrativo y gestión de trámites.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Consulta de estado de colegiatura</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Carnet digital profesional</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Gestión de cuotas mensuales</span>
              </li>
            </ul>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="text-center text-white">
            <div className="w-12 h-12 bg-blue-800 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-semibold mb-1">Certificación Profesional</h4>
            <p className="text-blue-200 text-sm">Obtenga su CIP oficial y carnet digital</p>
          </div>
          <div className="text-center text-white">
            <div className="w-12 h-12 bg-blue-800 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-semibold mb-1">Consejo Profesional</h4>
            <p className="text-blue-200 text-sm">Integre la comunidad de ingenieros colegiados</p>
          </div>
          <div className="text-center text-white">
            <div className="w-12 h-12 bg-blue-800 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="font-semibold mb-1">Proceso Digital</h4>
            <p className="text-blue-200 text-sm">100% en línea y seguro</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 border-t border-blue-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-blue-200 text-sm">
            <p>Colegio de Ingenieros del Perú - Sistema de Colegiatura</p>
            <p className="mt-2">Institución profesional al servicio de la ingeniería peruana</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
