/*
  # Schema Colegiatura - CIP (Sistema de Colegiatura del Colegio de Ingenieros)

  This is a reference schema for future Supabase integration.
  Currently the app uses localStorage mockDb for data persistence.

  1. Users Table
    - Integrated with Supabase Auth
    - Extended user profile information

  2. Ingenieros Table
    - Records for all registered engineers
    - CIP (Número de Colegiado) assignment
    - Habilitación status

  3. Postulantes Table
    - Registration requests in process
    - Document tracking

  4. Cuotas Table
    - Monthly membership fees
    - Payment status tracking

  5. Pagos Table
    - Payment records
    - Receipt tracking

  6. Documentos Table
    - Uploaded files tracking
    - Title verification links

  Security: All tables have RLS enabled
*/

-- Create Users Extension Profile
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nombre_completo TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  telefono TEXT,
  rol TEXT NOT NULL DEFAULT 'Postulante' CHECK (rol IN ('Admin_General', 'Secretario', 'Ingeniero', 'Postulante')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ingenieros Table
CREATE TABLE IF NOT EXISTS ingenieros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  cip TEXT UNIQUE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Hábil' CHECK (estado IN ('Hábil', 'Inhabilitado')),
  foto_url TEXT,
  titulo_profesional_url TEXT,
  primer_mes_gratis BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Postulantes Table
CREATE TABLE IF NOT EXISTS postulantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Aprobado', 'Rechazado')),
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documentos Table
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  postulante_id UUID NOT NULL REFERENCES postulantes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('foto', 'titulo_profesional')),
  url TEXT NOT NULL,
  nombre_archivo TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Cuotas Table
CREATE TABLE IF NOT EXISTS cuotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingeniero_cip TEXT NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  año INTEGER NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'vencida')),
  fecha_vencimiento TIMESTAMPTZ NOT NULL,
  fecha_pago TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ingeniero_cip, mes, año),
  FOREIGN KEY (ingeniero_cip) REFERENCES ingenieros(cip) ON DELETE CASCADE
);

-- Pagos Table
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ingeniero_cip TEXT REFERENCES ingenieros(cip) ON DELETE SET NULL,
  cuota_id UUID REFERENCES cuotas(id) ON DELETE SET NULL,
  monto DECIMAL(10, 2) NOT NULL,
  metodo TEXT NOT NULL CHECK (metodo IN ('tarjeta', 'voucher')),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'rechazado')),
  comprobante_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ingenieros_cip ON ingenieros(cip);
CREATE INDEX IF NOT EXISTS idx_ingenieros_user_id ON ingenieros(user_id);
CREATE INDEX IF NOT EXISTS idx_postulantes_user_id ON postulantes(user_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_cip_mes_año ON cuotas(ingeniero_cip, mes, año);
CREATE INDEX IF NOT EXISTS idx_pagos_user_id ON pagos(user_id);
CREATE INDEX IF NOT EXISTS idx_pagos_ingeniero_cip ON pagos(ingeniero_cip);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingenieros ENABLE ROW LEVEL SECURITY;
ALTER TABLE postulantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND rol = 'Admin_General'
    )
  );

-- Policies for ingenieros
CREATE POLICY "Engineers can view own data"
  ON ingenieros FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all engineers"
  ON ingenieros FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND rol IN ('Admin_General', 'Secretario')
    )
  );

-- Policies for cuotas
CREATE POLICY "Engineers can view own quotas"
  ON cuotas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ingenieros i
      JOIN user_profiles up ON i.user_id = up.id
      WHERE up.id = auth.uid() AND i.cip = cuotas.ingeniero_cip
    )
  );

CREATE POLICY "Admins and secretaries can view all quotas"
  ON cuotas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND rol IN ('Admin_General', 'Secretario')
    )
  );

-- Policies for pagos
CREATE POLICY "Users can view own payments"
  ON pagos FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
  ON pagos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND rol IN ('Admin_General', 'Secretario')
    )
  );
