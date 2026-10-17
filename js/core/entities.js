/* ============================================================
   CORE / ENTITIES — Modelo del dominio
   Representan los conceptos del negocio. Alta cohesión: cada
   entidad conoce únicamente sus datos y reglas elementales.
   ============================================================ */

class Producto {
  constructor({ id, nombre, precio, stock }) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
  }
  hayStock() {
    return this.stock > 0;
  }
  permiteCantidad(cantidad) {
    return this.hayStock() && cantidad <= this.stock;
  }
  stockBajo(limite = 5) {
    return this.stock <= limite;
  }
  aObjetoPlano() {
    return { id: this.id, nombre: this.nombre, precio: this.precio, stock: this.stock };
  }
}

class Cliente {
  constructor({ ruc, razon, fecha }) {
    this.ruc = ruc;
    this.razon = razon;
    this.fecha = fecha;
  }
  aObjetoPlano() {
    return { ruc: this.ruc, razon: this.razon, fecha: this.fecha };
  }
}

class Venta {
  constructor({ fecha, items, pago, comprobante, cliente, total, vendedor }) {
    this.fecha = fecha;
    this.items = items;
    this.pago = pago;
    this.comprobante = comprobante;
    this.cliente = cliente;
    this.total = total;
    this.vendedor = vendedor;
  }
  aObjetoPlano() {
    return {
      fecha: this.fecha,
      items: this.items,
      pago: this.pago,
      comprobante: this.comprobante,
      cliente: this.cliente,
      total: this.total,
      vendedor: this.vendedor
    };
  }
}

class LoteProduccion {
  constructor({ productoId, productoNombre, cantidadEsperada, cantidadReal, insumos, merma, fecha }) {
    this.productoId = productoId;
    this.productoNombre = productoNombre;
    this.cantidadEsperada = cantidadEsperada;
    this.cantidadReal = cantidadReal;
    this.insumos = insumos;
    this.merma = merma;
    this.fecha = fecha;
  }
  aObjetoPlano() {
    return {
      productoId: this.productoId,
      productoNombre: this.productoNombre,
      cantidadEsperada: this.cantidadEsperada,
      cantidadReal: this.cantidadReal,
      insumos: this.insumos,
      merma: this.merma,
      fecha: this.fecha
    };
  }
}
