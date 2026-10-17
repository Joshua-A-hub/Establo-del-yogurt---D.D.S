/* ============================================================
   INFRASTRUCTURE / IN MEMORY AUTHENTICATOR
   Concreción de IAuthenticator (DIP). Única clase que conoce
   el origen de los usuarios y sus credenciales.
   Reemplazar por una base de datos = nueva implementación.
   ============================================================ */

const USUARIOS_SISTEMA = {
  "admin": { pass: "admin123", rol: "Administrador" },
  "vendedor": { pass: "venta123", rol: "Vendedor" }
};

class InMemoryAuthService extends IAuthenticator {
  autenticar(usuario, clave) {
    const registro = USUARIOS_SISTEMA[usuario];
    if (registro && registro.pass === clave) {
      return { usuario: usuario, rol: registro.rol };
    }
    return null;
  }

  listarUsuarios() {
    return Object.keys(USUARIOS_SISTEMA).map(usuario => ({
      usuario: usuario,
      rol: USUARIOS_SISTEMA[usuario].rol
    }));
  }
}
