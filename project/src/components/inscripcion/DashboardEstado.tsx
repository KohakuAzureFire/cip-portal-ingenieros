import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from './Stepper';
import { FormDatos } from './FormDatos';
import { FormDocumentos } from './FormDocumentos';
import { FormPago } from './FormPago';
import { UploadedDocument, PaymentMethod } from '../../types';
import { db } from '../../services/mockDb';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const DashboardEstado: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    dni: '',
    nombre_completo: '',
    telefono: '',
    documentos: [] as UploadedDocument[],
    metodo_pago: '' as PaymentMethod | '',
    comprobante_url: '',
  });

  const steps = ['Datos Personales', 'Documentos', 'Pago'];
  const INSCRIPCION_MONTO = 1500.0;

  const handleDatosNext = (data: { nombre_completo: string; dni: string; email: string; telefono: string; password: string }) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
    setCurrentStep(1);
  };

  const handleDocumentosNext = (documents: UploadedDocument[]) => {
    setFormData((prev) => ({
      ...prev,
      documentos: documents,
    }));
    setCurrentStep(2);
  };

  const handlePagoNext = async (_paymentData: {
    comprobante_url: string;
  }) => {
    setLoading(true);
    setError('');

    try {
      db.createPostulante({
        id: `postulante-${Date.now()}`,
        email: formData.email,
        password: formData.password,
        nombre_completo: formData.nombre_completo,
        dni: formData.dni,
        telefono: formData.telefono,
        rol: 'Postulante',
        estado: 'Pendiente',
        documentos: formData.documentos,
        pago_inscripcion: {
          id: `pago-${Date.now()}`,
          user_id: `postulante-${Date.now()}`,
          monto: INSCRIPCION_MONTO,
          metodo: 'voucher',
          estado: 'pendiente',
          comprobante_url: _paymentData.comprobante_url,
          created_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError('Error al procesar la inscripción. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-lg text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Inscripción Exitosa</h2>
          <p className="text-gray-600 mb-6">
            Su solicitud ha sido registrada correctamente. Un administrador revisará sus documentos
            pronto.
          </p>
          <p className="text-sm text-gray-500">
            Será redirigido al login en unos segundos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proceso de Inscripción</h1>
          <p className="text-gray-600">
            Complete los pasos para registrarse como ingeniero colegiado
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Stepper steps={steps} currentStep={currentStep} />

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Forms */}
          {currentStep === 0 && (
            <FormDatos onNext={handleDatosNext} loading={loading} />
          )}

          {currentStep === 1 && (
            <FormDocumentos
              onNext={handleDocumentosNext}
              onBack={() => setCurrentStep(0)}
              loading={loading}
            />
          )}

          {currentStep === 2 && (
            <FormPago
              monto={INSCRIPCION_MONTO}
              onNext={handlePagoNext}
              onBack={() => setCurrentStep(1)}
              loading={loading}
            />
          )}
        </div>

        {/* Progress Indicator */}
        <div className="text-center mt-8 text-sm text-gray-600">
          Paso {currentStep + 1} de {steps.length}
        </div>
      </div>
    </div>
  );
};
