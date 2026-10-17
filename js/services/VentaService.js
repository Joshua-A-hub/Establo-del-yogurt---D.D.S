/* ============================================================
   SERVICES / VENTA SERVICE (SRP)
   Única razón de cambio: las reglas del flujo de venta
   (carrito, validaciones, registro y descuento de stock).
   Depende de abstracciones y de otros servicios (DIP):
   no toca localStorage, ni el DOM, ni conoce el toast.
   ============================================================ */

const CLAVE_VENTAS = 'eyo_ventas';

class VentaService {
  constructor(repositorio, productoService, clienteService, notificador) {
    this.repositorio = repositorio;
    this.productoService = productoService;
    this.clienteService = clienteService;
    this.notificador = notificador;
    this.carrito = [];
  }

  listarVentas() {
    return this.repositorio.cargar(CLAVE_VENTAS, []);
  }

  contarVentas() {
    return this.listarVentas().length;
  }

  obtenerCarrito() {
    return this.carrito;
  }

  limpiarCarrito() {
    this.carrito = [];
  }

  agregarAlCarrito(producto, cantidad) {
    if (!producto) {
      this.notificador.error('Selecciona un producto primero.');
      return false;
    }
    if (!cantidad || cantidad <= 0) {
      this.notificador.error('Ingresa una cantidad válida.');
      return false;
    }
    if (producto.stock === 0 || cantidad > producto.stock) {
      this.notificador.error('Stock insuficiente para este producto.');
      return false;
    }
    const existente = this.carrito.find(c => c.id === producto.id);
    if (existente) {
      if (existente.cantidad + cantidad > producto.stock) {
        this.notificador.error('No puedes superar el stock disponible.');
        return false;
      }
      existente.cantidad += cantidad;
    } else {
      this.carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: cantidad
      });
    }
    this.notificador.exito('Producto agregado al carrito.');
    return true;
  }

  calcularTotal() {
    return this.carrito.reduce((suma, c) => suma + c.precio * c.cantidad, 0);
  }

  validarVenta({ pago, comprobante, datosClienteValidados }) {
    if (this.carrito.length === 0) {
      this.notificador.error('El carrito está vacío.');
      return false;
    }
    if (!pago) {
      this.notificador.error('Selecciona un método de pago.');
      return false;
    }
    if (!comprobante) {
      this.notificador.error('Selecciona el tipo de comprobante.');
      return false;
    }
    if (comprobante === 'Factura' && !datosClienteValidados) {
      this.notificador.error('Valida los datos del cliente antes de continuar.');
      return false;
    }
    return true;
  }

  registrarVenta({ pago, comprobante, cliente, vendedor }) {
    for (const item of this.carrito) {
      const producto = this.productoService.buscarPorId(item.id);
      if (!producto || producto.stock < item.cantidad) {
        this.notificador.error(`Stock insuficiente para ${item.nombre}.`);
        return null;
      }
    }
    this.productoService.descontarStock(this.carrito);

    const venta = new Venta({
      fecha: new Date().toLocaleString('es-PE'),
      items: [...this.carrito],
      pago: pago,
      comprobante: comprobante,
      cliente: comprobante === 'Factura' ? cliente : null,
      total: this.calcularTotal(),
      vendedor: vendedor
    }).aObjetoPlano();

    const ventas = this.listarVentas();
    ventas.push(venta);
    this.repositorio.guardar(CLAVE_VENTAS, ventas);
    this.limpiarCarrito();
    return venta;
  }

  generarSerie(comprobante) {
    return comprobante === 'Factura' ? 'F001' : 'B001';
  }

  generarNumero() {
    return String(this.contarVentas()).padStart(6, '0');
  }
}
