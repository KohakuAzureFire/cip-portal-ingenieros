export type UserRole = 'Admin_General' | 'Secretario' | 'Ingeniero' | 'Postulante';
export type IngenieroCIPStatus = 'Hábil' | 'Inhabilitado';
export type PostulanteStatus = 'Pendiente' | 'Aprobado' | 'Rechazado';
export type DocumentType = 'foto' | 'titulo_profesional';
export type PaymentMethod = 'tarjeta' | 'voucher';
export type CuotaEstado = 'pendiente' | 'pagada' | 'vencida' | 'pendiente_validacion' | 'rechazado';

export interface User {
  id: string;
  email: string;
  password: string;
  nombre_completo: string;
  dni: string;
  rol: UserRole;
  telefono?: string;
  created_at: string;
  updated_at: string;
}

export interface Ingeniero extends User {
  cip: string | null;
  estado: IngenieroCIPStatus;
  foto_url?: string;
  titulo_profesional_url?: string;
  primer_mes_gratis: boolean;
}

export interface Postulante extends User {
  estado: PostulanteStatus;
  motivoRechazo?: string;
  documentos: UploadedDocument[];
  pago_inscripcion?: Pago;
}

export interface UploadedDocument {
  id: string;
  tipo: DocumentType;
  url: string;
  nombre_archivo: string;
  uploaded_at: string;
}

export interface Solicitud {
  id: string;
  user_id: string;
  user_data: Postulante;
  estado: PostulanteStatus;
  documentos: UploadedDocument[];
  observaciones?: string;
  cip_asignado?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface Cuota {
  id: string;
  ingeniero_cip: string;
  mes: number;
  año: number;
  monto: number;
  estado: CuotaEstado;
  fecha_vencimiento: string;
  fecha_pago?: string;
  voucher_url?: string;
  created_at: string;
}

export interface Pago {
  id: string;
  user_id?: string;
  ingeniero_cip?: string;
  cuota_id?: string;
  monto: number;
  metodo: PaymentMethod;
  estado: 'pendiente' | 'confirmado' | 'rechazado';
  comprobante_url?: string;
  created_at: string;
  processed_at?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  canAccess: (requiredRole: UserRole | UserRole[]) => boolean;
}
