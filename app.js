(() => {
  const KEY = "ohchute-cart-v1";
  const $ = (s) => document.querySelector(s);
  const money = (n) => "$" + n.toFixed(2);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { cart = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  const byId = (id) => PRODUCTS.find(p => p.id === id);
  // drop stale items
  Object.keys(cart).forEach(id => { if (!byId(id) || !(cart[id] > 0)) delete cart[id]; });

  // ---- products
  $("#productGrid").innerHTML = PRODUCTS.map(p => `
    <article class="product">
      <div class="product-img">
        <picture>
          <source srcset="${esc(p.image)}.webp" type="image/webp">
          <img src="${esc(p.image)}.jpg" alt="${esc(p.alt)}" width="800" height="1000" loading="lazy">
        </picture>
      </div>
      <div class="product-body">
        <div class="tags">${p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <h3>${esc(p.name)}</h3>
        <p class="size">${esc(p.size)}</p>
        <p class="desc">${esc(p.description)}</p>
        <div class="buy">
          <span class="price">${money(p.price)}</span>
          <button class="btn btn-primary add" data-id="${esc(p.id)}" aria-label="Add ${esc(p.name)} to cart">Add to cart</button>
        </div>
      </div>
    </article>`).join("");

  // ---- cart
  const drawer = $("#drawer"), overlay = $("#overlay");
  let lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false; document.body.classList.add("no-scroll");
    drawer.focus();
  }
  function closeCart() {
    drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true");
    overlay.hidden = true; document.body.classList.remove("no-scroll");
    $("#checkoutMsg").textContent = "";
    if (lastFocus) lastFocus.focus();
  }
  function render() {
    const ids = Object.keys(cart);
    let count = 0, total = 0;
    $("#cartItems").innerHTML = ids.length ? ids.map(id => {
      const p = byId(id), q = cart[id]; count += q; total += q * p.price;
      return `<li class="ci">
        <img src="${esc(p.image)}.jpg" alt="${esc(p.alt)}" width="64" height="80">
        <div class="ci-info">
          <strong>${esc(p.name)}</strong>
          <span class="muted">${money(p.price)} each</span>
          <div class="qty" role="group" aria-label="Quantity for ${esc(p.name)}">
            <button data-act="dec" data-id="${esc(id)}" aria-label="Decrease quantity">−</button>
            <span aria-live="polite">${q}</span>
            <button data-act="inc" data-id="${esc(id)}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="ci-right"><strong>${money(q * p.price)}</strong>
          <button class="link" data-act="rm" data-id="${esc(id)}">Remove</button></div>
      </li>`;
    }).join("") : `<li class="empty">Your cart is empty.</li>`;
    $("#cartCount").textContent = count;
    $("#cartTotal").textContent = money(total);
    $("#checkout").disabled = !ids.length;
    save();
  }
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  document.addEventListener("click", (e) => {
    const add = e.target.closest(".add");
    if (add) { const id = add.dataset.id; cart[id] = (cart[id] || 0) + 1; render(); toast(byId(id).name + " added to cart"); return; }
    const b = e.target.closest("[data-act]");
    if (b) {
      const id = b.dataset.id;
      if (b.dataset.act === "inc") cart[id]++;
      if (b.dataset.act === "dec") { cart[id]--; if (cart[id] <= 0) delete cart[id]; }
      if (b.dataset.act === "rm") delete cart[id];
      render();
    }
  });
  $("#cartOpen").addEventListener("click", openCart);
  $("#cartClose").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) closeCart(); });
  $("#checkout").addEventListener("click", () => {
    $("#checkoutMsg").textContent = "Checkout is coming soon! Online ordering isn't open yet — thank you for your interest.";
  });

  // ---- nav, newsletter
  $("#navToggle").addEventListener("click", () => {
    const n = $("#nav"), open = n.classList.toggle("open");
    $("#navToggle").setAttribute("aria-expanded", open);
  });
  document.querySelectorAll("#nav a").forEach(a => a.addEventListener("click", () => { $("#nav").classList.remove("open"); $("#navToggle").setAttribute("aria-expanded", false); }));
  $("#newsletterForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#email").value.trim(), msg = $("#nlMsg");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { msg.textContent = "Please enter a valid email address."; msg.className = "nl-msg err"; return; }
    msg.textContent = "Thanks for subscribing! (Demo only: no email was stored.)"; msg.className = "nl-msg ok";
    e.target.reset();
  });
  $("#year").textContent = new Date().getFullYear();
  render();
})();
