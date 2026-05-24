# Resolución de Problemas - Sistema de Colegiatura CIP

## Si la aplicación muestra pantalla de error al cargar

### Solución 1: Limpiar LocalStorage

La aplicación puede fallar si hay datos corruptos en localStorage. Ejecute esta instrucción en la consola del navegador (F12 → Console):

```javascript
// Limpiar datos corruptos de la aplicación
localStorage.removeItem('colegiatura_cip_db');
localStorage.removeItem('auth_user');
location.reload();
```

### Solución 2: Verificar estructura de datos

Si persiste el error, limpie todo el localStorage:

```javascript
// Limpiar todo localStorage
localStorage.clear();
location.reload();
```

---

## Dependencias instaladas

Todas las dependencias están correctamente instaladas:
- `react-router-dom: ^6.20.0`
- `lucide-react: ^0.344.0`
- `@emailjs/browser: ^4.4.1`
- `@supabase/supabase-js: ^2.57.4`

---

## Configuración de EmailJS (Opcional)

Si desea habilitar el envío real de correos para verificación, configure EmailJS:

1. Cree cuenta en https://www.emailjs.com/
2. Cree un servicio de email (Gmail, Outlook, etc.)
3. Cree una plantilla con estas variables:
   - `{{to_email}}` - Correo del destinatario
   - `{{codigo_verificacion}}` - Código de 6 dígitos
4. Reemplace las constantes en `src/components/inscripcion/FormDatos.tsx`:

```typescript
const EMAILJS_SERVICE_ID = 'service_xxxxxxx';  // Su Service ID
const EMAILJS_TEMPLATE_ID = 'template_xxxxxxx'; // Su Template ID
const EMAILJS_PUBLIC_KEY = 'xxxxxxxxxxxxxxx';   // Su Public Key
```

**Nota:** Si no configura EmailJS, el sistema funcionará en "modo desarrollo" mostrando el código de verificación en la consola del navegador.

---

## Verificación de Build

```bash
# Compilar
npm run build

# Verificar tipos
npm run typecheck

# Desarrollo
npm run dev
```

---

## Estado actual del sistema

- ✅ Build exitoso
- ✅ TypeScript sin errores
- ✅ Todas las dependencias instaladas
- ✅ Rutas configuradas correctamente
- ✅ LocalStorage con validación de estructura

---

## Contacto

Si el problema persiste después de limpiar localStorage, revise:
1. La consola del navegador para errores de JavaScript
2. La pestaña Network para recursos que no cargan
3. La versión del navegador (debe soportar ES6+)
