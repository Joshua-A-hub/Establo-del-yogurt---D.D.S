/* ============================================================
   SERVICES / DASHBOARD SERVICE (SRP)
   Única razón de cambio: el cálculo de indicadores del panel.
   Reutiliza ProductoService y VentaService (alta cohesión,
   bajo acoplamiento): no accede a la persistencia directamente.
   ============================================================ */

class DashboardService {
  constructor(productoService, ventaService) {
    this.productoService = productoService;
    this.ventaService = ventaService;
  }

  calcularEstadisticas() {
    const productos = this.productoService.listar();
    const ventas = this.ventaService.listarVentas();
    return {
      totalProductos: productos.length,
      totalVentas: ventas.length,
      totalVendido: ventas.reduce((suma, v) => suma + v.total, 0)
    };
  }

  productosConStockBajo(limite = 5) {
    return this.productoService.conStockBajo(limite);
  }
}
