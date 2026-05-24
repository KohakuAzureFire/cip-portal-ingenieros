import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/mockDb';
import { Postulante } from '../../types';
import { CarnetDigital } from '../cuotas/CarnetDigital';
import {
  AlertCircle, User, Mail, Phone, Calendar, Shield, Lock,
  CheckCircle2, Loader, Pencil, X, Trash2, XCircle,
} from 'lucide-react';
import emailjs from '@emailjs/browser';

const SERVICE_ID = "service_402gwje";
const TEMPLATE_ID = "template_bhpkxod";
const PUBLIC_KEY = "p4Avp5v5fPfraehyh";

export const PerfilIngeniero: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edición de teléfono
  const [editandoTelefono, setEditandoTelefono] = useState(false);
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [telefonoError, setTelefonoError] = useState('');

  // Edición de correo
  const [editandoCorreo, setEditandoCorreo] = useState(false);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [correoCodigoEnviado, setCorreoCodigoEnviado] = useState(false);
  const [correoCodigo, setCorreoCodigo] = useState('');
  const [enviandoCodigoCorreo, setEnviandoCodigoCorreo] = useState(false);
  const [correoError, setCorreoError] = useState('');
  const codigoCorreoRef = useRef<string>('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // ─── Guardar teléfono directamente ──────────────────────────────────────────
  const handleGuardarTelefono = () => {
    setTelefonoError('');
    if (nuevoTelefono.length !== 9) {
      setTelefonoError('El celular debe tener exactamente 9 dígitos');
      return;
    }

    if (!user) return;
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.id === user.id) {
        userData.telefono = nuevoTelefono;
        localStorage.setItem('auth_user', JSON.stringify(userData));
      }
    }

    // Actualizar en mockDb
    const collections = ['users', 'ingenieros', 'postulantes'];
    for (const col of collections) {
      const arr = (db as any).db[col] as any[];
      const idx = arr.findIndex((u: any) => u.id === user.id);
      if (idx !== -1) {
        arr[idx].telefono = nuevoTelefono;
        break;
      }
    }
    db.save();

    setEditandoTelefono(false);
    setSuccess('Teléfono actualizado correctamente.');
    setTimeout(() => setSuccess(''), 4000);
  };

  // ─── Enviar código de verificación para correo ──────────────────────────────
  const handleEnviarCodigoCambioCorreo = async () => {
    setCorreoError('');
    if (!nuevoCorreo || !nuevoCorreo.includes('@') || !nuevoCorreo.includes('.')) {
      setCorreoError('Ingrese un correo electrónico válido');
      return;
    }
    if (nuevoCorreo === user?.email) {
      setCorreoError('El nuevo correo es igual al actual');
      return;
    }

    setEnviandoCodigoCorreo(true);
    const codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();
    codigoCorreoRef.current = codigoGenerado;

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          correo_destino: nuevoCorreo,
          codigo: codigoGenerado,
        },
        PUBLIC_KEY
      );
      setCorreoCodigoEnviado(true);
    } catch {
      setCorreoError('No se pudo enviar el código de verificación. Intente nuevamente.');
      codigoCorreoRef.current = '';
    } finally {
      setEnviandoCodigoCorreo(false);
    }
  };

  // ─── Verificar código y guardar correo ──────────────────────────────────────
  const handleVerificarYGuardarCorreo = () => {
    setCorreoError('');
    if (!codigoCorreoRef.current) {
      setCorreoError('Primero debe enviar el código de verificación');
      return;
    }
    if (correoCodigo !== codigoCorreoRef.current) {
      setCorreoError('Código incorrecto. Ingrese el código de 6 dígitos enviado a su nuevo correo.');
      return;
    }

    if (!user) return;
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.id === user.id) {
        userData.email = nuevoCorreo;
        localStorage.setItem('auth_user', JSON.stringify(userData));
      }
    }

    const collections = ['users', 'ingenieros', 'postulantes'];
    for (const col of collections) {
      const arr = (db as any).db[col] as any[];
      const idx = arr.findIndex((u: any) => u.id === user.id);
      if (idx !== -1) {
        arr[idx].email = nuevoCorreo;
        break;
      }
    }
    db.save();

    setEditandoCorreo(false);
    setCorreoCodigoEnviado(false);
    setCorreoCodigo('');
    codigoCorreoRef.current = '';
    setSuccess('Correo electrónico actualizado correctamente.');
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleCancelarCorreo = () => {
    setEditandoCorreo(false);
    setCorreoCodigoEnviado(false);
    setNuevoCorreo('');
    setCorreoCodigo('');
    setCorreoError('');
    codigoCorreoRef.current = '';
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) return;

    if (!passwordForm.currentPassword) {
      setError('Ingrese su contraseña actual');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }
    if (user.password !== passwordForm.currentPassword) {
      setError('La contraseña actual es incorrecta');
      return;
    }

    setLoading(true);

    try {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.id === user.id) {
          userData.password = passwordForm.newPassword;
          localStorage.setItem('auth_user', JSON.stringify(userData));
        }
      }

      const collections = ['users', 'ingenieros', 'postulantes'];
      for (const col of collections) {
        const arr = (db as any).db[col] as any[];
        const idx = arr.findIndex((u: any) => u.id === user.id);
        if (idx !== -1) {
          arr[idx].password = passwordForm.newPassword;
          break;
        }
      }
      db.save();

      setSuccess('Contraseña actualizada correctamente.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setError('Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Usuario no encontrado</p>
      </div>
    );
  }

  let ingeniero: any = null;
  if (user.rol === 'Ingeniero') {
    const anyIngeniero = user as any;
    if (anyIngeniero.cip) {
      ingeniero = user;
    } else {
      ingeniero = db.getIngenieroByEmail(user.email);
    }
  }

  let postulante: Postulante | null = null;
  if (user.rol === 'Postulante') {
    postulante = db.getAllPostulantes().find(p => p.id === user.id) || null;
  }

  const handleAutoEliminarCuenta = () => {
    if (!confirm('¿Está seguro de que desea eliminar su cuenta? Se borrarán todos los datos ingresados para que pueda realizar un nuevo registro desde cero.')) return;
    if (user) {
      db.deletePostulante(user.id);
    }
    // Eliminar sesión activa
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_user');
    // Eliminar cualquier dato temporal del flujo de registro
    const tempKeys = ['datos_registro_paso1', 'archivos_temporales', 'registro_step', 'registro_form', 'inscripcion_draft'];
    tempKeys.forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
    // Limpiar todas las claves de sessionStorage que pudieran quedar del flujo
    sessionStorage.clear();
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Mi Información
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Cambiar Contraseña
          </button>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Tab: Información Personal */}
      {activeTab === 'info' && (
        <>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Nombres Completos</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{user.nombre_completo}</p>
              </div>

              {/* Correo editable */}
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Correo Electrónico
                </p>
                {!editandoCorreo ? (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    {postulante?.estado === 'Pendiente' ? (
                      <span className="p-1 text-gray-300 cursor-not-allowed" title="No puede editar mientras su solicitud esté en revisión">
                        <Pencil className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <button
                        onClick={() => { setEditandoCorreo(true); setNuevoCorreo(user.email); }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition"
                        title="Editar correo"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={nuevoCorreo}
                        onChange={e => { setNuevoCorreo(e.target.value); setCorreoCodigoEnviado(false); setCorreoCodigo(''); codigoCorreoRef.current = ''; }}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="nuevo@email.com"
                        disabled={correoCodigoEnviado}
                      />
                      {!correoCodigoEnviado && (
                        <>
                          <button
                            onClick={handleEnviarCodigoCambioCorreo}
                            disabled={enviandoCodigoCorreo || !nuevoCorreo}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1"
                          >
                            {enviandoCodigoCorreo ? <Loader className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                            Verificar
                          </button>
                          <button onClick={handleCancelarCorreo} className="p-2 text-gray-400 hover:text-red-500 transition">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    {correoCodigoEnviado && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                        <p className="text-xs text-blue-800 font-medium">Ingrese el código de 6 dígitos enviado a {nuevoCorreo}</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={correoCodigo}
                            onChange={e => setCorreoCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            className="flex-1 px-3 py-2 text-center text-lg tracking-widest font-mono border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={handleVerificarYGuardarCorreo}
                            disabled={correoCodigo.length !== 6}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-xs font-semibold rounded-lg transition"
                          >
                            Confirmar
                          </button>
                          <button onClick={handleCancelarCorreo} className="p-2 text-gray-400 hover:text-red-500 transition">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {correoError && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {correoError}
                      </p>
                    )}
                  </div>
                )}
                {postulante?.estado === 'Pendiente' && !editandoCorreo && (
                  <p className="text-xs text-amber-600 mt-1">No puede modificar sus datos de contacto mientras su solicitud esté en proceso de revisión.</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">DNI</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{user.dni}</p>
              </div>

              {/* Teléfono editable */}
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Teléfono Celular
                </p>
                {!editandoTelefono ? (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-medium text-gray-900">{user.telefono || '—'}</p>
                    {postulante?.estado === 'Pendiente' ? (
                      <span className="p-1 text-gray-300 cursor-not-allowed" title="No puede editar mientras su solicitud esté en revisión">
                        <Pencil className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <button
                        onClick={() => { setEditandoTelefono(true); setNuevoTelefono(user.telefono || ''); }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition"
                        title="Editar teléfono"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={nuevoTelefono}
                        onChange={e => { setNuevoTelefono(e.target.value.replace(/\D/g, '').slice(0, 9)); setTelefonoError(''); }}
                        maxLength={9}
                        inputMode="numeric"
                        placeholder="999888777"
                        className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          telefonoError ? 'border-red-400' : 'border-gray-300'
                        }`}
                      />
                      <button
                        onClick={handleGuardarTelefono}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => { setEditandoTelefono(false); setTelefonoError(''); }}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {telefonoError && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {telefonoError}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">{nuevoTelefono.length}/9 dígitos</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Rol
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">{user.rol}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Fecha de Registro
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {new Date(user.created_at).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Carnet Digital (Solo Ingenieros) */}
          {ingeniero && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Carnet Digital Profesional</h3>
              <div className="flex justify-center">
                <CarnetDigital ingeniero={ingeniero} />
              </div>
            </div>
          )}

          {/* Información de Colegiatura (Solo Ingenieros) */}
          {ingeniero && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Estado de Colegiatura</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-blue-700 font-semibold uppercase">CIP</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{ingeniero.cip}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-semibold uppercase">Estado</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    ingeniero.estado === 'Hábil' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {ingeniero.estado}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-semibold uppercase">Primer Mes</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {ingeniero.primer_mes_gratis ? 'Gratis' : 'Pagado'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Postulante Pendiente */}
          {user.rol === 'Postulante' && postulante?.estado === 'Pendiente' && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Estado de Solicitud</h3>
              <p className="text-yellow-700">
                Su solicitud de inscripción está siendo revisada por el administrador.
                Recibirá una notificación una vez que sea evaluada.
              </p>
            </div>
          )}

          {/* Postulante Rechazado */}
          {user.rol === 'Postulante' && postulante?.estado === 'Rechazado' && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-red-900">Estado de Solicitud: RECHAZADA</h3>
                  <p className="text-red-700 mt-2">
                    Su solicitud de inscripción ha sido rechazada por el administrador
                    {postulante.motivoRechazo && (
                      <> debido al siguiente motivo: <span className="font-semibold">"{postulante.motivoRechazo}"</span></>
                    )}
                    .
                  </p>
                  <p className="text-red-600 text-sm mt-2">
                    Para volver a postular, debe eliminar su cuenta actual y registrarse nuevamente con los datos corregidos.
                  </p>
                </div>
              </div>
              <button
                onClick={handleAutoEliminarCuenta}
                className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition text-sm"
              >
                <Trash2 className="w-4 h-4" /> Eliminar mi cuenta y volver a postular
              </button>
            </div>
          )}
        </>
      )}

      {/* Tab: Cambiar Contraseña */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl shadow-md p-8 max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Cambiar Contraseña</h3>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Actual
              </label>
              <input
                type="password"
                id="currentPassword"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                minLength={6}
              />
              <p className="text-xs text-gray-600 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
