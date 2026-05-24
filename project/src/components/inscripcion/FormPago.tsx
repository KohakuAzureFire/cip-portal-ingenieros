import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Building2, Banknote, X } from 'lucide-react';

interface FormPagoProps {
  monto: number;
  onNext: (data: { comprobante_url: string }) => void;
  onBack: () => void;
  loading?: boolean;
}

export const FormPago: React.FC<FormPagoProps> = ({
  monto,
  onNext,
  onBack,
  loading = false,
}) => {
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo no debe exceder 5MB');
      return;
    }

    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Formato inválido. Se aceptan PDF, JPG o PNG');
      return;
    }

    setError('');
    setComprobante(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!comprobante) {
      setError('Debe cargar el comprobante de pago');
      return;
    }

    onNext({
      comprobante_url: URL.createObjectURL(comprobante),
    });
  };

  const datosBancarios = [
    { label: 'Banco', value: 'Banco de la Nación', mono: false },
    { label: 'Cuenta Corriente', value: '000-12345678-90', mono: true },
    { label: 'CCI', value: '00000123456789012345', mono: true },
    { label: 'Titular', value: 'Colegio de Ingenieros del Perú', mono: false },
    { label: 'Concepto', value: 'Inscripción CIP', mono: false },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Monto a pagar */}
      <div className="bg-slate-50 border border-slate-200 border-l-4 border-l-green-500 rounded-xl p-6">
        <p className="text-sm text-slate-600 font-medium">Monto a pagar</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">S/ {monto.toFixed(2)}</p>
        <p className="text-xs text-slate-500 mt-2">Cuota de inscripción - Pago único</p>
      </div>

      {/* Datos Bancarios - Grid premium */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-gray-200">
          <Building2 className="w-5 h-5 text-slate-700" />
          <h3 className="font-semibold text-slate-900">Datos para Transferencia</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {datosBancarios.map(({ label, value, mono }) => (
            <div key={label} className="grid grid-cols-2 gap-4 px-6 py-3">
              <span className="text-sm text-slate-500">{label}</span>
              <span className={`text-sm font-bold text-slate-900 text-right ${mono ? 'font-mono' : ''}`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
          <p className="text-xs text-amber-700">
            Conserve su comprobante de pago. Deberá cargar una foto clara del voucher a continuación.
          </p>
        </div>
      </div>

      {/* Dropzone del Voucher */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
          Subir Voucher de Pago <span className="text-red-600">*</span>
        </label>

        {comprobante ? (
          <div className="w-full flex items-center gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-green-900 truncate">{comprobante.name}</p>
              <p className="text-sm text-green-700">Voucher cargado correctamente</p>
            </div>
            <button
              type="button"
              onClick={() => setComprobante(null)}
              className="p-2 hover:bg-green-100 rounded-lg transition flex-shrink-0"
            >
              <X className="w-5 h-5 text-green-600" />
            </button>
          </div>
        ) : (
          <label className="w-full flex flex-col items-center justify-center px-6 py-10 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <Banknote className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700">Haz clic para cargar el Voucher de Pago</p>
            <p className="text-xs text-gray-500 mt-1">PDF, JPG o PNG - Máximo 5MB</p>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/jpg"
              onChange={handleFileUpload}
              className="hidden"
              capture="environment"
            />
          </label>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition duration-200"
        >
          Atrás
        </button>
        <button
          type="submit"
          disabled={loading || !comprobante}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          {loading ? 'Procesando...' : 'Completar Inscripción'}
        </button>
      </div>
    </form>
  );
};
