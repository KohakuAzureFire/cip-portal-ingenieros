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

## Instrucciones de Instalación y Despliegue Local

Sigue estos pasos en tu terminal para clonar el proyecto, instalar sus dependencias y levantar el servidor de desarrollo correctamente:

```bash
# 1. Clonar el repositorio en tu computadora
git clone [https://github.com/KohakuAzureFire/cip-portal-ingenieros.git](https://github.com/KohakuAzureFire/cip-portal-ingenieros.git)

# 2. Entrar a la carpeta del repositorio y luego al directorio del proyecto
cd cip-portal-ingenieros
cd project

# 3. Instalar todos los módulos y dependencias de Node.js
npm install

# 4. Iniciar el servidor de desarrollo local
npm run dev
```

---

## Estructura del proyecto

```bash
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
```

---

## Roles del Sistema

| Rol | Acceso y Permisos |
| :--- | :--- |
| **Admin General** | Panel de control total, padrón de ingenieros, gestión y auditoría de cuotas. |
| **Secretario** | Bandeja de solicitudes de inscripción, revisión, aprobación y rechazo. |
| **Postulante** | Formulario de inscripción en 3 pasos, consulta en tiempo real del estado de solicitud. |
| **Ingeniero** | Acceso a perfil personal, estado de cuenta actualizado y visualización de carné digital. |

---

## Flujo de Inscripción y Ciclo de Vida

1. **Registro Inicial:** El postulante completa los 3 pasos esenciales: Datos personales (DNI + verificación por correo), carga de documentos (Foto personal, Título profesional en PDF, Voucher de pago de S/ 1,500) y confirmación de envío.
2. **Evaluación:** La secretaría revisa minuciosamente la solicitud en el panel de administración.
3. **Rechazo con Feedback:** Si algún documento es incorrecto o inválido, la solicitud se rechaza ingresando un motivo obligatorio, lo que bloquea y oculta el panel del postulante permitiéndole únicamente auto-eliminar su intento para liberar sus credenciales y re-postular con datos corregidos.
4. **Aprobación y Colegiatura:** Al aprobar la solicitud, el sistema genera de forma automática un número CIP único de 5 dígitos y emite el carné digital oficial.
5. **Esquema de Cuotas:** El primer mes de colegiatura es completamente gratuito. A partir del segundo mes, la cuota ordinaria es de `S/ 20.00/mes`.
6. **Control de Habilidad:** Si el ingeniero acumula deudas fuera del mes correspondiente, su estado cambia automáticamente a **Inhabilitado** y el carné digital mostrará una marca de agua restrictiva.

---

## Cuentas de Prueba (Credenciales)

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Admin General** | `admin@cip.org.pe` | `pass123` |
| **Secretario** | `secretaria@cip.org.pe` | `pass123` |
| **Ingeniero Hábil** | `j.perez@ingenieros.pe` | `pass123` |
| **Ingeniero Inhabilitado** | `m.lopez@ingenieros.pe` | `pass123` |

---

## Scripts Disponibles

En la raíz del directorio `/project`, puedes ejecutar los siguientes comandos de entorno:

```bash
npm run dev       # Levanta el servidor de desarrollo local con hot-reload
npm run build     # Compila y optimiza la aplicación para producción
npm run lint      # Ejecuta el análisis estático de código con ESLint
npm run preview   # Previsualiza localmente el build de producción generado
npm run typecheck # Corre la verificación de tipos estáticos de TypeScript
