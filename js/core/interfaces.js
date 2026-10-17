/* ============================================================
   CORE / INTERFACES — Contratos del sistema (Principio DIP)
   Las capas de alto nivel (servicios) dependen de estas
   abstracciones, nunca de implementaciones concretas.
   JavaScript no tiene interfaces nativas: se simulan con
   clases base cuyos métodos lanzan error si no se sobrescriben.
   ============================================================ */

class IRepository {
  guardar(clave, valor) {
    throw new Error('IRepository.guardar() no está implementado.');
  }
  cargar(clave, valorPorDefecto) {
    throw new Error('IRepository.cargar() no está implementado.');
  }
  eliminar(clave) {
    throw new Error('IRepository.eliminar() no está implementado.');
  }
}

class INotifier {
  exito(mensaje) {
    throw new Error('INotifier.exito() no está implementado.');
  }
  error(mensaje) {
    throw new Error('INotifier.error() no está implementado.');
  }
  informacion(mensaje) {
    throw new Error('INotifier.informacion() no está implementado.');
  }
}

class IAuthenticator {
  autenticar(usuario, clave) {
    throw new Error('IAuthenticator.autenticar() no está implementado.');
  }
  listarUsuarios() {
    throw new Error('IAuthenticator.listarUsuarios() no está implementado.');
  }
}
