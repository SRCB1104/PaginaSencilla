const NUMERO_WHATSAPP = "5216624791145";
const CLAVE_STORAGE = "carrito_simple";

const btnAbrirCarrito = document.getElementById("cartBtn");
const btnCerrarCarrito = document.getElementById("cartClose");
const panelCarrito = document.getElementById("cart");
const overlay = document.getElementById("overlay");

const contadorCarrito = document.getElementById("cartCount");
const listaCarrito = document.getElementById("cartItems");
const totalCarrito = document.getElementById("cartTotal");
const btnVaciar = document.getElementById("cartClear");
const btnComprar = document.getElementById("cartCheckout");

const btnWhatsappFlotante = document.getElementById("waFloat");

const botonesAgregar = document.querySelectorAll(".add");
const botonesWhatsappProducto = document.querySelectorAll(".single");

let carrito = JSON.parse(localStorage.getItem(CLAVE_STORAGE) || "[]");

const dinero = (n) => `$${Number(n).toLocaleString("es-MX")} MXN`;

const linkWhatsapp = (mensaje) =>
  `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

const guardar = () =>
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(carrito));

const totalCantidad = () =>
  carrito.reduce((acum, p) => acum + p.cantidad, 0);

const totalPrecio = () =>
  carrito.reduce((acum, p) => acum + p.cantidad * p.precio, 0);

function abrirCarrito() {
  panelCarrito.classList.add("open");
  overlay.hidden = false;
}

function cerrarCarrito() {
  panelCarrito.classList.remove("open");
  overlay.hidden = true;
}

// ===== Logica Carrito =====
function agregarProducto(nombre, precio) {
  precio = Number(precio);

  const producto = carrito.find(p => p.nombre === nombre);

  if (producto) {
    producto.cantidad += 1;
  } else {
    carrito.push({ nombre, precio, cantidad: 1 });
  }

  guardar();
  pintar();
}

function cambiarCantidad(nombre, cambio) {
  const producto = carrito.find(p => p.nombre === nombre);
  if (!producto) return;

  producto.cantidad += cambio;

  if (producto.cantidad <= 0) {
    carrito = carrito.filter(p => p.nombre !== nombre);
  }

  guardar();
  pintar();
}

function quitarProducto(nombre) {
  carrito = carrito.filter(p => p.nombre !== nombre);
  guardar();
  pintar();
}

function vaciarCarrito() {
  carrito = [];
  guardar();
  pintar();
}

function linkCompraCarrito() {
  if (carrito.length === 0) {
    return linkWhatsapp("Hola, quiero información sobre sus perfumes.");
  }

  const lista = carrito
    .map(p => `- ${p.nombre} x${p.cantidad} (${dinero(p.precio)})`)
    .join("\n");

  const mensaje =
    `Hola, quiero comprar:\n${lista}\n\n` +
    `Total: ${dinero(totalPrecio())}\n` +
    `¿Tienes disponibilidad?`;

  return linkWhatsapp(mensaje);
}

function pintar() {
  contadorCarrito.textContent = totalCantidad();
  totalCarrito.textContent = dinero(totalPrecio());
  btnComprar.href = linkCompraCarrito();

  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    listaCarrito.innerHTML = `<p style="color:#777;">Tu carrito está vacío</p>`;
    return;
  }

  carrito.forEach(p => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div class="item-top">
        <span>${p.nombre}</span>
        <span>${dinero(p.precio)}</span>
      </div>

      <div class="item-bottom">
        <div class="qty">
          <button data-accion="menos" data-nombre="${p.nombre}">-</button>
          <strong>${p.cantidad}</strong>
          <button data-accion="mas" data-nombre="${p.nombre}">+</button>
        </div>
        <button class="remove" data-accion="quitar" data-nombre="${p.nombre}">
          Quitar
        </button>
      </div>
    `;
    listaCarrito.appendChild(item);
  });
}

// ===== Config WhatsApp =====
btnWhatsappFlotante.href = linkWhatsapp("Hola, quiero información sobre sus perfumes.");

botonesWhatsappProducto.forEach(a => {
  const nombre = a.dataset.name;
  const precio = a.dataset.price;
  a.href = linkWhatsapp(`Hola, me interesa ${nombre} en ${dinero(precio)}. ¿Tienes disponibilidad?`);
});

// ===== Eventos =====
btnAbrirCarrito.addEventListener("click", abrirCarrito);
btnCerrarCarrito.addEventListener("click", cerrarCarrito);
overlay.addEventListener("click", cerrarCarrito);

btnVaciar.addEventListener("click", vaciarCarrito);

botonesAgregar.forEach(boton => {
  boton.addEventListener("click", () => {
    agregarProducto(boton.dataset.name, boton.dataset.price);
    abrirCarrito();
  });
});

listaCarrito.addEventListener("click", (e) => {
  const el = e.target;
  if (!(el instanceof HTMLElement)) return;

  const accion = el.dataset.accion;
  const nombre = el.dataset.nombre;
  if (!accion || !nombre) return;

  if (accion === "mas") cambiarCantidad(nombre, +1);
  if (accion === "menos") cambiarCantidad(nombre, -1);
  if (accion === "quitar") quitarProducto(nombre);
});

pintar();
