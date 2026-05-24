import React from 'react';
import { Ingeniero } from '../../types';

interface CarnetDigitalProps {
  ingeniero: Ingeniero;
}

export const CarnetDigital: React.FC<CarnetDigitalProps> = ({ ingeniero }) => {
  return (
    <div className="relative inline-block">
      {/* Carnet Container */}
      <div className="relative w-80 bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-2xl overflow-hidden"
        style={{
          aspectRatio: '85/55',
          perspective: '1000px',
        }}
      >
        {/* Watermark if Inhabilitado */}
        {ingeniero.estado === 'Inhabilitado' && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            style={{
              background: 'rgba(255, 0, 0, 0.15)',
            }}
          >
            <div
              className="text-red-600 font-black text-6xl tracking-wider opacity-40"
              style={{
                transform: 'rotate(-45deg)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                letterSpacing: '0.2em',
              }}
            >
              INHABILITADO
            </div>
          </div>
        )}

        {/* Content */}
        <div className="h-full flex items-center px-6 py-4 gap-4">
          {/* Photo */}
          <div className="flex-shrink-0 w-24 h-28 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <img
              src={ingeniero.foto_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'}
              alt={ingeniero.nombre_completo}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-white">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">CIP</p>
            <p className="text-2xl font-black mb-2">{ingeniero.cip}</p>

            <p className="text-xs font-bold uppercase tracking-wider leading-tight">
              {ingeniero.nombre_completo}
            </p>

            <div className="mt-2 pt-2 border-t border-blue-700 text-xs">
              <p>
                <span className="text-blue-200">DNI:</span> {ingeniero.dni}
              </p>
              <p className={`font-semibold ${
                ingeniero.estado === 'Hábil'
                  ? 'text-green-300'
                  : 'text-red-300'
              }`}>
                {ingeniero.estado}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-blue-950 bg-opacity-80 px-6 py-2 text-xs text-blue-100 flex justify-between">
          <span>Colegio de Ingenieros del Perú</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-4 text-center">
        <span
          className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
            ingeniero.estado === 'Hábil'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {ingeniero.estado === 'Hábil' ? 'Membresía Activa' : 'Membresía Suspendida'}
        </span>
      </div>
    </div>
  );
};
