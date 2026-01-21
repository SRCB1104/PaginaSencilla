const WHATSAPP = "5216624791145";

const cartBtn = document.getElementById("cartBtn");
const cartClose = document.getElementById("cartClose");
const cartEl = document.getElementById("cart");
const overlay = document.getElementById("overlay");

const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartClear = document.getElementById("cartClear");
const cartCheckout = document.getElementById("cartCheckout");

const waFloat = document.getElementById("waFloat");
const addBtns = document.querySelectorAll(".add");
const singleWAs = document.querySelectorAll(".single");

let cart = JSON.parse(localStorage.getItem("cart_simple") || "[]");

function money(n){
  return `$${Number(n).toLocaleString("es-MX")} MXN`;
}

function waLink(msg){
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

function openCart(){
  cartEl.classList.add("open");
  overlay.hidden = false;
}

function closeCartPanel(){
  cartEl.classList.remove("open");
  overlay.hidden = true;
}

function save(){
  localStorage.setItem("cart_simple", JSON.stringify(cart));
}

function totalQty(){
  return cart.reduce((a,i)=>a+i.qty,0);
}

function totalPrice(){
  return cart.reduce((a,i)=>a+i.qty*i.price,0);
}

function addItem(name, price){
  price = Number(price);
  const found = cart.find(x => x.name === name);
  if(found) found.qty += 1;
  else cart.push({name, price, qty:1});
  save();
  render();
}

function inc(name){ change(name, +1); }
function dec(name){ change(name, -1); }

function change(name, delta){
  const it = cart.find(x => x.name === name);
  if(!it) return;
  it.qty += delta;
  if(it.qty <= 0) cart = cart.filter(x => x.name !== name);
  save();
  render();
}

function removeItem(name){
  cart = cart.filter(x => x.name !== name);
  save();
  render();
}

function clearAll(){
  cart = [];
  save();
  render();
}

function checkoutLink(){
  if(cart.length === 0) return waLink("Hola, quiero informaciOn sobre sus perfumes");

  const lines = cart.map(i => `- ${i.name} x${i.qty} (${money(i.price)})`).join("\n");
  const msg = `Hola, quiero comprar:\n${lines}\n\nTotal: ${money(totalPrice())}\n¿Tienes disponibilidad?`;
  return waLink(msg);
}

function render(){
  cartCount.textContent = totalQty();
  cartTotal.textContent = money(totalPrice());
  cartCheckout.href = checkoutLink();

  cartItems.innerHTML = "";

  if(cart.length === 0){
    cartItems.innerHTML = `<p style="color:#777;">Tu carrito esta vacio</p>`;
    return;
  }

  cart.forEach(i => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="item-top">
        <span>${i.name}</span>
        <span>${money(i.price)}</span>
      </div>
      <div class="item-bottom">
        <div class="qty">
          <button data-a="dec" data-n="${i.name}">-</button>
          <strong>${i.qty}</strong>
          <button data-a="inc" data-n="${i.name}">+</button>
        </div>
        <button class="remove" data-a="rm" data-n="${i.name}">Quitar</button>
      </div>
    `;
    cartItems.appendChild(div);
  });
}

// WhatsApp flotante
waFloat.href = waLink("Hola, quiero informacion sobre sus perfumes");

// WhatsApp por producto
singleWAs.forEach(a => {
  const name = a.dataset.name;
  const price = a.dataset.price;
  a.href = waLink(`Hola, me interesa ${name} en ${money(price)}. ¿Tienes disponibilidad?`);
});

// Eventos
cartBtn.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCartPanel);
overlay.addEventListener("click", closeCartPanel);

cartClear.addEventListener("click", clearAll);

addBtns.forEach(b => {
  b.addEventListener("click", () => {
    addItem(b.dataset.name, b.dataset.price);
    openCart();
  });
});

cartItems.addEventListener("click", (e) => {
  const t = e.target;
  if(!(t instanceof HTMLElement)) return;

  const a = t.dataset.a;
  const n = t.dataset.n;
  if(!a || !n) return;

  if(a === "inc") inc(n);
  if(a === "dec") dec(n);
  if(a === "rm") removeItem(n);
});

render();
