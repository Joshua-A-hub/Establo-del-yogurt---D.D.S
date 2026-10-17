/* ============================================================
   SERVICES / CLIENTE SERVICE (SRP)
   Única razón de cambio: las reglas de clientes (validación de
   RUC y registro para facturación).
   ============================================================ */

const CLAVE_CLIENTES = 'eyo_clientes';

class ClienteService {
  constructor(repositorio, notificador) {
    this.repositorio = repositorio;
    this.notificador = notificador;
  }

  listar() {
    return this.repositorio.cargar(CLAVE_CLIENTES, []);
  }

  buscarPorRuc(ruc) {
    return this.listar().find(c => c.ruc === ruc) || null;
  }

  esRucValido(ruc) {
    return typeof ruc === 'string' && ruc.length === 11 && !isNaN(ruc);
  }

  obtenerORegistrar(ruc, razon) {
    if (!this.esRucValido(ruc)) {
      this.notificador.error('El RUC debe tener 11 dígitos numéricos.');
      return null;
    }
    if (!razon) {
      this.notificador.error('Ingresa la razón social.');
      return null;
    }
    let cliente = this.buscarPorRuc(ruc);
    if (!cliente) {
      cliente = new Cliente({
        ruc: ruc,
        razon: razon,
        fecha: new Date().toLocaleDateString('es-PE')
      }).aObjetoPlano();
      const clientes = this.listar();
      clientes.push(cliente);
      this.repositorio.guardar(CLAVE_CLIENTES, clientes);
    }
    return cliente;
  }
}
