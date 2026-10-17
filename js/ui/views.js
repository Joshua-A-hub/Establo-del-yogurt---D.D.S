/* ============================================================
   UI / VISTAS — Capa de presentación (SRP)
   Cada vista SOLO lee el DOM, pinta resultados y delega toda la
   lógica de negocio en los servicios. No contiene reglas de
   negocio ni acceso a persistencia.
   ============================================================ */

class LoginView {
  constructor(authService) {
    this.authService = authService;
  }

  iniciarSesion(alExito) {
    const usuario = document.getElementById('loginUser').value.trim();
    const clave = document.getElementById('loginPass').value;
    const sesion = this.authService.iniciarSesion(usuario, clave);
    const errBox = document.getElementById('loginError');

    if (!sesion) {
      errBox.style.display = 'block';
      return;
    }
    errBox.style.display = 'none';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
    document.getElementById('userNameLabel').textContent = sesion.usuario;
    document.getElementById('userRoleLabel').textContent = sesion.rol;
    document.getElementById('navUsuarios').style.display = this.authService.esAdministrador() ? 'flex' : 'none';
    if (alExito) alExito(sesion);
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('appScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
  }
}

class NavegacionView {
  constructor(authService, notificador) {
    this.authService = authService;
    this.notificador = notificador;
  }

  irA(pagina, rutas) {
    if (!this.authService.puedeAccederA(pagina)) {
      this.notificador.informacion('Solo el administrador puede ver esta sección.');
      return;
    }
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + pagina).classList.add('active');
    document.querySelectorAll('nav.sidebar button').forEach(b => b.classList.remove('active'));
    document.querySelector(`nav.sidebar button[data-page="${pagina}"]`).classList.add('active');
    if (rutas[pagina]) rutas[pagina]();
  }
}

class DashboardView {
  constructor(dashboardService) {
    this.dashboardService = dashboardService;
  }

  render() {
    const stats = this.dashboardService.calcularEstadisticas();
    document.getElementById('statsGrid').innerHTML = `
      <div class="stat"><div class="num">${stats.totalProductos}</div><div class="lbl">Productos registrados</div></div>
      <div class="stat"><div class="num">${stats.totalVentas}</div><div class="lbl">Ventas realizadas</div></div>
      <div class="stat"><div class="num">S/ ${stats.totalVendido.toFixed(2)}</div><div class="lbl">Total vendido</div></div>
    `;
    const bajos = this.dashboardService.productosConStockBajo();
    document.getElementById('lowStockBody').innerHTML = bajos.length ? bajos.map(p => `
      <tr><td>${p.nombre}</td><td>${p.stock}</td>
      <td>${p.stock === 0 ? '<span class="badge badge-red">Sin stock</span>' : '<span class="badge badge-red">Stock bajo</span>'}</td></tr>
    `).join('') : `<tr><td colspan="3" style="color:var(--gray);">No hay productos con stock bajo 🎉</td></tr>`;
  }
}

class ProductoView {
  constructor(productoService) {
    this.productoService = productoService;
  }

  render() {
    const productos = this.productoService.listar();
    document.getElementById('productosBody').innerHTML = productos.map(p => `
      <tr>
        <td>${p.nombre}</td>
        <td>S/ ${p.precio.toFixed(2)}</td>
        <td class="${p.stock <= 5 ? 'stock-low' : 'stock-ok'}">${p.stock}</td>
        <td>${p.stock === 0 ? '<span class="badge badge-red">Sin stock</span>' : (p.stock <= 5 ? '<span class="badge badge-red">Bajo</span>' : '<span class="badge badge-green">Disponible</span>')}</td>
        <td>
          <button class="btn btn-outline small-btn" onclick="editarProducto(${p.id})">Editar</button>
          <button class="btn btn-red small-btn" onclick="eliminarProducto(${p.id})">Eliminar</button>
        </td>
      </tr>
    `).join('');
  }

