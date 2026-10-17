# Sistema del Establo del Yogurt — Refactorización con principios SOLID

Proyecto académico de **diseño detallado de software**. El sistema original funcionaba
como un único archivo `script.js` monolítico (452 líneas) donde persistencia, lógica de
negocio, validaciones, autenticación y manipulación del DOM estaban mezcladas. En esta
entrega se reorganizó el código en capas y clases aplicando:

1. **SRP** — Separar responsabilidades en clases diferentes.
2. **DIP** — Usar interfaces (contratos) para desacoplar.
3. **Alta cohesión** — Agrupar funcionalidades relacionadas.
4. **Bajo acoplamiento** — Depender de abstracciones, no de concreciones.

> **La funcionalidad se conserva exactamente igual** (misma interfaz, mismos flujos y
> mensajes). Lo que cambió es la **estructura interna** del código.

---

## 1. Punto de partida: el problema del "God Object"

Antes, todo vivía en `script.js`. Una sola unidad concentraba responsabilidades muy
distintas, lo que significa **muchas razones para cambiar** (violación directa de SRP) y
un **acoplamiento duro** a `localStorage` y al DOM (violación de DIP).

| Responsabilidad mezclada en `script.js` | Consecuencia |
|---|---|
| Persistencia con `localStorage` + `JSON.parse/stringify` | Imposible cambiar de almacenamiento sin editar toda la lógica |
| Reglas de venta (carrito, totales, stock) | Difícil de probar sin abrir el navegador |
| Validación de RUC y registro de clientes | Código entrelazado con el render |
| Autenticación y roles | Usuarios quemados dentro de las funciones de UI |
| Renderizado del DOM (10 pantallas) | Cambiar un `id` obliga a tocar la lógica |
| Navegación entre páginas | Sin separación entre "qué página" y "qué se pinta" |

**Ejemplo del acoplamiento original** (todo en una función):

```js
function confirmarTransaccion(){
  // ...valida...
  carrito.forEach(c=>{
    const prod = productos.find(p=>p.id===c.id);
    prod.stock -= c.cantidad;        // regla de negocio
  });
  guardar('eyo_productos', productos); // persistencia concreta
  // ...arma la venta...
  renderComprobante(venta);            // render de UI
  irPaso(3);                           // navegación
}
```

Una función con cuatro razones para cambiar: negocio, persistencia, presentación y
navegación.

---

## 2. Arquitectura propuesta (capas)

La dependencia siempre apunta **hacia las abstracciones**. Los servicios no saben de
`localStorage` ni del DOM; las vistas no saben de reglas de negocio.

```
                         ┌──────────────────────────────────────┐
                         │   UI (views.js / app.js)             │
                         │   Solo lee el DOM y delega           │
                         └───────────────┬──────────────────────┘
                                         │ usa
                                         ▼
                         ┌──────────────────────────────────────┐
                         │   SERVICES                           │
                         │   AuthService, ProductoService,      │
                         │   ClienteService, VentaService,      │
                         │   DashboardService, ProduccionService│
                         └───────┬───────────────────┬──────────┘
                                 │ depende de         │ depende de
                                 ▼                     ▼
              ┌──────────────────────────┐   ┌──────────────────────────┐
              │  CORE / CONTRATOS        │   │  CORE / ENTITIES         │
              │  IRepository             │   │  Producto, Cliente,      │
              │  INotifier               │   │  Venta, LoteProduccion   │
              │  IAuthenticator          │   └──────────────────────────┘
              └────────────▲─────────────┘
                           │ implementan
        ┌──────────────────┴─────────────────────────────┐
        │  INFRASTRUCTURE                                │
        │  LocalStorageRepository, ToastNotifier,        │
        │  InMemoryAuthService                           │
        └────────────────────────────────────────────────┘

  app.js (Composition Root) es el único lugar donde se unen
  las concreciones con las abstracciones (inyección de dependencias).
```

**Regla de oro:** las flechas de dependencia apuntan de las capas externas
(infraestructura/UI) hacia los contratos del núcleo. Nunca al revés.

---

## 3. Estructura del proyecto

