# AGENTS.md — Contexto para agentes de IA

Este archivo permite que cualquier agente entienda el proyecto y pueda continuar el
trabajo sin contexto previo. **Léelo antes de modificar código.**

---

## 1. Qué es este proyecto

Sistema de gestión para el **Establo del Yogurt** (productos, ventas, stock, clientes y
producción). Es un **proyecto académico de diseño detallado de software**. El objetivo
principal ya cumplido fue **refactorizar un `script.js` monolítico aplicando SOLID**:
SRP, DIP, alta cohesión y bajo acoplamiento.

La aplicación se ejecuta **sin build, sin framework y sin dependencias**. Es HTML + CSS +
JavaScript ES6 puro.

---

## 2. Restricciones técnicas (NO romper)

- **Sin herramientas de build** ni `npm install`: debe funcionar abriendo el HTML.
- **Sin ES Modules** (`import`/`export`): los archivos se cargan con `<script>` clásicos
  y las clases quedan en el ámbito global. Motivo: funcionar bajo `file://`.
- **Orden de carga obligatorio** en `Sistema_Establo_Yogurt.html`:
  `core/interfaces` → `core/entities` → `infrastructure/*` → `services/*` → `ui/views`
  → `ui/app`. `app.js` debe ser el último.
- **Idioma del código y comentarios: español.** Mantener el estilo existente (banners
  `/* ==== ... ==== */` por archivo).
- **No agregar dependencias externas** ni cambiar el diseño visual (mismos `id` y clases
  del HTML que usan las vistas).
- Los eventos del HTML usan `onclick`/`oninput` con funciones globales. Esas funciones se
  exponen **solo** en `js/ui/app.js` como `window.<nombre>`.

---

## 3. Arquitectura y reglas de dependencia

Capas (de fuera hacia dentro). Las dependencias **siempre apuntan a las abstracciones**:

```
UI (views.js, app.js)
      │ usa
      ▼
SERVICES (Auth, Producto, Cliente, Venta, Dashboard, Produccion)
      │ depende de abstracciones
      ▼
CORE (interfaces.js: IRepository, INotifier, IAuthenticator  +  entities.js)
      ▲ implementan
      │
INFRASTRUCTURE (LocalStorageRepository, ToastNotifier, InMemoryAuthService)
```

Reglas que un agente **debe respetar** al extender:

1. **Servicios** (`js/services/*`): contienen SOLO reglas de negocio. **Prohibido** tocar
   el DOM (`document`, `window`) o llamar a `localStorage`/`JSON` directamente. Reciben
   sus dependencias por constructor.
2. **Vistas** (`js/ui/views.js`): SOLO leen el DOM, pintan y delegan en los servicios.
   **Prohibido** poner reglas de negocio o acceso a persistencia.
3. **Infraestructura** (`js/infrastructure/*`): únicos lugares que conocen
   `localStorage`, el toast o las credenciales.
4. **Nuevos contratos**: agregar el método a la interfaz en `js/core/interfaces.js` con
   `throw new Error('... no está implementado.')`.
5. **Inyección**: toda instancia y conexión se hace en `js/ui/app.js` (Composition Root).
   No instanciar concreciones dentro de servicios o vistas.

---

## 4. Mapa de archivos

| Ruta | Responsabilidad |
|---|---|
| `Sistema_Establo_Yogurt.html` | Vistas HTML de todas las pantallas |
| `style.css` | Estilos |
| `script.js` | **Respaldo del código original monolítico. NO se usa. No editar.** |
| `README.md` | Documentación para personas (teoría SOLID, diagramas, justificación) |
| `AGENTS.md` | Este archivo (contexto para agentes) |
| `js/core/interfaces.js` | Contratos: `IRepository`, `INotifier`, `IAuthenticator` |
| `js/core/entities.js` | Entidades: `Producto`, `Cliente`, `Venta`, `LoteProduccion` |
| `js/infrastructure/LocalStorageRepository.js` | Persistencia en `localStorage` |
| `js/infrastructure/ToastNotifier.js` | Mensajes toast |
| `js/infrastructure/InMemoryAuthService.js` | Usuarios y credenciales |
| `js/services/AuthService.js` | Sesión y roles |
| `js/services/ProductoService.js` | Catálogo y stock |
| `js/services/ClienteService.js` | Validación de RUC y registro de clientes |
| `js/services/VentaService.js` | Carrito, validaciones, registro y descuento de stock |
| `js/services/DashboardService.js` | Indicadores del panel |
| `js/services/ProduccionService.js` | Merma (RN-03) y lotes |
| `js/ui/views.js` | `LoginView`, `NavegacionView`, `DashboardView`, `ProductoView`, `ClienteView`, `VentasHistorialView`, `VentaView`, `ProduccionView`, `UsuariosView` |
| `js/ui/app.js` | Composition Root + API global para el HTML |
| `tests/smoke-solid.js` | Prueba de humo con DOM simulado (48 aserciones) |

