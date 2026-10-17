/* ============================================================
   SERVICES / PRODUCCION SERVICE (SRP)
   Única razón de cambio: las reglas de producción (cálculo de
   merma según la regla de negocio RN-03 y registro de lotes).
   ============================================================ */

const CLAVE_LOTES = 'eyo_lotes';

class ProduccionService {
  constructor(repositorio, notificador) {
    this.repositorio = repositorio;
    this.notificador = notificador;
  }

  listarLotes() {
    return this.repositorio.cargar(CLAVE_LOTES, []);
  }

  calcularMerma(cantidadEsperada, cantidadReal) {
    let merma = cantidadEsperada > 0 ? (cantidadEsperada - cantidadReal) : 0;
    return merma < 0 ? 0 : merma;
  }

  registrarLote({ productoId, productoNombre, cantidadEsperada, cantidadReal, insumos }) {
    if (cantidadReal <= 0 || !insumos || insumos.leche <= 0) {
      this.notificador.error('Por favor, ingresa la leche utilizada y la cantidad real producida.');
      return null;
    }
    const merma = this.calcularMerma(cantidadEsperada, cantidadReal);
    const lote = new LoteProduccion({
      productoId: productoId,
      productoNombre: productoNombre,
      cantidadEsperada: cantidadEsperada,
      cantidadReal: cantidadReal,
      insumos: insumos,
      merma: merma,
      fecha: new Date().toLocaleString('es-PE')
    }).aObjetoPlano();

    const lotes = this.listarLotes();
    lotes.push(lote);
    this.repositorio.guardar(CLAVE_LOTES, lotes);

    this.notificador.exito(`¡Lote de ${productoNombre} guardado! Merma registrada: ${merma} unidades.`);
    return lote;
  }
}