```
web/
├── Sistema_Establo_Yogurt.html      # Vistas HTML (sin cambios de diseño)
├── style.css                        # Estilos (sin cambios)
├── script.js                        # Respaldo del código original (ya no se usa)
├── README.md                        # Este documento
└── js/
    ├── core/                        # Núcleo estable (abstracciones)
    │   ├── interfaces.js            # IRepository, INotifier, IAuthenticator
    │   └── entities.js              # Producto, Cliente, Venta, LoteProduccion
    ├── infrastructure/              # Implementaciones concretas (adaptadores)
    │   ├── LocalStorageRepository.js
    │   ├── ToastNotifier.js
    │   └── InMemoryAuthService.js
    ├── services/                    # Reglas de negocio (una por dominio)
    │   ├── AuthService.js
    │   ├── ProductoService.js
    │   ├── ClienteService.js
    │   ├── VentaService.js
    │   ├── DashboardService.js
    │   └── ProduccionService.js
    └── ui/                          # Presentación
        ├── views.js                 # LoginView, NavegacionView, DashboardView, ...
        └── app.js                   # Composition Root + API global del HTML
```

### Responsabilidad de cada archivo

| Archivo | Única responsabilidad |
|---|---|
| `core/interfaces.js` | Declarar los contratos que desacoplan las capas |
| `core/entities.js` | Modelar los conceptos del dominio y sus datos |
| `infrastructure/LocalStorageRepository.js` | Persistir datos en `localStorage` |
| `infrastructure/ToastNotifier.js` | Mostrar mensajes tipo toast |
| `infrastructure/InMemoryAuthService.js` | Proveer usuarios y validar credenciales |
| `services/AuthService.js` | Reglas de sesión y roles |
| `services/ProductoService.js` | Catálogo y stock de productos |
| `services/ClienteService.js` | Validación de RUC y registro de clientes |
| `services/VentaService.js` | Carrito, validaciones y registro de ventas |
| `services/DashboardService.js` | Cálculo de indicadores del panel |
| `services/ProduccionService.js` | Cálculo de merma (RN-03) y lotes |
| `ui/views.js` | Leer el DOM, pintar y delegar en los servicios |
| `ui/app.js` | Instanciar, inyectar dependencias y exponer la API del HTML |

---

## 4. Principio 1 — SRP (Single Responsibility Principle)

> *Una clase debe tener una sola razón para cambiar.*

Cada clase del refactor tiene **una única razón de cambio**. Comparación:

| Antes (en `script.js`) | Después (clase) | Razón única para cambiar |
|---|---|---|
| `guardarProducto` + `renderProductos` + `editarProducto` + `eliminarProducto` | `ProductoService` | Reglas de catálogo/stock |
| `renderProductos`, `renderCarrito`, `renderComprobante`… | `ProductoView`, `VentaView`… | Cómo se muestra en pantalla |
| `cargar` / `guardar` | `LocalStorageRepository` | Cómo se persiste |
| `intentarLogin` / `cerrarSesion` | `AuthService` | Reglas de sesión |
| `validarDatosCliente` | `ClienteService` | Validación de RUC |
| `registrarProduccion` | `ProduccionService` | Cálculo de merma |
| `irPagina` + `mostrarToast` | `NavegacionView` + `ToastNotifier` | Navegación / mensajes |

**Ejemplo de separación real** — una venta ahora se divide así:

```js
// VentaService: SOLO reglas de negocio (no toca el DOM)
registrarVenta({ pago, comprobante, cliente, vendedor }) {
  for (const item of this.carrito) {
    const producto = this.productoService.buscarPorId(item.id);
    if (!producto || producto.stock < item.cantidad) {
      this.notificador.error(`Stock insuficiente para ${item.nombre}.`);
      return null;
    }
  }
  this.productoService.descontarStock(this.carrito);
  // ...crea y persiste la venta...
}
```

```js
// VentaView: SOLO presentación (no calcula totales ni descuenta stock)
confirmarTransaccion() {
  const aprobada = this.ventaService.validarVenta({ /* ... */ });
  if (!aprobada) return;
  const venta = this.ventaService.registrarVenta({ /* ... */ });
  if (!venta) return;
  this.renderComprobante(venta);   // delega el render
  this.irPaso(3);
}
```

---

## 5. Principio 2 — DIP (Dependency Inversion Principle)

> *Depende de abstracciones, no de concreciones.*

JavaScript no tiene interfaces nativas, así que se **simulan con clases base** cuyos
métodos lanzan error si no se sobrescriben (`core/interfaces.js`):

```js
class IRepository {
  guardar(clave, valor) { throw new Error('IRepository.guardar() no está implementado.'); }
  cargar(clave, valorPorDefecto) { throw new Error('IRepository.cargar() no está implementado.'); }
  eliminar(clave) { throw new Error('IRepository.eliminar() no está implementado.'); }
}
```

