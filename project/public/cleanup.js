// Limpiar localStorage corrupto antes de que cargue React
// Este script se ejecuta inmediatamente en el navegador
(function() {
  try {
    // Verificar si localStorage tiene datos corruptos
    const dbData = localStorage.getItem('colegiatura_cip_db');
    const authData = localStorage.getItem('auth_user');

    if (dbData) {
      try {
        const parsed = JSON.parse(dbData);
        if (!parsed || !parsed.users || !parsed.ingenieros || !parsed.postulantes || !parsed.cuotas) {
          console.warn('localStorage DB corrupto, limpiando...');
          localStorage.removeItem('colegiatura_cip_db');
        }
      } catch (e) {
        console.warn('localStorage DB no es JSON válido, limpiando...');
        localStorage.removeItem('colegiatura_cip_db');
      }
    }

    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (!parsed || !parsed.id || !parsed.email || !parsed.rol) {
          console.warn('localStorage auth corrupto, limpiando...');
          localStorage.removeItem('auth_user');
        }
      } catch (e) {
        console.warn('localStorage auth no es JSON válido, limpiando...');
        localStorage.removeItem('auth_user');
      }
    }

    console.log('LocalStorage validado correctamente');
  } catch (e) {
    console.error('Error validando localStorage:', e);
  }
})();