  guardar() {
    const editId = document.getElementById('prodEditId').value;
    const datos = {
      nombre: document.getElementById('prodNombre').value.trim(),
      precio: parseFloat(document.getElementById('prodPrecio').value),
      stock: parseInt(document.getElementById('prodStock').value)
    };
    const resultado = editId
      ? this.productoService.actualizar(editId, datos)
      : this.productoService.agregar(datos);
    if (!resultado) return;
    this.cancelarEdicion();
    this.render();
  }

  editar(id) {
    const producto = this.productoService.buscarPorId(id);
    if (!producto) return;
    document.getElementById('prodEditId').value = producto.id;
    document.getElementById('prodNombre').value = producto.nombre;
    document.getElementById('prodPrecio').value = producto.precio;
    document.getElementById('prodStock').value = producto.stock;
    document.getElementById('prodFormTitle').textContent = 'Editar producto';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
  }

  cancelarEdicion() {
    document.getElementById('prodEditId').value = '';
    document.getElementById('prodNombre').value = '';
    document.getElementById('prodPrecio').value = '';
    document.getElementById('prodStock').value = '';
    document.getElementById('prodFormTitle').textContent = 'Agregar producto';
    document.getElementById('cancelEditBtn').style.display = 'none';
  }

  eliminar(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    this.productoService.eliminar(id);
    this.render();
  }
}

class ClienteView {
  constructor(clienteService) {
    this.clienteService = clienteService;
  }

  render() {
    const clientes = this.clienteService.listar();
    document.getElementById('clientesBody').innerHTML = clientes.length ? clientes.map(c => `
      <tr><td>${c.ruc}</td><td>${c.razon}</td><td>${c.fecha}</td></tr>
    `).join('') : `<tr><td colspan="3" style="color:var(--gray);">Aún no hay clientes registrados.</td></tr>`;
  }
}

class VentasHistorialView {
  constructor(ventaService) {
    this.ventaService = ventaService;
  }

  render() {
    const ventas = this.ventaService.listarVentas();
    document.getElementById('ventasBody').innerHTML = ventas.length ? ventas.map((v, i) => `
      <tr>
        <td>${i + 1}</td><td>${v.fecha}</td>
        <td>${v.comprobante}</td>
        <td>${v.cliente ? v.cliente.razon + ' (' + v.cliente.ruc + ')' : 'Cliente sin RUC'}</td>
        <td>${v.pago}</td>
        <td>S/ ${v.total.toFixed(2)}</td>
      </tr>
    `).reverse().join('') : `<tr><td colspan="6" style="color:var(--gray);">No hay ventas registradas todavía.</td></tr>`;
  }
}

class VentaView {
  constructor(ventaService, productoService, clienteService, authService, notificador) {
    this.ventaService = ventaService;
    this.productoService = productoService;
    this.clienteService = clienteService;
    this.authService = authService;
    this.notificador = notificador;
    this.productoSeleccionado = null;
    this.pagoSeleccionado = null;
    this.comprobanteSeleccionado = null;
    this.clienteActual = null;
    this.datosClienteValidados = false;
  }

  reset() {
    this.ventaService.limpiarCarrito();
    this.productoSeleccionado = null;
    this.pagoSeleccionado = null;
    this.comprobanteSeleccionado = null;
    this.clienteActual = null;
    this.datosClienteValidados = false;
    document.getElementById('buscarProducto').value = '';
    document.getElementById('cantidadVenta').value = 1;
    document.getElementById('cantidadBox').style.display = 'none';
    document.getElementById('stockBanner').style.display = 'none';
    document.getElementById('carritoCard').style.display = 'none';
    document.getElementById('datosClienteBox').style.display = 'none';
    document.getElementById('clienteValidado').style.display = 'none';
    document.querySelectorAll('.pay-option').forEach(e => e.classList.remove('selected'));
    this.irPaso(1);
    this.renderSelectorProductos();
    this.renderCarrito();
  }