Los servicios **reciben** estas abstracciones por constructor (inyección de dependencias):

```js
class VentaService {
  constructor(repositorio, productoService, clienteService, notificador) {
    this.repositorio = repositorio;        // IRepository (no sabe que es localStorage)
    this.notificador = notificador;        // INotifier   (no sabe que es un toast)
    // ...
  }
}
```

Las concreciones las implementan:

```js
class LocalStorageRepository extends IRepository { /* ... */ }
class ToastNotifier extends INotifier { /* ... */ }
```

Y el **Composition Root** (`app.js`) es el único punto donde se conectan:

```js
const repositorio = new LocalStorageRepository();   // concreción
const notificador = new ToastNotifier();            // concreción
const ventaService = new VentaService(repositorio, productoService, clienteService, notificador);
```

**Inversión lograda:** antes `script.js` llamaba directamente a `localStorage`; ahora el
servicio depende de `IRepository` y es `app.js` quien decide la implementación.

---

## 6. Principio 3 — Alta cohesión

> *Lo que está relacionado, vive junto.*

La organización es **por dominio**, no por tipo de archivo:

- Todo lo de **productos**: `ProductoService` + `ProductoView`.
- Todo lo de **ventas**: `VentaService` + `VentaView` + `VentasHistorialView`.
- Todo lo de **producción**: `ProduccionService` + `ProduccionView`.
- Todo lo de **autenticación**: `AuthService` + `InMemoryAuthService` + `LoginView`.

`DashboardService` reutiliza `ProductoService` y `VentaService` en lugar de volver a
leer la persistencia por su cuenta: los indicadores quedan en un solo lugar.

---

## 7. Principio 4 — Bajo acoplamiento

> *Depender de abstracciones, no de concreciones.*

Gracias a DIP, se pueden cambiar piezas completas **sin tocar los servicios ni las vistas**:

| Si quiero cambiar… | Solo creo/edito… | Servicios afectados |
|---|---|---|
| `localStorage` por una API REST | Una clase `ApiRestRepository extends IRepository` | **Ninguno** |
| El toast por `alert()` o notificaciones nativas | Una clase `AlertNotifier extends INotifier` | **Ninguno** |
| Usuarios fijos por una base de datos | Una clase `BaseDeDatosAuth extends IAuthenticator` | **Ninguno** |

### Ejemplo práctico: persistir en una API REST

```js
class ApiRestRepository extends IRepository {
  async guardar(clave, valor) {
    await fetch(`/api/${clave}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(valor)
    });
  }
  async cargar(clave, valorPorDefecto) {
    const r = await fetch(`/api/${clave}`);
    return r.ok ? await r.json() : valorPorDefecto;
  }
  async eliminar(clave) {
    await fetch(`/api/${clave}`, { method: 'DELETE' });
  }
}
```

Y en `app.js` se cambia **una sola línea**:

```js
const repositorio = new ApiRestRepository();   // antes: new LocalStorageRepository()
```

Ningún servicio ni vista necesita modificarse.

---

## 8. Diagrama de secuencia — Flujo de venta

```
Usuario    VentaView          VentaService        ProductoService    IRepository
   |           |                    |                    |                |
   | clic prod |                    |                    |                |
   |---------->| seleccionarProducto|                    |                |
   |           |------------------->| buscarPorId        |                |
   |           |<-------------------| producto           |                |
   | clic agregar                   |                    |                |
   |---------->| agregarAlCarrito   |                    |                |
   |           |------------------->| valida stock       |                |
   |           |<-------------------| ok                 |                |
   | clic confirmar                 |                    |                |
   |---------->| confirmarTransaccion                    |                |
   |           |------------------->| validarVenta       |                |
   |           |------------------->| registrarVenta     |                |
   |           |                    |------------------->| descontarStock |
   |           |                    |                    |--------------->| guardar
   |           |                    |------------------------------------>| guardar
   |           |<-------------------| venta              |                |
   |           | renderComprobante  |                    |                |
   |<----------| comprobante        |                    |                |
