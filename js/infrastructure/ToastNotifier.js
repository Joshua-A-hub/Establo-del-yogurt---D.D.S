/* ============================================================
   INFRASTRUCTURE / TOAST NOTIFIER
   Concreción de INotifier (DIP). Es la ÚNICA clase que sabe
   cómo se muestran los mensajes al usuario (toast del DOM).
   Si mañana se usan alertas o notificaciones nativas, solo se
   reemplaza esta clase.
   ============================================================ */

class ToastNotifier extends INotifier {
  mostrar(mensaje) {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  exito(mensaje) {
    this.mostrar(mensaje);
  }

  error(mensaje) {
    this.mostrar(mensaje);
  }

  informacion(mensaje) {
    this.mostrar(mensaje);
  }
}
