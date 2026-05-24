import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, MESES } from '../../services/mockDb';
import { Cuota } from '../../types';
import {
  AlertCircle, CheckCircle2, Clock, DollarSign,
  Upload, X, Eye, FileImage, XCircle,
} from 'lucide-react';

const ESTADO_BADGE: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pagada: {
    label: 'Pagada',
    cls: 'bg-green-100 text-green-800',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  vencida: {
    label: 'Vencida',
    cls: 'bg-red-100 text-red-800',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  pendiente: {
    label: 'Pendiente',
    cls: 'bg-yellow-100 text-yellow-800',
    icon: <Clock className="w-3 h-3" />,
  },
  pendiente_validacion: {
    label: 'En validación',
    cls: 'bg-blue-100 text-blue-800',
    icon: <Clock className="w-3 h-3" />,
  },
  rechazado: {
    label: 'Rechazado',
    cls: 'bg-red-900/10 text-red-900 border border-red-300',
    icon: <XCircle className="w-3 h-3" />,
  },
};

interface ModalVoucherProps {
  cuota: Cuota;
  onClose: () => void;
  onConfirm: (cuotaId: string, url: string) => void;
}

const ModalSubirVoucher: React.FC<ModalVoucherProps> = ({ cuota, onClose, onConfirm }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen (JPG, PNG).');
      e.target.value = '';
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setBase64Data(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!base64Data) return;
    setUploading(true);
    setTimeout(() => {
      onConfirm(cuota.id, base64Data);
      setUploading(false);
    }, 600);
  };

  const mesNombre = MESES[cuota.mes - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Subir Comprobante de Pago</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Cuota de {mesNombre} {cuota.año} — S/ {cuota.monto.toFixed(2)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition group ${
              base64Data
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            {base64Data ? (
              <div className="space-y-3">
                <img
                  src={base64Data}
                  alt="Vista previa"
                  className="max-h-40 mx-auto rounded-lg object-contain"
                />
                <p className="text-xs text-green-700 truncate max-w-[280px] mx-auto">{fileName}</p>
                <p className="text-xs text-gray-400">Haga clic aquí para cambiar el archivo</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center mx-auto transition">
                  <FileImage className="w-7 h-7 text-blue-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Haga clic para seleccionar la imagen del voucher
                </p>
                <p className="text-xs text-gray-400">Solo JPG o PNG — máx. 5 MB</p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={handleFile}
          />

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p className="text-xs text-amber-700">
              Una vez enviado, la cuota quedará en estado <strong>Pendiente de Validación</strong> hasta que la administración apruebe su comprobante.
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!base64Data || uploading}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><Clock className="w-4 h-4 animate-spin" /> Enviando...</>
            ) : (
              <><Upload className="w-4 h-4" /> Enviar Comprobante</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ModalVerVoucherProps {
  cuota: Cuota;
  onClose: () => void;
}

const ModalVerVoucher: React.FC<ModalVerVoucherProps> = ({ cuota, onClose }) => {
  const mesNombre = MESES[cuota.mes - 1];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Comprobante Enviado</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Cuota de {mesNombre} {cuota.año}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {cuota.voucher_url ? (
            <img
              src={cuota.voucher_url}
              alt="Voucher enviado"
              className="w-full rounded-xl border border-gray-200 max-h-64 object-contain"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No se encontró imagen del comprobante</p>
          )}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-xs text-blue-700">
              Su comprobante está siendo revisado por la administración. Recibirá una notificación cuando sea aprobado.
            </p>
          </div>
        </div>
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export const EstadoCuenta: React.FC = () => {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const [modalSubir, setModalSubir] = useState<Cuota | null>(null);
  const [modalVer, setModalVer] = useState<Cuota | null>(null);

  if (!user || user.rol !== 'Ingeniero') {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No tiene acceso a esta sección</p>
      </div>
    );
  }

  const ingeniero = db.getIngenieroByEmail(user.email);

  if (!ingeniero || !ingeniero.cip) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No se encontraron datos de colegiatura</p>
      </div>
    );
  }

  const cuotas = db.getIngenieroCuotas(ingeniero.cip);
  const pagadas = cuotas.filter(c => c.estado === 'pagada').length;
  const deudaTotal = cuotas
    .filter(c => c.estado === 'vencida' || c.estado === 'pendiente')
    .reduce((sum, c) => sum + c.monto, 0);

  const handleVoucherConfirmado = (cuotaId: string, url: string) => {
    db.subirVoucherCuota(cuotaId, url);
    setModalSubir(null);
    setRefresh(r => r + 1);
  };

  // Fuerza re-render leyendo refresh
  void refresh;

  return (
    <div className="space-y-6">
      {modalSubir && (
        <ModalSubirVoucher
          cuota={modalSubir}
          onClose={() => setModalSubir(null)}
          onConfirm={handleVoucherConfirmado}
        />
      )}
      {modalVer && (
        <ModalVerVoucher
          cuota={modalVer}
          onClose={() => setModalVer(null)}
        />
      )}

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-l-blue-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Cuotas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{cuotas.length}</p>
            </div>
            <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl shadow-md p-6 border-l-4 border-l-green-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">Cuotas Pagadas</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{pagadas}</p>
            </div>
            <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-md p-6 border-l-4 ${deudaTotal > 0 ? 'bg-red-50 border-l-red-600' : 'bg-blue-50 border-l-blue-600'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${deudaTotal > 0 ? 'text-red-700' : 'text-blue-700'}`}>
                {deudaTotal > 0 ? 'Deuda Pendiente' : 'Sin Deuda'}
              </p>
              <p className={`text-3xl font-bold mt-1 ${deudaTotal > 0 ? 'text-red-900' : 'text-blue-900'}`}>
                S/ {deudaTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historial mes a mes */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-900 text-white px-6 py-4">
          <h3 className="font-semibold">Historial de Cuotas — {cuotas[0]?.año ?? 2026}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mes</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vencimiento</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cuotas.map((cuota) => {
                const badge = ESTADO_BADGE[cuota.estado] ?? ESTADO_BADGE.pendiente;
                const esAccionable = cuota.estado === 'vencida' || cuota.estado === 'pendiente' || cuota.estado === 'rechazado';
                const esEnValidacion = cuota.estado === 'pendiente_validacion';
                const esRechazado = cuota.estado === 'rechazado';

                return (
                  <tr key={cuota.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900 capitalize">
                      {MESES[cuota.mes - 1]}
                      {cuota.monto === 0 && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Gratis</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      S/ {cuota.monto.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(cuota.fecha_vencimiento).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {esAccionable && cuota.monto > 0 && (
                        <button
                          onClick={() => setModalSubir(cuota)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 text-white text-xs font-semibold rounded-lg transition ${
                            esRechazado
                              ? 'bg-red-700 hover:bg-red-800'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {esRechazado ? 'Volver a subir comprobante' : 'Subir Comprobante'}
                        </button>
                      )}
                      {esEnValidacion && (
                        <button
                          onClick={() => setModalVer(cuota)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver Comprobante
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h4 className="font-semibold text-blue-900 mb-2">Información de Pagos</h4>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>• El primer mes de colegiatura no tiene costo.</li>
          <li>• Las cuotas mensuales tienen un valor de S/ 20.00.</li>
          <li>• El pago debe realizarse antes del día 15 de cada mes.</li>
          <li>• Tras enviar el comprobante, la administración validará el pago en 24–48 h.</li>
        </ul>
      </div>
    </div>
  );
};