```

---

## 9. Modelo de dominio (`core/entities.js`)

| Entidad | Campos |
|---|---|
| `Producto` | `id`, `nombre`, `precio`, `stock` |
| `Cliente` | `ruc`, `razon`, `fecha` |
| `Venta` | `fecha`, `items`, `pago`, `comprobante`, `cliente`, `total`, `vendedor` |
| `LoteProduccion` | `productoId`, `productoNombre`, `cantidadEsperada`, `cantidadReal`, `insumos`, `merma`, `fecha` |

Las entidades exponen métodos cohesivos (`hayStock()`, `permiteCantidad()`,
`stockBajo()`) y `aObjetoPlano()` para serializar. El formato de datos guardado es
**idéntico** al original (mismas claves de `localStorage`: `eyo_productos`,
`eyo_clientes`, `eyo_ventas`), por lo que los datos existentes siguen funcionando.

---

## 10. Cambios técnicos menores (y por qué no alteran la funcionalidad)

1. **Código muerto eliminado:** `seleccionarPago` tenía un `querySelectorAll(...).forEach(e=>{})`
   vacío. Se eliminó; el resultado visual es el mismo.
2. **Página de usuarios dinámica:** antes las filas `admin`/`vendedor` estaban escritas a
   mano en el HTML. Ahora `UsuariosView` las pinta desde `AuthService.listarUsuarios()`.
   El contenido mostrado es idéntico.
3. **Lotes de producción persistidos:** el original solo mostraba el toast ("simulación de
   guardado"). Ahora el lote se guarda en `eyo_lotes` además de mostrar el mismo mensaje.
   No cambia nada visible para el usuario.
4. **`script.js` se conserva** como respaldo del código anterior; el HTML ya no lo carga.

---

## 11. Cómo ejecutar

No requiere compilación ni dependencias. Basta con abrir:

```
web/Sistema_Establo_Yogurt.html
```

Credenciales de prueba:

| Rol | Usuario | Clave |
|---|---|---|
| Administrador | `admin` | `admin123` |
| Vendedor | `vendedor` | `venta123` |

> Si el navegador bloquea algo por abrir el archivo directamente (`file://`), usar un
> servidor local simple: `python -m http.server` dentro de la carpeta `web`.

### Checklist funcional (comportamiento esperado)

- [x] Login con ambos usuarios; el botón "Usuarios" solo aparece para admin.
- [x] Panel general: productos registrados, ventas y total vendido; tabla de stock bajo.
- [x] Productos: agregar, editar, eliminar (con confirmación) y estados de stock.
- [x] Nueva venta en 3 pasos: producto → pago/comprobante → comprobante imprimible.
- [x] Factura exige RUC de 11 dígitos y razón social; el cliente se registra una sola vez.
- [x] El stock se descuenta al confirmar y se refleja en Productos y Panel.
- [x] Historial de ventas y Clientes registrados.
- [x] Producción: calcula merma (`esperada − real`, nunca negativa) y limpia el formulario.

---

## 12. Verificación automática realizada

Se ejecutó una **prueba de humo con Node.js** que simula `document`, `localStorage` y
`window`, carga los 13 archivos JS y recorre los flujos reales.

- Comprobación de sintaxis: `node --check` → **13/13 archivos OK**.
- Prueba funcional: **48/48 aserciones pasaron**, cubriendo autenticación, CRUD de
  productos, validación de RUC, flujo completo de venta (incluido descuento de stock y
  numeración de comprobante), dashboard, merma RN-03, renderizado de vistas, guard de rol
  y navegación.

---

## 13. Trazabilidad: requisito → evidencia

| Requisito de la tarea | Dónde se evidencia |
|---|---|
| **SRP** | `services/*` (una regla de negocio cada uno) vs. `ui/views.js` (solo render) vs. `infrastructure/*` (solo adaptadores) |
| **DIP** | `core/interfaces.js` + constructores de servicios que reciben `IRepository`/`INotifier`/`IAuthenticator` |
| **Alta cohesión** | Organización por dominio: Producto, Venta, Cliente, Producción, Dashboard, Auth |
| **Bajo acoplamiento** | `app.js` como único punto de inyección; cambiar persistencia/notificación/usuarios no toca servicios |

---

## 14. Bitácora de esta sesión

1. Se analizó `script.js` (452 líneas) e identificaron sus responsabilidades mezcladas.
2. Se aprobó con el interesado el lenguaje (JavaScript ES6 sin build), conservar la
   funcionalidad exacta y entregar código + README.
3. Se creó la estructura de carpetas `js/core`, `js/infrastructure`, `js/services`, `js/ui`.
4. Se implementaron contratos, entidades, infraestructura, servicios y vistas.
5. Se actualizó `Sistema_Establo_Yogurt.html` para cargar los 13 scripts en orden de
   dependencia.
6. Se verificó con `node --check` (13/13) y con una prueba de humo (48/48).
7. Se documentó todo en este README.

---

*Proyecto académico — Diseño detallado de software. Sistema del Establo del Yogurt.*
