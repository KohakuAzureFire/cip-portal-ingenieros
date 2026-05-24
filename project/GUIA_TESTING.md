# Guía de Testing - Sistema de Colegiatura CIP

## Iniciando la Aplicación

```bash
npm install
npm run dev
```

Acceso: http://localhost:5173/login

---

## Flujo 1: Ingreso como Administrador

### Objetivo
Revisar una solicitud de postulante, verificar documentos y generar CIP.

### Pasos

1. **Login**
   - Email: `admin@cip.org.pe`
   - Contraseña: `pass123`
   - O clic en botón "Administrador" en acceso rápido

2. **Navegar a Panel de Control**
   - Automáticamente en `/admin` después de login
   - O clic en "Panel de Control" en menú lateral

3. **Revisar Solicitud Pendiente**
   - Verá 1 solicitud pendiente: "Andrés David Rodríguez Silva"
   - Clic en la solicitud para expandir detalles

4. **Revisar Documentos**
   - Click en enlaces "Ver" para previsualizar
   - Foto: Se abre en nueva pestaña
   - Título: PDF simulado

5. **Verificar Título en SUNEDU**
   - Botón azul "Verificar Título en SUNEDU"
   - Se abre https://enlinea.sunedu.gob.pe/ en nueva pestaña

6. **Tomar Acción**
   - **Opción A - Aprobar:**
     - Click botón verde "Aprobar"
     - Alert mostrará CIP generado (ej: 00003)
     - Postulante es convertido a Ingeniero
   
   - **Opción B - Observar:**
     - Ingrese observaciones en campo de texto
     - Click botón amarillo "Observar"
     - Se simula envío de correo de corrección
   
   - **Opción C - Rechazar:**
     - Click botón rojo "Rechazar"
     - Solicitud se marca como Rechazada

7. **Validar Cambios**
   - En Padrón General, debería aparecer nuevo ingeniero si aprobó
   - Contador de "Solicitudes Pendientes" decrece

---

## Flujo 2: Inscripción de Nuevo Postulante

### Objetivo
Completar flujo de inscripción de 3 pasos.

### Pasos

1. **Ir a Página de Registro**
   - URL: http://localhost:5173/registro
   - O clic en botón "Registro" en página de login

2. **Paso 1: Datos Personales**
   - Ingrese DNI: `12345674` (u otro número de 8 dígitos)
   - Sistema consulta API de DNI
   - Si falla, usa datos simulados: "Ingeniero 12345674"
   - Nombre se autocompleta
   - Click "Siguiente"

3. **Paso 2: Carga de Documentos**
   - **Fotografía:**
     - Clic en área de carga
     - Seleccione imagen JPG o PNG
     - Máximo 5MB
   - **Título Profesional:**
     - Clic en área de carga
     - Seleccione archivo PDF
     - Máximo 5MB
   - Ambos campos obligatorios
   - Click "Siguiente"

4. **Paso 3: Pago**
   - Monto: **S/ 1,500.00**
   - Seleccione método de pago:
     - **Tarjeta:** Simula gateway (sin datos reales requeridos)
     - **Voucher:** Requiere carga de comprobante
   - Click "Completar Pago"

5. **Confirmación**
   - Pantalla de éxito mostrará:
     - Checkmark verde
     - Mensaje: "Inscripción Exitosa"
   - Auto-redirige a login en 3 segundos

6. **Validar en Admin**
   - Login como admin
   - Verá nueva solicitud en Panel de Control
   - CIP aún no asignado (espera revisión)

---

## Flujo 3: Ingeniero Hábil - Visualizar Carnet y Cuotas

### Objetivo
Ver carnet digital perfecto y gestión de cuotas al día.

### Pasos

1. **Login como Ingeniero Hábil**
   - Email: `j.perez@ingenieros.pe`
   - Contraseña: `pass123`
   - O clic en botón "Ingeniero Hábil" en acceso rápido

2. **Dashboard**
   - Se abre automáticamente en `/dashboard`
   - **Sin alertas** (membresía activa)

3. **Carnet Digital**
   - Visualización realista 85x55mm
   - Datos:
     - CIP: **00001**
     - Nombres: Juan Carlos Pérez Rodríguez
     - DNI: 12345671
     - Foto profesional
     - Estado: **Hábil** (verde)
   - **Sin marca de agua** (no está inhabilitado)

4. **Estadísticas de Cuotas**
   - Total cuotas: 2
   - Cuotas pagadas: 1
   - Deuda: S/ 0.00 (sin deuda)
   - Indicadores verdes (sin alertas)

5. **Tabla de Cuotas**
   | Mes | Año | Monto | Vencimiento | Estado |
   |-----|-----|-------|-------------|--------|
   | Enero | 2026 | S/ 0.00 | 15/01/2026 | Pagada |
   | Febrero | 2026 | S/ 20.00 | 15/02/2026 | Pendiente |

6. **Validaciones**
   - Primer mes: Gratis (S/ 0)
   - Siguientes meses: S/ 20.00
   - Información al pie explica reglas

---

## Flujo 4: Ingeniero Inhabilitado - Ver Marca de Inhabilitación

### Objetivo
Visualizar estado de mora e inhabilitación.

### Pasos

1. **Login como Ingeniero Inhabilitado**
   - Email: `m.lopez@ingenieros.pe`
   - Contraseña: `pass123`
   - O clic en botón "Ingeniero (Inhabilitado)" en acceso rápido

2. **Dashboard - Alerta Principal**
   - Aparece alert rojo en la parte superior:
     - Título: "Membresía Suspendida"
     - Mensaje: Explica falta de pago
   - Ícono de alerta

