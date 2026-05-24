import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { db, MESES } from '../../services/mockDb';
import { Postulante, Cuota, Ingeniero } from '../../types';
import {
  AlertCircle, CheckCircle2, XCircle, ExternalLink,
  RefreshCw, Trash2, X, Eye, ClipboardList,
} from 'lucide-react';

const EJS_SERVICE = "service_402gwje";
const EJS_TEMPLATE = "template_bhpkxod";
const EJS_KEY = "p4Avp5v5fPfraehyh";

// ─── Modal Ver Voucher de cuota ───────────────────────────────────────────────
interface ModalVoucherCuotaProps {
  item: Cuota & { ingeniero: Ingeniero | null };
  onClose: () => void;
  onAprobar: (id: string) => void;
  onRechazar: (id: string) => void;
}

const ModalVoucherCuota: React.FC<ModalVoucherCuotaProps> = ({ item, onClose, onAprobar, onRechazar }) => {
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
              {item.ingeniero?.nombre_completo ?? 'Ingeniero'} — CIP {item.ingeniero_cip} — {mes} {item.año}
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
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleRechazar}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            <XCircle className="w-4 h-4" />
            {confirmandoRechazo ? 'Confirmar Rechazo' : 'Rechazar Pago'}
          </button>
          <button
            onClick={handleAprobar}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" /> Aprobar Pago
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal de Rechazo ────────────────────────────────────────────────────────
interface ModalRechazoProps {
  postulante: Postulante;
  onClose: () => void;
  onConfirm: (id: string, motivo: string) => void;
}

