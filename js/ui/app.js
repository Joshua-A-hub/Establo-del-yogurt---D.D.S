/* ============================================================
   UI / APP — COMPOSITION ROOT
   Único lugar donde se instancian las concreciones y se
   inyectan las dependencias. También expone la API global que
   usan los atributos onclick/oninput del HTML.
   ============================================================ */

/* --- 1. Infraestructura (concreciones de los contratos) --- */
const repositorio = new LocalStorageRepository();
const notificador = new ToastNotifier();
const autenticador = new InMemoryAuthService();

/* --- 2. Servicios (lógica de negocio, reciben abstracciones) --- */
const authService = new AuthService(autenticador);
const productoService = new ProductoService(repositorio, notificador);
const clienteService = new ClienteService(repositorio, notificador);
const ventaService = new VentaService(repositorio, productoService, clienteService, notificador);
const dashboardService = new DashboardService(productoService, ventaService);
const produccionService = new ProduccionService(repositorio, notificador);

/* --- 3. Vistas (presentación) --- */
const loginView = new LoginView(authService);
const navegacionView = new NavegacionView(authService, notificador);
const dashboardView = new DashboardView(dashboardService);
const productoView = new ProductoView(productoService);
const clienteView = new ClienteView(clienteService);
const ventasHistorialView = new VentasHistorialView(ventaService);
const ventaView = new VentaView(ventaService, productoService, clienteService, authService, notificador);
const produccionView = new ProduccionView(produccionService);
const usuariosView = new UsuariosView(authService);

/* --- 4. Tabla de rutas (página -> render) --- */
const rutas = {
  dashboard: () => dashboardView.render(),
  productos: () => productoView.render(),
  clientes: () => clienteView.render(),
  ventas: () => ventasHistorialView.render(),
  venta: () => ventaView.reset(),
  usuarios: () => usuariosView.render()
};

/* --- 5. API global para los eventos del HTML --- */
window.intentarLogin = () => loginView.iniciarSesion(() => navegacionView.irA('dashboard', rutas));
window.cerrarSesion = () => loginView.cerrarSesion();
window.irPagina = (pagina) => navegacionView.irA(pagina, rutas);
window.irPaso = (n) => ventaView.irPaso(n);
window.nuevaVentaReset = () => ventaView.reset();
window.renderProductPicker = () => ventaView.renderSelectorProductos();
window.validarStockDisponible = () => ventaView.validarStockDisponible();
window.seleccionarProducto = (id) => ventaView.seleccionarProducto(id);
window.agregarAlCarrito = () => ventaView.agregarAlCarrito();
window.seleccionarPago = (tipo) => ventaView.seleccionarPago(tipo);
window.seleccionarComprobante = (tipo) => ventaView.seleccionarComprobante(tipo);
window.validarDatosCliente = () => ventaView.validarDatosCliente();
window.confirmarTransaccion = () => ventaView.confirmarTransaccion();
window.guardarProducto = () => productoView.guardar();
window.editarProducto = (id) => productoView.editar(id);
window.cancelarEdicionProducto = () => productoView.cancelarEdicion();
window.eliminarProducto = (id) => productoView.eliminar(id);
window.registrarProduccion = () => produccionView.registrar();

/* --- 6. Eventos iniciales (idénticos al comportamiento original) --- */
document.getElementById('loginPass').addEventListener('keydown', e => {
  if (e.key === 'Enter') window.intentarLogin();
});
document.getElementById('loginUser').focus();
