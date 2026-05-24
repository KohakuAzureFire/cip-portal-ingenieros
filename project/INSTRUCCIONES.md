# Sistema de Colegiatura - CIP (Colegio de Ingenieros del Perú)

## Descripción General

Plataforma web institucional para la gestión del sistema de colegiatura del Colegio de Ingenieros del Perú, con funcionalidades completas de:

- Inscripción de nuevos postulantes
- Gestión de solicitudes por administradores
- Padrón general de ingenieros colegiados
- Sistema de cuotas mensuales
- Carnet digital institucional con marca de inhabilitación

## Tecnologías

- **Frontend:** React 18.3, TypeScript, Vite
- **Estilos:** Tailwind CSS
- **Iconografía:** Lucide React
- **Enrutamiento:** React Router v6
- **Persistencia:** LocalStorage (MockDB) + Supabase para producción
- **Base de Datos:** PostgreSQL (Supabase)

## Estructura del Proyecto

```
src/
├── components/
│   ├── admin/              (PanelControl, PadronGeneral)
│   ├── auth/               (Login)
│   ├── common/             (DashboardLayout)
│   ├── cuotas/             (CarnetDigital)
│   └── inscripcion/        (Stepper, FormDatos, FormDocumentos, FormPago, DashboardEstado)
├── context/                (AuthContext)
├── routes/                 (PrivateRoute)
├── services/               (mockDb.ts)
├── types/                  (Interfaces globales)
├── pages/                  (Dashboard.tsx)
└── App.tsx                 (Enrutamiento principal)
```

## Usuarios de Prueba

Acceso rápido disponible en la pantalla de login:

| Email | Rol | Descripción |
|-------|-----|-------------|
| admin@cip.org.pe | Admin | Gestiona solicitudes de inscripción |
| secretaria@cip.org.pe | Secretario | Administra padrón y pagos |
| j.perez@ingenieros.pe | Ingeniero | Estado: Hábil, CIP: 00001 |
| m.lopez@ingenieros.pe | Ingeniero | Estado: Inhabilitado (3 meses deuda) |
| a.rodriguez@gmail.com | Postulante | Pendiente de aprobación |

Contraseña para todos: **pass123**

## Flujos Principales

### 1. Flujo de Inscripción (/registro)

**Paso 1: Datos Personales**
- Ingrese DNI (8 dígitos)
- El sistema consulta https://dniruc.apisperu.com/api/v1/dni/
- Si CORS falla, usa datos simulados
- Nombre completo se autocompleta

**Paso 2: Carga de Documentos**
- Fotografía (JPG/PNG, máx 5MB)
- Título Profesional (PDF, máx 5MB)

**Paso 3: Pago de Inscripción**
- Monto fijo: S/ 1,500.00
- Métodos: Tarjeta o Voucher
- Si Voucher: carga comprobante de pago

### 2. Panel del Administrador (/admin)

- Ve solicitudes pendientes de postulantes
- Revisa documentos cargados
- Botón de enlace a SUNEDU para verificación de títulos
- Acciones: Aprobar, Observar, Rechazar
- Al Aprobar: Genera CIP secuencial (5 dígitos) e ingresa primer mes gratis

### 3. Dashboard del Ingeniero (/dashboard)

- Carnet Digital (85x55mm) con:
  - Foto
  - Nombres completos
  - DNI
  - CIP de 5 dígitos
  - Marca de agua "INHABILITADO" si estado = Inhabilitado
- Tabla de cuotas mensuales
- Primer mes: Gratis (S/ 0)
- Meses siguientes: S/ 20.00 c/u
- Estado actualizable a "Inhabilitado" si tiene 3+ meses de deuda

### 4. Padrón General (/padron)

- Filtros: Todos, Hábiles, Inhabilitados
- Tabla completa de ingenieros colegiados
- Visualización de deuda por ingeniero
- Estadísticas generales

## Reglas de Negocio Implementadas

### Inscripción
- DNI debe validarse (API o simulación)
- Documentos obligatorios: Foto + Título
- Pago de inscripción: S/ 1,500.00 (único)

### Aprobación
- Admin genera CIP secuencial de 5 dígitos
- Primer mes es gratis (S/ 0)
- Estado inicial: Hábil
- Cuotas mensuales: S/ 20.00

### Mora e Inhabilitación
- 3+ meses sin pagar → Estado = Inhabilitado
- Carnet Digital muestra marca diagonal "INHABILITADO"
- Se muestra en tabla de padrón

### Cuotas Mensuales
- Generadas automáticamente por mes
- Vencimiento: 15 de cada mes
- Estados: Pendiente, Pagada, Vencida
- Deuda se calcula como suma de cuotas vencidas/pendientes

## API DNI Integration

La aplicación intenta llamar a:
```
https://dniruc.apisperu.com/api/v1/dni/{numero}?token=...
```

**En caso de error de CORS o servidor no disponible:**
- Se activa fallback silencioso con datos simulados
- Experiencia del usuario sin interrupciones

## Persistencia de Datos

**LocalStorage:**
- Clave: `colegiatura_db`
- Almacena: usuarios, ingenieros, postulantes, cuotas, pagos
- Sincronización: automática en cada cambio

**Usuario Autenticado:**
- Almacenado en: `auth_user` (localStorage)
- Validación en: AuthContext

## Rutas Protegidas

- `/dashboard` → Todos los roles autenticados
- `/admin` → Solo Admin_General
- `/padron` → Admin_General o Secretario
- `/cuotas` → Secretario, Admin_General o Ingeniero
- `/registro` → Pública

## Paleta de Colores

- **Azul Marino:** #1e3a8a (headers, primary)
- **Azul Corporativo:** #1e40af (acciones)
- **Verde:** #16a34a (éxito, cuotas pagadas)
- **Rojo:** #dc2626 (alerta, deuda)
- **Gris:** #6b7280 (textos secundarios)

## Componentes Clave

### DashboardLayout
- Sidebar responsive
- Menú contextual por rol
- Botón de logout

### CarnetDigital
- Diseño realista (85x55mm)
- Marca de agua diagonal si Inhabilitado
- Información: CIP, Nombres, DNI, Estado

### Stepper
- 3 pasos: Datos, Documentos, Pago
- Indicadores visuales de progreso
- Control de navegación

## Compilación y Despliegue

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview
npm run preview
```

## Próximas Mejoras (Supabase)

1. Migrar de localStorage a Supabase PostgreSQL
2. Integración con Auth de Supabase
3. Almacenamiento de archivos en Supabase Storage
4. Edge Functions para lógica de backend
5. Row Level Security para datos

## Notas Técnicas

- TypeScript en modo strict
- Componentes funcionales con Hooks
- Context API para estado global
- Tailwind CSS para styling
- Responsive design (mobile-first)
- Sin dependencias de UI adicionales

## Testing

La aplicación viene con 5 usuarios de demostración precargados en `mockDb.ts` con escenarios realistas para pruebas completas de todos los flujos.