const ModalRechazo: React.FC<ModalRechazoProps> = ({ postulante, onClose, onConfirm }) => {
  const [motivo, setMotivo] = useState('');
  const [err, setErr] = useState('');

  const handleConfirm = () => {
    if (!motivo.trim()) {
      setErr('Debe ingresar un motivo de rechazo');
      return;
    }
    onConfirm(postulante.id, motivo.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Rechazar Solicitud</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Rechazando solicitud de <span className="font-semibold text-gray-900">{postulante.nombre_completo}</span> (DNI: {postulante.dni})
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo del rechazo *</label>
            <textarea
              value={motivo}
              onChange={e => { setMotivo(e.target.value); setErr(''); }}
              rows={3}
              placeholder="Ej: Voucher ilegible, foto borrosa, datos incorrectos..."
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm ${err ? 'border-red-400' : 'border-gray-300'}`}
            />
            {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
            <XCircle className="w-4 h-4" /> Confirmar Rechazo
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Pestaña: Solicitudes de Ingreso ─────────────────────────────────────────
const SolicitudesTab: React.FC = () => {
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [selected, setSelected] = useState<Postulante | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [rechazoTarget, setRechazoTarget] = useState<Postulante | null>(null);

  const load = () => setPostulantes(db.getAllPostulantes());
  useEffect(() => { load(); }, []);

  const handleAprobar = (id: string) => {
    const postulante = db.getPostulanteById(id);
    if (!postulante) return;
    // CIP siempre 5 dígitos, correlativo
    const cip = db.generateNextCIP();
    const fotoUrl = postulante.documentos.find(d => d.tipo === 'foto')?.url;
    const tituloUrl = postulante.documentos.find(d => d.tipo === 'titulo_profesional')?.url;
    db.createIngeniero(postulante, cip, fotoUrl, tituloUrl);
    // Primer mes gratis (monto 0, estado pagada)
    const hoy = new Date();
    db.createCuota({
      id: `cuota-${Date.now()}`,
      ingeniero_cip: cip,
      mes: hoy.getMonth() + 1,
      año: hoy.getFullYear(),
      monto: 0,
      estado: 'pagada',
      fecha_vencimiento: new Date(hoy.getFullYear(), hoy.getMonth(), 15).toISOString(),
      fecha_pago: hoy.toISOString(),
      created_at: hoy.toISOString(),
    });
    db.updatePostulante(id, { estado: 'Aprobado' as any });
    load();
    setSelected(null);
  };

  const handleObservar = (id: string) => {
    if (!observaciones.trim()) return;
    const postulante = db.getPostulanteById(id);
    db.updatePostulante(id, { estado: 'Rechazado' as any, motivoRechazo: observaciones.trim() } as any);
    if (postulante) {
      emailjs.send(EJS_SERVICE, EJS_TEMPLATE, {
        correo_destino: postulante.email,
        codigo: `Su solicitud fue observada: ${observaciones.trim()}`,
      }, EJS_KEY).catch(() => {});
    }
    setObservaciones('');
    load();
    setSelected(null);
  };

  const handleRechazar = (id: string, motivo: string) => {
    const postulante = db.getPostulanteById(id);
    db.updatePostulante(id, { estado: 'Rechazado' as any, motivoRechazo: motivo } as any);
    if (postulante) {
      emailjs.send(EJS_SERVICE, EJS_TEMPLATE, {
        correo_destino: postulante.email,
        codigo: `Su solicitud de inscripción al CIP fue rechazada. Motivo: ${motivo}`,
      }, EJS_KEY).catch(() => {});
    }
    setRechazoTarget(null);
    load();
    setSelected(null);
  };

  const handleEliminar = (id: string) => {
    if (!confirm('¿Eliminar esta solicitud permanentemente?')) return;
    db.deletePostulante(id);
    if (selected?.id === id) setSelected(null);
    load();
  };

  const pendientes = postulantes.filter(p => p.estado === 'Pendiente');
  const aprobadas = postulantes.filter(p => p.estado === 'Aprobado').length;
  const rechazadas = postulantes.filter(p => p.estado === 'Rechazado').length;

  return (
    <div className="space-y-6">
      {rechazoTarget && (
        <ModalRechazo
          postulante={rechazoTarget}
          onClose={() => setRechazoTarget(null)}
          onConfirm={handleRechazar}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
          <p className="text-blue-700 text-sm font-medium">Pendientes</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{pendientes.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
          <p className="text-green-700 text-sm font-medium">Aprobadas</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{aprobadas}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
          <p className="text-red-700 text-sm font-medium">Rechazadas</p>
          <p className="text-3xl font-bold text-red-900 mt-1">{rechazadas}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-900 text-white px-6 py-4">
              <h3 className="font-semibold">Solicitudes Pendientes</h3>
            </div>
            <div className="max-h-[480px] overflow-y-auto divide-y divide-gray-100">
              {pendientes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No hay solicitudes pendientes</p>
                </div>
              ) : (
                pendientes.map(p => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition ${selected?.id === p.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                  >
                    <button className="flex-1 text-left" onClick={() => setSelected(p)}>
                      <p className="font-semibold text-gray-900 text-sm">{p.nombre_completo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.email}</p>
                      <p className="text-xs text-gray-400">DNI: {p.dni}</p>
                    </button>
                    <button
                      onClick={() => handleEliminar(p.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                      title="Eliminar solicitud"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detalle */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Detalles del Postulante</h3>

              <div className="grid grid-cols-2 gap-4">
                {[['Nombre', selected.nombre_completo], ['DNI', selected.dni], ['Correo', selected.email], ['Estado', selected.estado]].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 font-semibold uppercase">{label}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{val}</p>
                  </div>
                ))}
              </div>

              {/* Documentos */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Documentos</h4>
                <div className="space-y-2">
                  {selected.documentos.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {doc.tipo === 'foto' ? 'Fotografía Personal' : 'Título Profesional'}
                        </p>
                        <p className="text-xs text-gray-500">{doc.nombre_archivo}</p>
                      </div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Ver
                      </a>
                    </div>
                  ))}
                </div>
                <a href="https://enlinea.sunedu.gob.pe/" target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                  <ExternalLink className="w-4 h-4" /> Verificar en SUNEDU
                </a>
              </div>

              {/* Voucher inscripción */}
              {selected.pago_inscripcion?.comprobante_url && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Comprobante de Pago (S/ 1,500.00)</h4>
                  <div className="border-2 border-green-200 rounded-xl overflow-hidden bg-green-50 p-3">
                    <img
                      src={selected.pago_inscripcion.comprobante_url}
                      alt="Voucher"
                      className="max-h-52 mx-auto rounded-lg object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                <textarea
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  rows={3}
                  placeholder="Motivo de observación o rechazo..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => handleAprobar(selected.id)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Aprobar
                </button>
                <button onClick={() => handleObservar(selected.id)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition text-sm">
                  <AlertCircle className="w-4 h-4" /> Observar
                </button>
                <button onClick={() => setRechazoTarget(selected)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition text-sm">
                  <XCircle className="w-4 h-4" /> Rechazar
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Seleccione una solicitud para revisarla</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Pestaña: Validación de Cuotas ───────────────────────────────────────────
const ValidacionCuotasTab: React.FC = () => {
  const [refresh, setRefresh] = useState(0);
  const [modalItem, setModalItem] = useState<(Cuota & { ingeniero: Ingeniero | null }) | null>(null);

  const items = db.getCuotasPendientesValidacion();
  void refresh;

  const handleAprobar = (id: string) => {
    db.aprobarCuota(id);
    setRefresh(r => r + 1);
  };

  const handleRechazar = (id: string) => {
    db.rechazarCuota(id);
    setRefresh(r => r + 1);
  };

  return (
    <div className="space-y-6">
      {modalItem && (
        <ModalVoucherCuota
          item={modalItem}
          onClose={() => setModalItem(null)}
          onAprobar={(id) => { handleAprobar(id); setModalItem(null); }}
          onRechazar={(id) => { handleRechazar(id); setModalItem(null); }}
        />
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <ClipboardList className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Aquí aparecen los comprobantes de pago de cuotas mensuales enviados por los ingenieros. Revise cada voucher y apruebe o rechace según corresponda.
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
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.ingeniero?.nombre_completo ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-bold">{item.ingeniero_cip}</td>
                  <td className="px-6 py-4 text-gray-700 capitalize">{MESES[item.mes - 1]} {item.año}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">S/ {item.monto.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setModalItem(item)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                    >
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

// ─── Panel Principal ──────────────────────────────────────────────────────────
type Tab = 'solicitudes' | 'validacion';

export const PanelControl: React.FC = () => {
  const [tab, setTab] = useState<Tab>('solicitudes');
  const [refresh, setRefresh] = useState(0);

  const pendientes = db.getAllPostulantes().filter(p => p.estado === 'Pendiente').length;
  const porValidar = db.getCuotasPendientesValidacion().length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Panel de Control</h2>
        <button
          onClick={() => setRefresh(r => r + 1)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Pestañas */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab('solicitudes')}
          className={`relative px-6 py-3 text-sm font-semibold transition border-b-2 ${
            tab === 'solicitudes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Bandeja de Solicitudes
          {pendientes > 0 && (
            <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">{pendientes}</span>
          )}
        </button>
        <button
          onClick={() => setTab('validacion')}
          className={`relative px-6 py-3 text-sm font-semibold transition border-b-2 ${
            tab === 'validacion'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Validación de Cuotas
          {porValidar > 0 && (
            <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{porValidar}</span>
          )}
        </button>
      </div>

      {/* Contenido de la pestaña activa — key fuerza remount al actualizar */}
      {tab === 'solicitudes' && <SolicitudesTab key={`sol-${refresh}`} />}
      {tab === 'validacion' && <ValidacionCuotasTab key={`val-${refresh}`} />}
    </div>
  );
};