---

## 5. Comandos

```powershell
# Ejecutar la app: abrir el HTML (o servir la carpeta)
#   C:\Users\benny\Desktop\web\Sistema_Establo_Yogurt.html
python -m http.server        # alternativa recomendada dentro de la carpeta web

# Verificar sintaxis de todos los JS (desde la raíz del proyecto)
Get-ChildItem -Recurse -Filter *.js js | ForEach-Object { node --check $_.FullName }

# Ejecutar la prueba de humo (desde la raíz del proyecto)
node tests/smoke-solid.js
```

**Verificación obligatoria tras cualquier cambio:** ejecutar `node tests/smoke-solid.js`
y confirmar `48 pasadas, 0 fallidas` (o actualizar el test si se agrega funcionalidad).

Credenciales: `admin` / `admin123` (Administrador) y `vendedor` / `venta123` (Vendedor).

---

## 6. Estado actual (hecho)

- Refactor SOLID completo y funcional; comportamiento idéntico al original.
- 13 archivos JS en 4 capas; `node --check` OK; prueba de humo 48/48.
- Documentación: `README.md` (personas) y este `AGENTS.md` (agentes).

### Persistencia (`localStorage`)

| Clave | Contenido |
|---|---|
| `eyo_productos` | Lista de productos (default: 5 productos de ejemplo) |
| `eyo_clientes` | Clientes con RUC |
| `eyo_ventas` | Ventas registradas |
| `eyo_lotes` | Lotes de producción (agregado en el refactor) |

> El formato de datos es idéntico al original para no romper compatibilidad.

---

## 7. Decisiones y "gotchas"

- **Interfaces simuladas:** JS no tiene interfaces; se usan clases base que lanzan error.
  No son validación en runtime, son contrato/documentación.
- **Datos planos vs entidades:** los servicios leen/escriben objetos planos (JSON), pero
  crean instancias de entidad al guardar y serializan con `aObjetoPlano()`. Las entidades
  NO tienen métodos en los datos ya persistidos.
- **`ToastNotifier` toca el DOM a propósito:** es un adaptador de infraestructura que
  implementa `INotifier`; así los servicios quedan libres de DOM.
- **Mensajes exactos:** los textos de validación/toast deben conservarse iguales; hay
  aserciones que dependen de ellos.
- **Navegación:** `NavegacionView.irA(pagina, rutas)` aplica el guard de rol
  (solo admin accede a `usuarios`) y luego llama a la ruta. Las rutas se definen en `app.js`.
- **`script.js`** es solo respaldo histórico; no debe cargarse ni editarse.

---

## 8. Trabajo pendiente / posibles siguientes pasos

Nada bloqueante. Ideas si se continúa:

- [ ] Tests unitarios reales por servicio (el actual es una prueba de humo integral).
- [ ] `ApiRestRepository extends IRepository` para persistir en backend (ejemplo en `README.md`).
- [ ] Vista de historial de lotes de producción (hoy se guardan pero no se listan).
- [ ] Completar gestión de usuarios (crear/editar) más allá de solo listarlos.
- [ ] Validar RUC con dígito verificador (hoy solo valida 11 dígitos numéricos).

---

*Proyecto académico — Diseño detallado de software. Sistema del Establo del Yogurt.*
