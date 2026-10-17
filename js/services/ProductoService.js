/* ============================================================
   SERVICES / PRODUCTO SERVICE (SRP)
   Única razón de cambio: las reglas de negocio de productos
   (catálogo y stock). Persiste vía IRepository y notifica vía
   INotifier (DIP): no conoce localStorage ni el DOM.
   ============================================================ */

const CLAVE_PRODUCTOS = 'eyo_productos';

const PRODUCTOS_INICIALES = [
  { id: 1, nombre: "Yogurt Natural 1L", precio: 9.50, stock: 30 },
  { id: 2, nombre: "Yogurt de Fresa 1L", precio: 10.00, stock: 25 },
  { id: 3, nombre: "Yogurt de Durazno 1L", precio: 10.00, stock: 4 },
  { id: 4, nombre: "Yogurt Griego 500ml", precio: 8.00, stock: 0 },
  { id: 5, nombre: "Queso Fresco 1kg", precio: 18.00, stock: 12 }
];

class ProductoService {
  constructor(repositorio, notificador) {
    this.repositorio = repositorio;
    this.notificador = notificador;
  }

  listar() {
    return this.repositorio.cargar(CLAVE_PRODUCTOS, PRODUCTOS_INICIALES);
  }

  buscarPorId(id) {
    return this.listar().find(p => p.id === id) || null;
  }

  buscarPorNombre(filtro) {
    const texto = (filtro || '').toLowerCase();
    return this.listar().filter(p => p.nombre.toLowerCase().includes(texto));
  }

  validar(datos) {
    if (!datos.nombre || isNaN(datos.precio) || isNaN(datos.stock)) {
      this.notificador.error('Completa todos los campos correctamente.');
      return false;
    }
    return true;
  }

  agregar(datos) {
    if (!this.validar(datos)) return null;
    const productos = this.listar();
    const nuevoId = productos.length ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    const producto = new Producto({ id: nuevoId, nombre: datos.nombre, precio: datos.precio, stock: datos.stock });
    productos.push(producto.aObjetoPlano());
    this.repositorio.guardar(CLAVE_PRODUCTOS, productos);
    this.notificador.exito('Producto agregado.');
    return producto;
  }

  actualizar(id, datos) {
    if (!this.validar(datos)) return null;
    const productos = this.listar();
    const indice = productos.findIndex(p => p.id == id);
    if (indice === -1) return null;
    const producto = new Producto({ id: productos[indice].id, nombre: datos.nombre, precio: datos.precio, stock: datos.stock });
    productos[indice] = producto.aObjetoPlano();
    this.repositorio.guardar(CLAVE_PRODUCTOS, productos);
    this.notificador.exito('Producto actualizado.');
    return producto;
  }

  eliminar(id) {
    const productos = this.listar().filter(p => p.id !== id);
    this.repositorio.guardar(CLAVE_PRODUCTOS, productos);
  }

  descontarStock(items) {
    const productos = this.listar();
    items.forEach(item => {
      const producto = productos.find(p => p.id === item.id);
      if (producto) producto.stock -= item.cantidad;
    });
    this.repositorio.guardar(CLAVE_PRODUCTOS, productos);
  }

  tieneStockDisponible(producto, cantidad) {
    return !!producto && producto.stock > 0 && cantidad <= producto.stock;
  }

  conStockBajo(limite = 5) {
    return this.listar().filter(p => p.stock <= limite);
  }
}
