import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Image, FileText } from 'lucide-react';
import { UploadedDocument } from '../../types';

interface FormDocumentosProps {
  onNext: (documents: UploadedDocument[]) => void;
  onBack: () => void;
  loading?: boolean;
}

export const FormDocumentos: React.FC<FormDocumentosProps> = ({
  onNext,
  onBack,
  loading = false,
}) => {
  const [foto, setFoto] = useState<UploadedDocument | null>(null);
  const [titulo, setTitulo] = useState<UploadedDocument | null>(null);
  const [error, setError] = useState('');

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'foto' | 'titulo_profesional'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo no debe exceder 5MB');
      return;
    }

    const allowedFormats = type === 'foto' ? ['image/jpeg', 'image/png'] : ['application/pdf'];
    if (!allowedFormats.includes(file.type)) {
      setError(
        `Formato inválido. Se esperaba ${type === 'foto' ? 'imagen (JPG/PNG)' : 'PDF'}`
      );
      return;
    }

    setError('');

    if (type === 'foto') {
      const objectUrl = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        if (img.width !== 512 || img.height !== 512) {
          setError(`La fotografía debe medir exactamente 512x512 píxeles. Su imagen mide ${img.width}x${img.height}. Por favor, redimensiónela.`);
          setFoto(null);
          URL.revokeObjectURL(objectUrl);
          e.target.value = '';
          return;
        }
        const document: UploadedDocument = {
          id: `doc-${Date.now()}`,
          tipo: type,
          url: objectUrl,
          nombre_archivo: file.name,
          uploaded_at: new Date().toISOString(),
        };
        setFoto(document);
      };
      img.src = objectUrl;
    } else {
      const document: UploadedDocument = {
        id: `doc-${Date.now()}`,
        tipo: type,
        url: URL.createObjectURL(file),
        nombre_archivo: file.name,
        uploaded_at: new Date().toISOString(),
      };
      setTitulo(document);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!foto || !titulo) {
      setError('Debe cargar ambos documentos');
      return;
    }

    onNext([foto, titulo]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fotografía */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
          Fotografía (JPG o PNG) <span className="text-red-600">*</span>
        </label>

        {foto ? (
          <div className="w-full flex items-center gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-green-900 truncate">{foto.nombre_archivo}</p>
              <p className="text-sm text-green-700">Archivo cargado correctamente</p>
            </div>
            <button
              type="button"
              onClick={() => setFoto(null)}
              className="p-2 hover:bg-green-100 rounded-lg transition flex-shrink-0"
            >
              <X className="w-5 h-5 text-green-600" />
            </button>
          </div>
        ) : (
          <label className="w-full flex flex-col items-center justify-center px-6 py-10 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <Image className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700">Haz clic para cargar tu fotografía</p>
            <p className="text-xs text-gray-500 mt-1">Tamaño pasaporte (proporción cuadrada 1:1, ej. 512x512) - Máximo 5MB</p>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => handleFileUpload(e, 'foto')}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Título Profesional */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
          Título Profesional (PDF) <span className="text-red-600">*</span>
        </label>

        {titulo ? (
          <div className="w-full flex items-center gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-green-900 truncate">{titulo.nombre_archivo}</p>
              <p className="text-sm text-green-700">Archivo cargado correctamente</p>
            </div>
            <button
              type="button"
              onClick={() => setTitulo(null)}
              className="p-2 hover:bg-green-100 rounded-lg transition flex-shrink-0"
            >
              <X className="w-5 h-5 text-green-600" />
            </button>
          </div>
        ) : (
          <label className="w-full flex flex-col items-center justify-center px-6 py-10 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <FileText className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700">Haz clic para cargar el PDF del título</p>
            <p className="text-xs text-gray-500 mt-1">Archivo PDF - Máximo 5MB</p>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileUpload(e, 'titulo_profesional')}
              className="hidden"
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
          disabled={loading || !foto || !titulo}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          {loading ? 'Guardando...' : 'Siguiente — Realizar Pago'}
        </button>
      </div>
    </form>
  );
};
