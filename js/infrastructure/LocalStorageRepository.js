/* ============================================================
   INFRASTRUCTURE / LOCAL STORAGE REPOSITORY
   Concreción de IRepository (DIP). Es la ÚNICA clase que sabe
   que la persistencia se hace con localStorage y JSON.
   Cambiar a una API REST = crear otro IRepository, sin tocar
   los servicios.
   ============================================================ */

class LocalStorageRepository extends IRepository {
  guardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
  }

  cargar(clave, valorPorDefecto) {
    const valor = localStorage.getItem(clave);
    return valor ? JSON.parse(valor) : valorPorDefecto;
  }

  eliminar(clave) {
    localStorage.removeItem(clave);
  }
}
