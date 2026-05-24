import React, { useState } from 'react';
import { db, MESES } from '../../services/mockDb';
import { Ingeniero, Cuota } from '../../types';
import {
  AlertCircle, CheckCircle2, XCircle, RefreshCw,
  Trash2, Eye, ClipboardList, X,
} from 'lucide-react';

// ─── Modal Ver Voucher ────────────────────────────────────────────────────────
interface ModalVoucherProps {
  item: Cuota & { ingeniero: Ingeniero | null };
  onClose: () => void;
  onAprobar: (id: string) => void;
  onRechazar: (id: string) => void;
}

const ModalVoucher: React.FC<ModalVoucherProps> = ({ item, onClose, onAprobar, onRechazar }) => {
  const [motivo, setMotivo] = useState('');
  const [confirmandoRechazo, setConfirmandoRechazo] = useState(false);
  const mes = MESES[item.mes - 1];

  const handleRechazar = () => {
    if (!confirmandoRechazo) { setConfirmandoRechazo(true); return; }
    onRechazar(item.id);
    onClose();
  };

  const handleAprobar = () => {
    onAprobar(item.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Revisar Comprobante de Pago</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {item.ingeniero?.nombre_completo ?? '—'} — CIP {item.ingeniero_cip} — {mes} {item.año}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="px-6 pt-5 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Ingeniero</p>
            <p className="font-semibold text-gray-900">{item.ingeniero?.nombre_completo ?? '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Monto a validar</p>
            <p className="font-semibold text-gray-900">S/ {item.monto.toFixed(2)}</p>
          </div>
        </div>

        {/* Voucher image */}
        <div className="px-6 pt-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Comprobante enviado</p>
          {item.voucher_url ? (
            <img
              src={item.voucher_url}
              alt="Comprobante de pago"
              className="max-w-md w-full h-auto rounded-lg shadow-md mx-auto mb-6 block object-contain max-h-[60vh]"
            />
          ) : (
            <div className="bg-gray-100 rounded-xl p-10 text-center mb-6">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No hay imagen adjunta</p>
            </div>
          )}
        </div>

        {/* Rechazo: campo de motivo */}
        {confirmandoRechazo && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-red-800">Motivo del rechazo (opcional)</p>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              rows={2}
              placeholder="Ej: Voucher ilegible, datos incorrectos..."
              className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            <p className="text-xs text-red-600">Haga clic en "Confirmar Rechazo" para finalizar.</p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button onClick={handleRechazar}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm">
            <XCircle className="w-4 h-4" /> {confirmandoRechazo ? 'Confirmar Rechazo' : 'Rechazar Pago'}
          </button>
          <button onClick={handleAprobar}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4" /> Aprobar Pago
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Pestaña Padrón ───────────────────────────────────────────────────────────
const PadronTab: React.FC<{ refresh: number; onRefresh: () => void }> = ({ refresh, onRefresh }) => {
  const [filter, setFilter] = useState<'todos' | 'habiles' | 'inhabilitados'>('todos');
  void refresh;

  const ingenieros: Ingeniero[] = (db as any).db.ingenieros.filter((i: any) => i.cip !== null);
  const filtered = ingenieros.filter(ing => {
    if (filter === 'habiles') return ing.estado === 'Hábil';
    if (filter === 'inhabilitados') return ing.estado === 'Inhabilitado';
    return true;
  });

  const getDeuda = (cip: string) =>
    db.getIngenieroCuotas(cip)
      .filter(c => c.estado === 'vencida' || (c.estado === 'pendiente' && new Date(c.fecha_vencimiento) < new Date()))
      .reduce((s, c) => s + c.monto, 0);

  const handleCambiarEstado = (id: string, estado: 'Hábil' | 'Inhabilitado') => {
    db.updateIngeniero(id, { estado });
    onRefresh();
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar permanentemente a ${nombre} del padrón? Esta acción no se puede deshacer.`)) return;
    db.deleteIngeniero(id);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-3">
        {(['todos', 'habiles', 'inhabilitados'] as const).map(opt => (
          <button key={opt} onClick={() => setFilter(opt)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              filter === opt ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {opt === 'todos' ? 'Todos' : opt === 'habiles' ? 'Hábiles' : 'Inhabilitados'}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">CIP</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">DNI</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Deuda</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(ing => {
                const deuda = getDeuda(ing.cip!);
                return (
                  <tr key={ing.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-blue-600">{ing.cip}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{ing.nombre_completo}</td>
                    <td className="px-6 py-4 text-gray-600">{ing.dni}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        ing.estado === 'Hábil' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {ing.estado === 'Hábil' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {ing.estado}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-semibold ${deuda > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      S/ {deuda.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {ing.estado === 'Hábil' ? (
                          <button onClick={() => handleCambiarEstado(ing.id, 'Inhabilitado')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg transition">
                            <XCircle className="w-3.5 h-3.5" /> Inhabilitar
                          </button>
                        ) : (
                          <button onClick={() => handleCambiarEstado(ing.id, 'Hábil')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-lg transition">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Habilitar
                          </button>
                        )}
                        <button onClick={() => handleEliminar(ing.id, ing.nombre_completo)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar del padrón">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay registros para mostrar</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-500 text-sm font-medium">Total Colegiados</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{ingenieros.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-md p-6 border-2 border-green-200">
          <p className="text-green-700 text-sm font-medium">Hábiles</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{ingenieros.filter(i => i.estado === 'Hábil').length}</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow-md p-6 border-2 border-red-200">
          <p className="text-red-700 text-sm font-medium">Inhabilitados</p>
          <p className="text-3xl font-bold text-red-900 mt-1">{ingenieros.filter(i => i.estado === 'Inhabilitado').length}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Pestaña Validación Cuotas ────────────────────────────────────────────────
const ValidacionTab: React.FC<{ refresh: number; onRefresh: () => void }> = ({ refresh, onRefresh }) => {
  const [modalItem, setModalItem] = useState<(Cuota & { ingeniero: Ingeniero | null }) | null>(null);
  void refresh;

  const items = db.getCuotasPendientesValidacion();

  const handleAprobar = (id: string) => { db.aprobarCuota(id); onRefresh(); };
  const handleRechazar = (id: string) => { db.rechazarCuota(id); onRefresh(); };

  return (
    <div className="space-y-6">
      {modalItem && (
        <ModalVoucher
          item={modalItem}
          onClose={() => setModalItem(null)}
          onAprobar={(id) => { handleAprobar(id); setModalItem(null); }}
          onRechazar={(id) => { handleRechazar(id); setModalItem(null); }}
        />
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <ClipboardList className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Revise los comprobantes enviados por los ingenieros. Al aprobar, la cuota se marca como pagada y, si el ingeniero queda al día, su estado cambia automáticamente a Hábil.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No hay comprobantes pendientes de validación</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Ingeniero</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">CIP</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Mes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Monto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.ingeniero?.nombre_completo ?? '—'}</td>
                  <td className="px-6 py-4 text-blue-600 font-bold">{item.ingeniero_cip}</td>
                  <td className="px-6 py-4 text-gray-700 capitalize">{MESES[item.mes - 1]} {item.año}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">S/ {item.monto.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setModalItem(item)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition shadow-sm">
                      <Eye className="w-3.5 h-3.5" /> Ver Voucher
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
type Tab = 'padron' | 'validacion';

export const PadronGeneral: React.FC = () => {
  const [tab, setTab] = useState<Tab>('padron');
  const [refresh, setRefresh] = useState(0);
  const onRefresh = () => setRefresh(r => r + 1);

  const porValidar = db.getCuotasPendientesValidacion().length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Padrón General</h2>
        <button onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* Pestañas */}
      <div className="flex border-b border-gray-200">
        <button onClick={() => setTab('padron')}
          className={`px-6 py-3 text-sm font-semibold transition border-b-2 ${
            tab === 'padron' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          Padrón de Colegiados
        </button>
        <button onClick={() => setTab('validacion')}
          className={`px-6 py-3 text-sm font-semibold transition border-b-2 ${
            tab === 'validacion' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          Validación de Cuotas
          {porValidar > 0 && (
            <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{porValidar}</span>
          )}
        </button>
      </div>

      {tab === 'padron' && <PadronTab key={refresh} refresh={refresh} onRefresh={onRefresh} />}
      {tab === 'validacion' && <ValidacionTab key={`v-${refresh}`} refresh={refresh} onRefresh={onRefresh} />}
    </div>
  );
};