3. **Carnet Digital**
   - Carnet visible normalmente, PERO
   - **Marca de agua diagonal roja:**
     - Texto: "INHABILITADO" en mayúsculas
     - Semitransparente (40% opacidad)
     - Girado -45 grados
     - Cubre todo el carnet
   - Debajo del carnet:
     - Badge rojo: "Membresía Suspendida"

4. **Estadísticas de Cuotas**
   - Total cuotas: 3
   - Cuotas pagadas: 0
   - **Deuda: S/ 60.00** (en rojo)
   - Indicadores rojos (alerta activa)

5. **Tabla de Cuotas**
   | Mes | Año | Monto | Vencimiento | Estado |
   |-----|-----|-------|-------------|--------|
   | Enero | 2026 | S/ 20.00 | 15/01/2026 | Vencida |
   | Febrero | 2026 | S/ 20.00 | 15/02/2026 | Vencida |
   | Marzo | 2026 | S/ 20.00 | 15/03/2026 | Vencida |

6. **Validaciones**
   - 3 meses sin pagar → Inhabilitado
   - Suma correcta: 3 × S/ 20.00 = S/ 60.00
   - Estados correctos: Todas vencidas
   - UI refleja urgencia (colores rojos)

---

## Flujo 5: Padrón General - Filtros y Estadísticas

### Objetivo
Ver lista completa de ingenieros colegiados.

### Pasos

1. **Login como Secretaria**
   - Email: `secretaria@cip.org.pe`
   - Contraseña: `pass123`
   - O clic en botón "Secretaría" en acceso rápido

2. **Navegar a Padrón General**
   - Menú lateral → "Padrón General"
   - URL: `/padron`

3. **Filtros**
   - Botones en la parte superior
   - **"Todos"** - muestra todos los ingenieros
   - **"Hábiles"** - solo estado Hábil
   - **"Inhabilitados"** - solo estado Inhabilitado

4. **Tabla de Ingenieros**
   | CIP | Nombre | DNI | Estado | Deuda |
   |-----|--------|-----|--------|-------|
   | 00001 | Juan Carlos Pérez Rodríguez | 12345671 | Hábil (verde) | S/ 0.00 (verde) |
   | 00002 | María Elena López Martínez | 12345672 | Inhabilitado (rojo) | S/ 60.00 (rojo) |

5. **Estadísticas**
   - Tarjeta 1: "Total de Colegiados" = 2
   - Tarjeta 2: "Hábiles" = 1 (verde)
   - Tarjeta 3: "Inhabilitados" = 1 (rojo)

6. **Interactividad**
   - Haga clic en "Hábiles" → Tabla muestra solo 00001
   - Haga clic en "Inhabilitados" → Tabla muestra solo 00002
   - Haga clic en "Todos" → Tabla muestra ambos

---

## Pruebas de Responsividad

### Desktop (1920px+)
- Sidebar expandido a la izquierda
- Tabla completa visible
- Carnet digital bien espaciado

### Tablet (768px - 1024px)
- Sidebar colapsable
- Tabla responsive
- Menú hamburguesa disponible

### Mobile (< 768px)
- Sidebar oculto por defecto
- Botón hamburguesa visible (menú → icono líneas)
- Tabla con scroll horizontal
- Carnet digital ajustado

---

## Validaciones de Seguridad

### 1. Rutas Protegidas
- Sin login: redirige a `/login`
- Rol incorrecto: redirige a `/dashboard`
- Token expirado: redirige a login

### 2. Sesión
- Cierre sesión: botón "Cerrar Sesión"
- Auto-logout: (no implementado, pero estructura lista)

### 3. Datos Sensibles
- Contraseñas: hashadas en mockDb (NO implementado en demo)
- Documentos: simulados con URLs

---

## Casos Edge

### Caso 1: Múltiples Aprobaciones
1. Login como admin
2. Apruebe postulante → CIP 00003
3. Vuelva al panel
4. CIP de nuevo postulante será 00004

### Caso 2: Cargar Documentos Inválidos
- Intente subir archivo > 5MB → Error
- Intente subir formato incorrecto → Error
- Mensaje claro en UI

### Caso 3: DNI API Fallida
- Ingrese DNI con conexión deshabilitada
- Sistema usa fallback automático
- Experiencia sin interrupciones

### Caso 4: LocalStorage Sincronización
- Abra 2 pestaña del mismo navegador
- Cambios en una se reflejan en la otra (si recarga)
- localStorage sincroniza entre pestañas

---

## Verificación de Calidad

- [x] Sin errores TypeScript (npm run typecheck)
- [x] Build exitoso (npm run build)
- [x] CSS cargado correctamente
- [x] Iconografía funciona (Lucide React)
- [x] Rutas protegidas funcionan
- [x] Componentes responsivos
- [x] Datos persisten en localStorage
- [x] Flujos completos funcionan

---

## Checklist Final

### Funcionalidades
- [ ] Login con acceso rápido funciona
- [ ] Inscripción de 3 pasos funciona
- [ ] Panel admin aprueba/rechaza
- [ ] CIP genera correctamente
- [ ] Carnet digital muestra marca si inhabilitado
- [ ] Cuotas muestran correctamente
- [ ] Padrón filtra correctamente
- [ ] Logout funciona

### Diseño
- [ ] Colores corporativos correctos
- [ ] Layout responsivo
- [ ] Navegación intuitiva
- [ ] Mensajes claros

### Performance
- [ ] Build < 50ms
- [ ] Gzip < 100kB
- [ ] No console errors
- [ ] Smooth animations

---

**Pruebas completadas exitosamente = Proyecto listo para presentación**