  irPaso(n) {
    document.querySelectorAll('.step-box').forEach(s => s.classList.remove('active'));
    document.getElementById('venta-step-' + n).classList.add('active');
  }

  renderSelectorProductos() {
    const filtro = (document.getElementById('buscarProducto').value || '').toLowerCase();
    const lista = this.productoService.buscarPorNombre(filtro);
    document.getElementById('productPickerList').innerHTML = lista.map(p => `
      <div class="product-pick ${this.productoSeleccionado && this.productoSeleccionado.id === p.id ? 'selected' : ''}" onclick="seleccionarProducto(${p.id})">
        <div><b>${p.nombre}</b><br><span style="color:var(--gray);font-size:12px;">Stock: ${p.stock}</span></div>
        <div style="color:var(--primary);font-weight:700;">S/ ${p.precio.toFixed(2)}</div>
      </div>
    `).join('') || '<p style="color:var(--gray);">No se encontraron productos.</p>';
  }

  seleccionarProducto(id) {
    this.productoSeleccionado = this.productoService.buscarPorId(id);
    if (!this.productoSeleccionado) return;
    document.getElementById('precioStockInfo').value = `S/ ${this.productoSeleccionado.precio.toFixed(2)}  |  Stock: ${this.productoSeleccionado.stock}`;
    document.getElementById('cantidadBox').style.display = 'block';
    document.getElementById('cantidadVenta').value = 1;
    this.renderSelectorProductos();
    this.validarStockDisponible();
  }

  validarStockDisponible() {
    if (!this.productoSeleccionado) return;
    const cantidad = parseInt(document.getElementById('cantidadVenta').value) || 0;
    const banner = document.getElementById('stockBanner');
    if (cantidad > this.productoSeleccionado.stock || this.productoSeleccionado.stock === 0) {
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }
  }

  agregarAlCarrito() {
    const cantidad = parseInt(document.getElementById('cantidadVenta').value);
    const agregado = this.ventaService.agregarAlCarrito(this.productoSeleccionado, cantidad);
    if (!agregado) return;
    this.productoSeleccionado = null;
    document.getElementById('cantidadBox').style.display = 'none';
    document.getElementById('buscarProducto').value = '';
    this.renderSelectorProductos();
    this.renderCarrito();
  }

  renderCarrito() {
    const card = document.getElementById('carritoCard');
    const carrito = this.ventaService.obtenerCarrito();
    if (carrito.length === 0) {
      card.style.display = 'none';
      return;
    }
    card.style.display = 'block';
    document.getElementById('carritoLines').innerHTML = carrito.map(c => `
      <div class="cart-line">
        <span>${c.nombre} × ${c.cantidad}</span>
        <span>S/ ${(c.precio * c.cantidad).toFixed(2)}</span>
      </div>
    `).join('');
    document.getElementById('totalVenta').textContent = `S/ ${this.ventaService.calcularTotal().toFixed(2)}`;
  }

  seleccionarPago(tipo) {
    this.pagoSeleccionado = tipo;
    document.getElementById('pay-efectivo').classList.toggle('selected', tipo === 'Efectivo');
    document.getElementById('pay-yape').classList.toggle('selected', tipo === 'Yape');
  }

  seleccionarComprobante(tipo) {
    this.comprobanteSeleccionado = tipo;
    document.getElementById('cmp-boleta').classList.toggle('selected', tipo === 'Boleta');
    document.getElementById('cmp-factura').classList.toggle('selected', tipo === 'Factura');
    const box = document.getElementById('datosClienteBox');
    if (tipo === 'Factura') {
      box.style.display = 'block';
      this.datosClienteValidados = false;
      document.getElementById('clienteValidado').style.display = 'none';
    } else {
      box.style.display = 'none';
      this.clienteActual = null;
    }
  }

