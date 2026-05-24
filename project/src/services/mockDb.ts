import { User, Ingeniero, Postulante, Cuota, CuotaEstado, UploadedDocument } from '../types';

const STORAGE_KEY = 'colegiatura_cip_db';
const SCHEMA_VERSION = 5; // Incrementar cada vez que cambie la estructura inicial

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// Genera cuotas completas enero–mayo 2026 para un CIP dado
const buildCuotas2026 = (
  cip: string,
  estadosPorMes: CuotaEstado[],
  montos: number[],
): Cuota[] => {
  return [1, 2, 3, 4, 5].map((mes, i) => ({
    id: `cuota-${cip}-${mes}`,
    ingeniero_cip: cip,
    mes,
    año: 2026,
    monto: montos[i],
    estado: estadosPorMes[i],
    fecha_vencimiento: new Date(2026, mes - 1, 15).toISOString(),
    fecha_pago: estadosPorMes[i] === 'pagada' ? new Date(2026, mes - 1, 10).toISOString() : undefined,
    created_at: new Date(2026, mes - 1, 1).toISOString(),
  }));
};

const getInitialDB = () => {
  return {
    users: [
      {
        id: 'admin-001',
        email: 'admin@cip.org.pe',
        password: 'pass123',
        nombre_completo: 'Carlos Ramírez Huanca',
        dni: '41523687',
        rol: 'Admin_General' as const,
        telefono: '999001001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'secretaria-001',
        email: 'secretaria@cip.org.pe',
        password: 'pass123',
        nombre_completo: 'María García López',
        dni: '47832156',
        rol: 'Secretario' as const,
        telefono: '998002002',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ] as User[],
    ingenieros: [
      {
        id: 'ing-habil-001',
        email: 'j.perez@ingenieros.pe',
        password: 'pass123',
        nombre_completo: 'Juan Carlos Pérez Rodríguez',
        dni: '73841290',
        rol: 'Ingeniero' as const,
        telefono: '987654321',
        cip: '00001',
        estado: 'Hábil' as const,
        foto_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        titulo_profesional_url: '',
        primer_mes_gratis: true,
        created_at: new Date(2026, 0, 1).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'ing-inhabilitado-001',
        email: 'm.lopez@ingenieros.pe',
        password: 'pass123',
        nombre_completo: 'María Elena López Martínez',
        dni: '62957413',
        rol: 'Ingeniero' as const,
        telefono: '986543210',
        cip: '00002',
        estado: 'Inhabilitado' as const,
        foto_url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
        titulo_profesional_url: '',
        primer_mes_gratis: true,
        created_at: new Date(2026, 0, 1).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'ing-habil-002',
        email: 'r.torres@ingenieros.pe',
        password: 'pass123',
        nombre_completo: 'Roberto Torres Sánchez',
        dni: '58319047',
        rol: 'Ingeniero' as const,
        telefono: '985432109',
        cip: '00003',
        estado: 'Hábil' as const,
        foto_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
        titulo_profesional_url: '',
        primer_mes_gratis: true,
        created_at: new Date(2026, 0, 1).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ] as Ingeniero[],
    postulantes: [] as Postulante[],
    cuotas: [
      // CIP 00001 — Juan Pérez — al día (Enero gratis, Feb-May pagadas)
      ...buildCuotas2026('00001',
        ['pagada', 'pagada', 'pagada', 'pagada', 'pendiente'],
        [0, 20, 20, 20, 20]
      ),
      // CIP 00002 — María López — inhabilitada (Enero gratis, Feb-Abr vencidas, May pendiente)
      ...buildCuotas2026('00002',
        ['pagada', 'vencida', 'vencida', 'vencida', 'pendiente'],
        [0, 20, 20, 20, 20]
      ),
      // CIP 00003 — Roberto Torres — pagó hasta Marzo, Abril pendiente validación, Mayo pendiente
      ...buildCuotas2026('00003',
        ['pagada', 'pagada', 'pagada', 'pendiente_validacion', 'pendiente'],
        [0, 20, 20, 20, 20]
      ),
    ] as Cuota[],
  };
};

export class MockDatabase {
  db: any;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const isValid =
          parsed &&
          Array.isArray(parsed.users) &&
          Array.isArray(parsed.ingenieros) &&
          Array.isArray(parsed.postulantes) &&
          Array.isArray(parsed.cuotas) &&
          parsed._version === SCHEMA_VERSION;

        if (isValid) {
          this.db = parsed;
        } else {
          // Schema obsoleto o inválido — reset forzado
          this.db = getInitialDB();
          this.save();
        }
      } catch {
        this.db = getInitialDB();
        this.save();
      }
    } else {
      this.db = getInitialDB();
      this.save();
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...this.db, _version: SCHEMA_VERSION }));
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────
  authenticateUser(email: string, password: string): User | Ingeniero | Postulante | null {
    const user = this.db.users.find((u: User) => u.email === email && u.password === password);
    if (user) return user;
    const ingeniero = this.db.ingenieros.find((i: Ingeniero) => i.email === email && i.password === password);
    if (ingeniero) return ingeniero;
    const postulante = this.db.postulantes.find((p: Postulante) => p.email === email && p.password === password);
    if (postulante) return postulante;
    return null;
  }

  getUserById(id: string): User | Ingeniero | Postulante | null {
    return this.db.users.find((u: User) => u.id === id) ||
           this.db.ingenieros.find((i: Ingeniero) => i.id === id) ||
           this.db.postulantes.find((p: Postulante) => p.id === id) || null;
  }

  getUserByEmail(email: string): User | Ingeniero | Postulante | null {
    return this.db.users.find((u: User) => u.email === email) ||
           this.db.ingenieros.find((i: Ingeniero) => i.email === email) ||
           this.db.postulantes.find((p: Postulante) => p.email === email) || null;
  }

  createUser(data: Partial<User>): User {
    const user: User = {
      id: `user-${Date.now()}`,
      email: data.email || '',
      password: data.password || '',
      nombre_completo: data.nombre_completo || '',
      dni: data.dni || '',
      rol: data.rol || 'Postulante',
      telefono: data.telefono,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.db.users.push(user);
    this.save();
    return user;
  }

  // ─── Postulantes ───────────────────────────────────────────────────────────
  createPostulante(data: Partial<Postulante> & {
    email: string;
    password: string;
    nombre_completo: string;
    dni: string;
    documentos: UploadedDocument[];
  }): Postulante {
    const postulante: Postulante = {
      id: data.id || `postulante-${Date.now()}`,
      email: data.email,
      password: data.password,
      nombre_completo: data.nombre_completo,
      dni: data.dni,
      rol: 'Postulante',
      telefono: data.telefono,
      estado: data.estado || 'Pendiente',
      documentos: data.documentos,
      pago_inscripcion: data.pago_inscripcion,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    };
    this.db.postulantes.push(postulante);
    this.save();
    return postulante;
  }

  getAllPostulantes(): Postulante[] {
    return this.db.postulantes;
  }

  getPostulanteById(id: string): Postulante | null {
    return this.db.postulantes.find((p: Postulante) => p.id === id) || null;
  }

  updatePostulante(id: string, updates: Partial<Postulante>): Postulante | null {
    const postulante = this.db.postulantes.find((p: Postulante) => p.id === id);
    if (!postulante) return null;
    Object.assign(postulante, updates, { updated_at: new Date().toISOString() });
    this.save();
    return postulante;
  }

  deletePostulante(id: string): void {
    this.db.postulantes = this.db.postulantes.filter((p: Postulante) => p.id !== id);
    this.save();
  }

  // ─── Ingenieros ────────────────────────────────────────────────────────────
  createIngeniero(postulante: Postulante, cip: string, fotoUrl?: string, tituloUrl?: string): Ingeniero {
    const ingeniero: Ingeniero = {
      ...postulante,
      id: `ing-${Date.now()}`,
      rol: 'Ingeniero',
      cip,
      estado: 'Hábil',
      foto_url: fotoUrl || postulante.documentos.find(d => d.tipo === 'foto')?.url,
      titulo_profesional_url: tituloUrl || postulante.documentos.find(d => d.tipo === 'titulo_profesional')?.url,
      primer_mes_gratis: true,
      updated_at: new Date().toISOString(),
    };
    this.db.ingenieros.push(ingeniero);
    this.save();
    return ingeniero;
  }

  getAllIngenieros(): Ingeniero[] {
    return this.db.ingenieros;
  }

  getIngenieroById(id: string): Ingeniero | null {
    return this.db.ingenieros.find((i: Ingeniero) => i.id === id) || null;
  }

  getIngenieroByCIP(cip: string): Ingeniero | null {
    return this.db.ingenieros.find((i: Ingeniero) => i.cip === cip) || null;
  }

  getIngenieroByEmail(email: string): Ingeniero | null {
    return this.db.ingenieros.find((i: Ingeniero) => i.email === email) || null;
  }

  updateIngeniero(id: string, updates: Partial<Ingeniero>): Ingeniero | null {
    const ing = this.db.ingenieros.find((i: Ingeniero) => i.id === id);
    if (!ing) return null;
    Object.assign(ing, updates, { updated_at: new Date().toISOString() });
    this.save();
    return ing;
  }

  deleteIngeniero(id: string): void {
    const ing = this.db.ingenieros.find((i: Ingeniero) => i.id === id);
    if (ing?.cip) {
      this.db.cuotas = this.db.cuotas.filter((c: Cuota) => c.ingeniero_cip !== ing.cip);
    }
    this.db.ingenieros = this.db.ingenieros.filter((i: Ingeniero) => i.id !== id);
    this.save();
  }

  // ─── Cuotas ────────────────────────────────────────────────────────────────
  getIngenieroCuotas(cip: string): Cuota[] {
    return this.db.cuotas
      .filter((c: Cuota) => c.ingeniero_cip === cip)
      .sort((a: Cuota, b: Cuota) => a.mes - b.mes);
  }

  createCuota(cuota: Cuota): Cuota {
    this.db.cuotas.push(cuota);
    this.save();
    return cuota;
  }

  updateCuota(id: string, updates: Partial<Cuota>): Cuota | null {
    const cuota = this.db.cuotas.find((c: Cuota) => c.id === id);
    if (!cuota) return null;
    Object.assign(cuota, updates);
    this.save();
    return cuota;
  }

  // Sube voucher y pone la cuota en pendiente_validacion
  subirVoucherCuota(id: string, voucherUrl: string): Cuota | null {
    return this.updateCuota(id, {
      estado: 'pendiente_validacion',
      voucher_url: voucherUrl,
    });
  }

  // Admin aprueba el pago de una cuota
  aprobarCuota(id: string): Cuota | null {
    const cuota = this.updateCuota(id, {
      estado: 'pagada',
      fecha_pago: new Date().toISOString(),
    });
    if (cuota) this.actualizarEstadoIngeniero(cuota.ingeniero_cip);
    return cuota;
  }

  // Admin rechaza el voucher — estado pasa a 'rechazado', el ingeniero debe resubir
  rechazarCuota(id: string): Cuota | null {
    return this.updateCuota(id, {
      estado: 'rechazado',
      voucher_url: undefined,
    });
  }

  // Revisa si el ingeniero quedó al día y lo habilita automáticamente
  private actualizarEstadoIngeniero(cip: string): void {
    const ingeniero = this.getIngenieroByCIP(cip);
    if (!ingeniero) return;
    const cuotas = this.getIngenieroCuotas(cip);
    const tieneDeuda = cuotas.some(
      c => c.estado === 'vencida' || c.estado === 'pendiente_validacion' || c.estado === 'rechazado'
    );
    if (!tieneDeuda && ingeniero.estado === 'Inhabilitado') {
      this.updateIngeniero(ingeniero.id, { estado: 'Hábil' });
    }
  }

  // Todas las cuotas en pendiente_validacion (para la bandeja de admin)
  getCuotasPendientesValidacion(): Array<Cuota & { ingeniero: Ingeniero | null }> {
    return this.db.cuotas
      .filter((c: Cuota) => c.estado === 'pendiente_validacion')
      .map((c: Cuota) => ({
        ...c,
        ingeniero: this.getIngenieroByCIP(c.ingeniero_cip),
      }));
  }

  // ─── CIP Generation ────────────────────────────────────────────────────────
  generateNextCIP(): string {
    const usedCIPs = this.db.ingenieros
      .map((i: Ingeniero) => i.cip)
      .filter(Boolean)
      .map((cip: string) => parseInt(cip, 10));
    const maxCIP = usedCIPs.length > 0 ? Math.max(...usedCIPs) : 0;
    return String(maxCIP + 1).padStart(5, '0');
  }

  // ─── Reset ─────────────────────────────────────────────────────────────────
  resetDatabase(): void {
    this.db = getInitialDB();
    this.save();
  }

  getSchemaVersion(): number {
    return SCHEMA_VERSION;
  }
}

export const db = new MockDatabase();
export { MESES };
