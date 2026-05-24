import React, { useState, useCallback, useRef } from 'react';
import { AlertCircle, Loader, CheckCircle2, Mail } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { db } from '../../services/mockDb';

// ─── CREDENCIALES EMAILJS — CANAL 1: VERIFICACIÓN ────────────────────────────
const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_VERIFICACION as string;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

const capitalizarNombres = (str: string) =>
  str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

interface FormDatosProps {
  onNext: (data: {
    nombre_completo: string;
    dni: string;
    email: string;
    telefono: string;
    password: string;
  }) => void;
  loading?: boolean;
}

export const FormDatos: React.FC<FormDatosProps> = ({ onNext, loading = false }) => {
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [dniError, setDniError] = useState('');
  const [dniDuplicado, setDniDuplicado] = useState(false);

  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [telefonoError, setTelefonoError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [correoVerificado, setCorreoVerificado] = useState(false);
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [mostrarCampoCodigo, setMostrarCampoCodigo] = useState(false);
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);

  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);

  const codigoGeneradoRef = useRef<string>('');

  const nombreCompleto = [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ');

  // ─── Consulta directa a la API de DNI ──────────────────────────────────────
  const handleDNIChange = useCallback(async (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    setDni(cleaned);
    setDniError('');
    setDniDuplicado(false);

    if (cleaned.length !== 8) {
      setNombres('');
      setApellidoPaterno('');
      setApellidoMaterno('');
      return;
    }

    // Verificar duplicado en la base de datos local
    const allIngenieros = db.getAllIngenieros();
    const allPostulantes = db.getAllPostulantes();

    const postulanteRechazado = allPostulantes.find(p => p.dni === cleaned && p.estado === 'Rechazado');
    if (postulanteRechazado) {
      setDniDuplicado(true);
      setDniError('Este DNI ya tiene una cuenta registrada bajo evaluación o rechazada. Por favor, inicie sesión en el Portal para ver los detalles y liberar sus credenciales.');
      setNombres('');
      setApellidoPaterno('');
      setApellidoMaterno('');
      return;
    }

    const yaExiste =
      allIngenieros.some(i => i.dni === cleaned) ||
      allPostulantes.some(p => p.dni === cleaned && p.estado !== 'Rechazado');
    if (yaExiste) {
      setDniDuplicado(true);
      setDniError('Este DNI ya se encuentra registrado en el sistema');
      setNombres('');
      setApellidoPaterno('');
      setApellidoMaterno('');
      return;
    }

    setFetching(true);
    try {
      const url = "https://dniruc.apisperu.com/api/v1/dni/" + cleaned + "?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImNvbnRhY3Rvc0BjcmVhdGl2YXBpeGVsLmNvbSJ9.uEn7DS4YyM1XHgOOwuhE5QWr8ZKc1diimWzvvalTNfE";
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Error HTTP');
      const data = await resp.json();

      if (data.nombres && data.apellidoPaterno) {
        setNombres(capitalizarNombres(data.nombres));
        setApellidoPaterno(capitalizarNombres(data.apellidoPaterno));
        setApellidoMaterno(capitalizarNombres(data.apellidoMaterno || ''));
      } else {
        throw new Error('Sin datos');
      }
    } catch {
      setDniError('DNI no encontrado o error de conexión');
      setNombres('');
      setApellidoPaterno('');
      setApellidoMaterno('');
    } finally {
      setFetching(false);
    }
  }, []);

  // ─── Envío real de código por EmailJS ──────────────────────────────────────
  const handleEnviarCodigo = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Ingrese un correo electrónico válido');
      return;
    }

    // Verificar correo duplicado
    const allPostulantesCorreo = db.getAllPostulantes();
    const postulanteRechazadoCorreo = allPostulantesCorreo.find(p => p.email === email && p.estado === 'Rechazado');
    if (postulanteRechazadoCorreo) {
      setError('Este DNI/Correo ya tiene una cuenta registrada bajo evaluación o rechazada. Por favor, inicie sesión en el Portal para ver los detalles y liberar sus credenciales.');
      return;
    }

    const ingenieroConCorreo = db.getAllIngenieros().some(i => i.email === email);
    const postulanteConCorreo = allPostulantesCorreo.some(p => p.email === email && p.estado !== 'Rechazado');
    if (ingenieroConCorreo || postulanteConCorreo) {
      setError('Este correo electrónico ya está en uso.');
      return;
    }

    setEnviandoCodigo(true);
    setError('');

    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    codigoGeneradoRef.current = codigo;

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          correo_destino: email,
          codigo: codigo,
        },
        PUBLIC_KEY
      );
      setMostrarCampoCodigo(true);
      setError('');
    } catch (error) {
      console.error("Error al enviar email:", error);
      setError('No se pudo enviar el correo de verificación. Intente nuevamente.');
      codigoGeneradoRef.current = '';
    } finally {
      setEnviandoCodigo(false);
    }
  };

  const handleVerificarCodigo = () => {
    setError('');
    if (!codigoGeneradoRef.current) {
      setError('Primero debe enviar el código');
      return;
    }
    if (codigoIngresado === codigoGeneradoRef.current) {
      setCorreoVerificado(true);
      setMostrarCampoCodigo(false);
      return;
    }
    setError('Código incorrecto. Ingrese el código de 6 dígitos enviado a su correo.');
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 9);
    setTelefono(val);
    if (telefonoError) setTelefonoError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (dni.length !== 8) { setError('El DNI debe tener 8 dígitos'); return; }
    if (!nombreCompleto.trim()) { setError('Ingrese sus nombres y apellidos'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) { setError('Ingrese un correo electrónico válido'); return; }
    if (!correoVerificado) { setError('Debe verificar su correo electrónico antes de continuar'); return; }
    if (telefono.length !== 9) { setTelefonoError('El celular debe tener exactamente 9 dígitos'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }

    onNext({ dni, nombre_completo: nombreCompleto, email, telefono, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* DNI */}
      <div>
        <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
          Número de DNI <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="dni"
            value={dni}
            onChange={e => handleDNIChange(e.target.value)}
            placeholder="Ingrese su DNI de 8 dígitos"
            maxLength={8}
            inputMode="numeric"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          {fetching && (
            <div className="absolute right-3 top-3.5">
              <Loader className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          )}
        </div>
        {fetching && (
          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <Loader className="w-3 h-3 animate-spin" /> Consultando RENIEC...
          </p>
        )}
        {dniError && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {dniError}
          </p>
        )}
      </div>

      {/* Nombres y Apellidos — Solo lectura, llenados por RENIEC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'nombres', label: 'Nombres', value: nombres, placeholder: 'Se autocompleta con el DNI' },
          { id: 'apellidoPaterno', label: 'Apellido Paterno', value: apellidoPaterno, placeholder: 'Se autocompleta con el DNI' },
          { id: 'apellidoMaterno', label: 'Apellido Materno', value: apellidoMaterno, placeholder: 'Se autocompleta con el DNI' },
        ].map(({ id, label, value, placeholder }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
              {label} <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id={id}
              value={value}
              readOnly
              tabIndex={-1}
              placeholder={placeholder}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-800 cursor-not-allowed"
            />
          </div>
        ))}
      </div>

      {/* Correo con verificación */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Correo Electrónico <span className="text-red-600">*</span>
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setCorreoVerificado(false);
                setMostrarCampoCodigo(false);
                setCodigoIngresado('');
                codigoGeneradoRef.current = '';
              }}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || correoVerificado}
            />
            {correoVerificado && (
              <CheckCircle2 className="absolute right-3 top-3.5 w-5 h-5 text-green-600" />
            )}
          </div>
          {!correoVerificado && !mostrarCampoCodigo && (
            <button
              type="button"
              onClick={handleEnviarCodigo}
              disabled={!email || enviandoCodigo}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition whitespace-nowrap flex items-center gap-2 text-sm"
            >
              {enviandoCodigo
                ? <><Loader className="w-4 h-4 animate-spin" /> Enviando...</>
                : <><Mail className="w-4 h-4" /> Enviar código</>
              }
            </button>
          )}
        </div>
        {correoVerificado && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Correo verificado correctamente
          </p>
        )}
      </div>

      {/* Campo de código */}
      {mostrarCampoCodigo && !correoVerificado && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 space-y-3">
          <p className="text-sm font-semibold text-blue-900">Ingrese el código de verificación</p>
          <p className="text-xs text-blue-700">
            Hemos enviado un código de 6 dígitos a <strong>{email}</strong>. Revise su bandeja de entrada y spam.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={codigoIngresado}
              onChange={e => setCodigoIngresado(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="flex-1 px-4 py-3 border border-blue-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleVerificarCodigo}
              disabled={codigoIngresado.length !== 6}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition text-sm"
            >
              Verificar
            </button>
          </div>
          <button
            type="button"
            onClick={handleEnviarCodigo}
            disabled={enviandoCodigo}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Reenviar código
          </button>
        </div>
      )}

      {/* Teléfono */}
      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
          Celular <span className="text-red-600">*</span>
        </label>
        <input
          type="tel"
          id="telefono"
          value={telefono}
          onChange={handleTelefonoChange}
          onBlur={() => {
            if (telefono && telefono.length !== 9) setTelefonoError('El celular debe tener exactamente 9 dígitos');
          }}
          placeholder="999888777"
          maxLength={9}
          inputMode="numeric"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            telefonoError ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
          disabled={loading}
        />
        <div className="flex justify-between mt-1">
          {telefonoError ? (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {telefonoError}
            </p>
          ) : (
            <p className="text-xs text-gray-400">Solo números, exactamente 9 dígitos</p>
          )}
          <p className={`text-xs ${telefono.length === 9 ? 'text-green-600' : 'text-gray-400'}`}>
            {telefono.length}/9
          </p>
        </div>
      </div>

      {/* Contraseñas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña <span className="text-red-600">*</span>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña <span className="text-red-600">*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repita la contraseña"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || dniDuplicado}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition duration-200"
      >
        {loading ? 'Guardando...' : 'Siguiente — Subir Documentos'}
      </button>
    </form>
  );
};