  validarDatosCliente() {
    const ruc = document.getElementById('clienteRuc').value.trim();
    const razon = document.getElementById('clienteRazon').value.trim();
    const cliente = this.clienteService.obtenerORegistrar(ruc, razon);
    if (!cliente) return;
    this.clienteActual = cliente;
    this.datosClienteValidados = true;
    document.getElementById('clienteValidado').style.display = 'block';
    this.notificador.exito('Datos del cliente validados.');
  }

  confirmarTransaccion() {
    const aprobada = this.ventaService.validarVenta({
      pago: this.pagoSeleccionado,
      comprobante: this.comprobanteSeleccionado,
      datosClienteValidados: this.datosClienteValidados
    });
    if (!aprobada) return;

    const sesion = this.authService.obtenerSesion();
    const venta = this.ventaService.registrarVenta({
      pago: this.pagoSeleccionado,
      comprobante: this.comprobanteSeleccionado,
      cliente: this.clienteActual,
      vendedor: sesion ? sesion.usuario : ''
    });
    if (!venta) return;
    this.renderComprobante(venta);
    this.irPaso(3);
  }

  renderComprobante(venta) {
    const numero = this.ventaService.generarNumero();
    const serie = this.ventaService.generarSerie(venta.comprobante);
    document.getElementById('comprobanteBox').innerHTML = `
      <h3>🥛 Establo del Yogurt</h3>
      <div class="meta">${venta.comprobante.toUpperCase()} ELECTRÓNICA — ${serie}-${numero}<br>
      Fecha: ${venta.fecha} &nbsp;|&nbsp; Atendido por: ${venta.vendedor}<br>
      ${venta.cliente ? `Cliente: ${venta.cliente.razon} — RUC: ${venta.cliente.ruc}` : 'Cliente: Sin RUC (Boleta)'}</div>
      <table style="width:100%;">
        <thead><tr><th>Producto</th><th>Cant.</th><th>P. Unit.</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${venta.items.map(i => `<tr><td>${i.nombre}</td><td>${i.cantidad}</td><td>S/ ${i.precio.toFixed(2)}</td><td>S/ ${(i.precio * i.cantidad).toFixed(2)}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="total-line"><span>Total</span><span>S/ ${venta.total.toFixed(2)}</span></div>
      <p style="font-size:12px;color:var(--gray);margin-top:10px;">Método de pago: ${venta.pago}</p>
    `;
  }
}

class ProduccionView {
  constructor(produccionService) {
    this.produccionService = produccionService;
  }

  registrar() {
    const select = document.getElementById('prodElaborar');
    const productoNombre = select.options[select.selectedIndex].text;
    const productoId = parseInt(select.value);
    const cantidadEsperada = parseInt(document.getElementById('prodEsperada').value) || 0;
    const cantidadReal = parseInt(document.getElementById('prodReal').value) || 0;
    const insumos = {
      leche: parseFloat(document.getElementById('insumoLeche').value) || 0,
      fruta: parseFloat(document.getElementById('insumoFruta').value) || 0,
      azucar: parseFloat(document.getElementById('insumoAzucar').value) || 0
    };
    const lote = this.produccionService.registrarLote({
      productoId: productoId,
      productoNombre: productoNombre,
      cantidadEsperada: cantidadEsperada,
      cantidadReal: cantidadReal,
      insumos: insumos
    });
    if (!lote) return;
    ['prodEsperada', 'prodReal', 'insumoLeche', 'insumoFruta', 'insumoAzucar']
      .forEach(id => { document.getElementById(id).value = ''; });
  }
}

class UsuariosView {
  constructor(authService) {
    this.authService = authService;
  }

  render() {
    const usuarios = this.authService.listarUsuarios();
    document.querySelector('#page-usuarios tbody').innerHTML = usuarios.map(u => `
      <tr>
        <td>${u.usuario}</td>
        <td>${u.rol === 'Administrador'
          ? '<span class="badge badge-green">Administrador</span>'
          : '<span class="badge badge-gray">Vendedor</span>'}</td>
      </tr>
    `).join('');
  }
}
