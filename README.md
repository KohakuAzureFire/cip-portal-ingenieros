# Portal CIP – Registro de Ingenieros (MVP)

## Descripción del proyecto

Portal CIP es una aplicación web desarrollada con **React 18 + TypeScript + Vite** que gestiona el proceso de colegiación de ingenieros en el **Colegio de Ingenieros del Perú (CIP)**. Cubre el flujo completo: desde la solicitud de inscripción del postulante hasta la emisión del carnet digital de colegiado.

---

## Características principales

- Registro de postulantes en tres pasos: datos personales, documentación y pago de inscripción (S/ 1,500.00).
- Verificación de correo electrónico con código de 6 dígitos via **EmailJS**.
- Consulta automática de datos personales por DNI vía **API RENIEC (apiспeru)**.
- Panel de administración para aprobar o rechazar solicitudes, con envío automático de correo al postulante.
- Número de colegiado (CIP) siempre de **5 dígitos** (`00001`, `00002`, …), correlativo y sin repetición.
- Carnet digital con marca de agua **"INHABILITADO"** cuando el ingeniero tiene cuotas vencidas.
- Gestión de cuotas mensuales: primer mes gratuito, S/ 20.00 a partir del segundo mes.
- Roles diferenciados: Admin General, Secretario, Postulante e Ingeniero Colegiado.
- Persistencia en **localStorage** (mock DB), lista para migrar a Bolt Database.

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18 o superior |
| npm | 9 o superior |

---

## Cómo levantar el proyecto

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd portal-cip

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con las credenciales de Bolt Database

# 4. Iniciar el servidor de desarrollo
npm run dev   # disponible en http://localhost:5173
```

---

## Estructura del proyecto

portal-cip/
├─ src/
│   ├─ components/
│   │   ├─ admin/        # PanelControl, PadronGeneral
│   │   ├─ auth/         # Login
│   │   ├─ common/       # DashboardLayout, PerfilIngeniero
│   │   ├─ cuotas/       # EstadoCuenta, CarnetDigital
│   │   └─ inscripcion/  # FormDatos, FormDocumentos, FormPago, Stepper, DashboardEstado
│   ├─ context/          # AuthContext (sesión y autenticación)
│   ├─ routes/           # PrivateRoute (guard de rutas por rol)
│   ├─ services/         # mockDb (persistencia en localStorage)
│   ├─ types/            # Interfaces globales (User, Ingeniero, Postulante, Cuota)
│   ├─ App.tsx           # Enrutador principal
│   └─ main.tsx          # Punto de entrada
├─ .env.example
├─ vite.config.ts
├─ tsconfig.app.json
└─ package.json
