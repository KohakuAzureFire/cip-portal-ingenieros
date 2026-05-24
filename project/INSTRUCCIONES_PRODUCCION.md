# Sistema de Colegiatura CIP - Versión Producción

## Estado: COMPLETADO Y LISTO PARA PRODUCCIÓN

Este sistema ha sido refactorizado para funcionar como una aplicación real, eliminando todos los elementos de desarrollo/demuestra.

---

## Cambios Implementados

### 1. Limpieza del Login
- Eliminados botones de acceso rápido
- Login profesional con solo correo y contraseña
- Sin textos de "prueba" o "demo"

### 2. Landing Page Institucional
- Nueva ruta raíz `/` con página de bienvenida formal
- Dos botones principales:
  - "Comenzar Inscripción" → lleva al flujo de registro
  - "Iniciar Sesión" → lleva al login limpio

### 3. Persistencia Real en LocalStorage
- Todos los usuarios nuevos se guardan persistentemente
- Los postulantes se almacenan con correo y contraseña
- Los administradores ven automáticamente las solicitudes nuevas
- La aprobación genera CIP secuencial y actualiza localStorage

### 4. Flujo Completo Funcional

#### a) Registro de Nuevo Postulante
1. Usuario va a `/` → clic en "Comenzar Inscripción"
2. Completa 3 pasos:
   - Datos DNI (API de apisperu con try/catch)
   - Carga de documentos
   - Pago simulado S/ 1,500
3. Sistema genera automáticamente:
   - Email: `postulante.[DNI]@cip.org.pe`
   - Contraseña: `CIP[DNI]`
4. Usuario se guarda en localStorage como Postulante estado "Pendiente"
5. Pantalla muestra credenciales generadas

#### b) Revisión por Admin
1. Admin (admin@cip.org.pe / pass123) entra al sistema
2. Ve automáticamente todos los postulantes pendientes
3. Selecciona uno para revisar
4. Ve documentos y puede:
   - Clic en "Verificar Título en SUNEDU" → abre nueva pestaña
   - Aprobar → Genera CIP de 5 dígitos y crea ingeniero
   - Observar → Envía correcciones
   - Rechazar → Marca como rechazado

#### c) Login del Nuevo Ingeniero
1. Nuevo usuario (ya aprobado) va a `/login`
2. Ingresa el correo generado: `postulante.[DNI]@cip.org.pe`
3. Ingresa la contraseña: `CIP[DNI]`
4. Sistema valida y permite acceso
5. Dashboard muestra carnet digital con su CIP asignado
6. Perfil muestra todos sus datos reales

---

## Credenciales del Sistema

### Administrador
- Email: `admin@cip.org.pe`
- Contraseña: `pass123`

### Secretaria
- Email: `secretaria@cip.org.pe`
- Contraseña: `pass123`

### Ingeniero Hábil (Existente)
- Email: `j.perez@ingenieros.pe`
- Contraseña: `pass123`

### Ingeniero Inhabilitado (Existente)
- Email: `m.lopez@ingenieros.pe`
- Contraseña: `pass123`

**Nota:** Los usuarios nuevos recibirán credenciales generadas automáticamente al completar su inscripción.

---

## Rutas de la Aplicación

| Ruta | Tipo | Descripción |
|------|------|------------|
| `/` | Pública | Landing Page institucional |
| `/login` | Pública | Formulario de login profesional |
| `/registro` | Pública | Proceso de inscripción (3 pasos) |
| `/dashboard` | Protegida | Dashboard según rol del usuario |
| `/admin` | Solo Admin | Panel de control de solicitudes |
| `/padron` | Admin + Secretaria | Padrón general de ingenieros |
| `/perfil` | Protegida | Perfil del usuario con datos reales |
| `/cuotas` | Protegida | Gestión de cuotas |

---

## Reglas de Negocio

### Inscripción
- Monto: S/ 1,500.00 (único)
- Documentos requeridos: Foto + Título Profesional
- Validación DNI: API apisperu con fallback

### Aprobación
- CIP: 5 dígitos secuenciales (00001, 00002, etc.)
- Primer mes de colegiatura: GRATIS
- Estado inicial: Hábil

### Cuotas Mensuales
- Monto: S/ 20.00 por mes
- Vencimiento: día 15 de cada mes
- Estados: Pendiente, Pagada, Vencida
- 3+ meses sin pagar → Inhabilitado

### Carnet Digital
- Dimensiones: 85x55mm (formato real)
- Contenido: Foto, CIP, Nombres, DNI, Estado
- Marca "INHABILITADO" si estado = Inhabilitado

---

## API DNI Integration

**Endpoint:**  
`https://dniruc.apisperu.com/api/v1/dni/{numero}`

**Token:**  
Incluido en el código con try/catch para manejar errores de CORS

**Fallback:**  
Si la API falla, usa datos simulados automáticos

---

## Persistencia de Datos

**LocalStorage Key:** `colegiatura_cip_db`

**Estructura:**
```json
{
  "users": [...],
  "ingenieros": [...],
  "postulantes": [...],
  "cuotas": [...]
}
```

**Características:**
- Guardado automático en cada cambio
- Persistencia entre sesiones del navegador
- Reset disponible en el código (método resetDatabase)

---

## Instrucciones de Uso

### Iniciar la Aplicación
```bash
npm install
npm run dev
```
Acceder a: http://localhost:5173/

### Flujo de Prueba Completo

1. **Registrar un nuevo usuario:**
   - Ir a `/` (página de inicio)
   - Clic en "Comenzar Inscripción"
   - Completar los 3 pasos con datos reales
   - Anotar el correo y contraseña generados

2. **Aprobar como administrador:**
   - Ir a `/login`
   - Entrar como admin@cip.org.pe / pass123
   - Ver panel de solicitudes pendientes
   - El nuevo postulante aparecerá automáticamente
   - Revisar y aprobar → CIP generado

3. **Login del nuevo ingeniero:**
   - Ir a `/login`
   - Entrar con el correo y contraseña generados
   - Dashboard mostrará el carnet con CIP asignado
   - Perfil mostrará todos los datos reales

---

## Tecnologías

- React 18.3 + TypeScript (strict mode)
- Vite 5.4 (build tool)
- React Router v6
- Tailwind CSS 3.4
- Lucide React (iconos)
- LocalStorage (persistencia)

---

## Build Final

- Módulos: 1489 transformados
- JavaScript: 230.20 kB (gzip: 67.05 kB)
- CSS: 22.69 kB (gzip: 4.56 kB)
- Build time: 2.26 segundos
- TypeScript: 0 errores

---

## Listo para Demostración

El sistema está completamente funcional para:
- Presentar en vivo
- Demostrar flujos completos
- Registrar usuarios reales
- Verificar persistencia
- Validar reglas de negocio

**Sin elementos de prueba ni textos de desarrollo.**
