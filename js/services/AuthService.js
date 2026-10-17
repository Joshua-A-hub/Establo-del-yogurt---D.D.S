/* ============================================================
   SERVICES / AUTH SERVICE (SRP)
   Única razón de cambio: las reglas de sesión y roles.
   Depende de IAuthenticator (DIP), no del origen de usuarios.
   ============================================================ */

class AuthService {
  constructor(autenticador) {
    this.autenticador = autenticador;
    this.sesion = null;
  }

  iniciarSesion(usuario, clave) {
    const sesion = this.autenticador.autenticar(usuario, clave);
    if (sesion) this.sesion = sesion;
    return sesion;
  }

  cerrarSesion() {
    this.sesion = null;
  }

  obtenerSesion() {
    return this.sesion;
  }

  esAdministrador() {
    return !!this.sesion && this.sesion.rol === 'Administrador';
  }

  puedeAccederA(pagina) {
    if (pagina === 'usuarios') return this.esAdministrador();
    return !!this.sesion;
  }

  listarUsuarios() {
    return this.autenticador.listarUsuarios();
  }
}
