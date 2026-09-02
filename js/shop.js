/**
 * Nike Basketball Shop – products, cart + checkout
 * Uses localStorage for cart persistence.
 */
(function () {
  "use strict";

  const CART_KEY = "nike_bb_cart";
  const COUPON_KEY = "nike_bb_coupon";

  const PRODUCTS = [
    {
      id: "lebron-xxi",
      name: "Nike LeBron XXI",
      price: 1,
      category: "signature",
      status: "new",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      description: "Built for LeBron-level power and court coverage. A cushioned midsole and locked-in fit help you drive, stop, and finish through contact.",
    },
    {
      id: "kobe-8-protro",
      name: "Nike Kobe 8 Protro",
      price: 1,
      category: "signature",
      status: "popular",
      image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80",
      description: "Lightweight, low-to-the-ground Kobe feel with a scaled Engineered Mesh upper for cut-and-go speed.",
    },
    {
      id: "kd17",
      name: "Nike KD17",
      price: 1,
      category: "signature",
      status: "",
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
      description: "Kevin Durant’s latest signature shoe for long strides, quick stops, and scoring from every level.",
    },
    {
      id: "giannis-freak-6",
      name: "Nike Giannis Freak 6",
      price: 1,
      category: "signature",
      status: "sale",
      image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80",
      description: "Designed for Giannis’s unique combination of size and speed, with cushioning for full-court runs.",
    },
    {
      id: "ja-2",
      name: "Nike Ja 2",
      price: 1,
      category: "elite",
      status: "new",
      image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
      description: "A bouncy, locked-in shoe for explosive first steps and sudden direction changes.",
    },
    {
      id: "sabrina-2",
      name: "Nike Sabrina 2",
      price: 1,
      category: "elite",
      status: "",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
      description: "Court feel and containment made for Sabrina’s downhill attack and playmaking.",
    },
    {
      id: "book-1",
      name: "Nike Book 1",
      price: 1,
      category: "elite",
      status: "popular",
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80",
      description: "Devin Booker’s first signature basketball shoe — stable, cushioned, and ready to score.",
    },
    {
      id: "gt-cut-3",
      name: "Nike G.T. Cut 3",
      price: 1,
      category: "elite",
      status: "new",
      image: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=800&q=80",
      description: "Elite-level traction and energy return for sharp cuts and high-tempo play.",
    },
  ];

  window.SHOP_PRODUCTS = PRODUCTS;

  /* ---------- helpers ---------- */
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(COUPON_KEY);
    updateCartCount();
  }

  function formatPeso(n) {
    return "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function cartSubtotal(cart) {
    return cart.reduce((s, i) => s + i.price * i.qty, 0);
  }

  function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = count;
    });
  }

  function showToast(msg) {
    let t = document.querySelector(".shop-toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "shop-toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("is-visible");
    setTimeout(() => t.classList.remove("is-visible"), 2500);
  }

  /* ---------- cart page ---------- */
  function renderCartPage() {
    const body = document.getElementById("cart-table-body");
    if (!body) return;

    const cart = getCart();
    if (!cart.length) {
      body.innerHTML = `<tr><td colspan="5" class="empty-cart">Your cart is empty. <a href="categories.html">Shop now</a></td></tr>`;
      setTotals(0, 0, 0);
      return;
    }

    body.innerHTML = cart
      .map(
        (item, idx) => `
      <tr data-idx="${idx}">
        <td class="product-col">
          <img src="${item.image || "img/products/product-1.jpg"}" alt="">
          <div class="p-title">
            <h5>${item.name}</h5>
          </div>
        </td>
        <td>${formatPeso(item.price)}</td>
        <td class="quan">
          <input type="number" min="1" max="20" value="${item.qty}" class="cart-qty" data-idx="${idx}">
        </td>
        <td>${formatPeso(item.price * item.qty)}</td>
        <td><a href="#" class="remove-item" data-idx="${idx}">×</a></td>
      </tr>`
      )
      .join("");

    const sub = cartSubtotal(cart);
    const discount = getDiscount(sub);
    setTotals(sub, 0, discount);

    body.querySelectorAll(".cart-qty").forEach((inp) => {
      inp.addEventListener("change", () => {
        const cart = getCart();
        const i = +inp.dataset.idx;
        cart[i].qty = Math.max(1, Math.min(20, +inp.value || 1));
        saveCart(cart);
        renderCartPage();
      });
    });

    body.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const cart = getCart();
        cart.splice(+btn.dataset.idx, 1);
        saveCart(cart);
        renderCartPage();
        showToast("Item removed");
      });
    });
  }

  function getDiscount(sub) {
    const code = (localStorage.getItem(COUPON_KEY) || "").toUpperCase();
    if (code === "HOOPS20") return Math.round(sub * 0.2 * 100) / 100;
    return 0;
  }

  function setTotals(sub, ship, disc) {
    const total = Math.max(0, sub + ship - disc);
    const el = (id, v) => {
      const n = document.getElementById(id);
      if (n) n.textContent = formatPeso(v);
    };
    el("cart-subtotal", sub);
    el("cart-shipping", ship);
    el("cart-discount", disc);
    el("cart-total", total);
  }

  /* ---------- checkout summary ---------- */
  function renderCheckoutSummary() {
    const box = document.getElementById("checkout-summary");
    if (!box) return;

    const cart = getCart();
    if (!cart.length) {
      box.innerHTML = `<p class="empty-cart">Cart is empty</p>`;
      return;
    }

    const sub = cartSubtotal(cart);
    const disc = getDiscount(sub);
    const total = Math.max(0, sub - disc);

    let html = cart
      .map(
        (i) => `
      <div class="cart-item">
        <span class="product-name">${i.name} × ${i.qty}</span>
        <p>${formatPeso(i.price * i.qty)}</p>
      </div>`
      )
      .join("");

    html += `
      <div class="cart-total">
        <span>Total</span>
        <p>${formatPeso(total)}</p>
      </div>`;
    box.innerHTML = html;
  }

  /* ---------- payment UI toggle ---------- */
  function setupPaymentToggle() {
    const gcashRadio = document.getElementById("pay-gcash");
    const codRadio = document.getElementById("pay-cod");
    const gcashNote = document.getElementById("gcash-note");
    const codNote = document.getElementById("cod-note");

    if (!gcashRadio || !codRadio) return;

    function sync() {
      const isGcash = gcashRadio.checked;
      if (gcashNote) gcashNote.hidden = !isGcash;
      if (codNote) codNote.hidden = isGcash;
    }

    gcashRadio.addEventListener("change", sync);
    codRadio.addEventListener("change", sync);
    sync();
  }

  /* ---------- PayMongo QR (GCash scan) ---------- */
  const PENDING_PAY_KEY = "nike_bb_pending_paymongo";
  let paymongoPoll = null;
  let orderFinished = false;

  function setPaymentStatus(state, message) {
    const el = document.getElementById("payment-status");
    if (!el) return;
    el.className = "payment-status status-" + state;
    const text = el.querySelector(".status-text");
    if (!text) return;
    if (message) text.textContent = message;
    else if (state === "pending") text.textContent = "Connecting to PayMongo…";
    else if (state === "processing") text.textContent = "Waiting for GCash scan…";
    else if (state === "success") text.textContent = "Payment successful ✓";
    else if (state === "failed") text.textContent = "Payment failed";
  }

  function stopPaymongoPoll() {
    if (paymongoPoll) {
      clearInterval(paymongoPoll);
      paymongoPoll = null;
    }
  }

  function openPaymongoOverlay(name, email, amount) {
    const overlay = document.getElementById("paymongo-overlay");
    if (!overlay) return;

    const customer = overlay.querySelector(".paymongo-customer");
    const amountEl = overlay.querySelector(".paymongo-amount");
    const qrImg = document.getElementById("gcash-qr");

    if (customer) customer.textContent = name + " · " + email;
    if (amountEl) amountEl.textContent = formatPeso(amount);
    if (qrImg) {
      qrImg.removeAttribute("src");
      qrImg.alt = "PayMongo QR code";
    }

    setPaymentStatus("pending", "Connecting to PayMongo…");
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeGcashQR() {
    stopPaymongoPoll();
    const overlay = document.getElementById("paymongo-overlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function buildOrderSnapshot(name, email, method, extras) {
    const extra = extras || {};
    const cart = extra.items || getCart();
    const sub = extra.sub != null ? extra.sub : cartSubtotal(cart);
    const discount = extra.discount != null ? extra.discount : getDiscount(sub);
    const total = extra.total != null ? extra.total : Math.max(0, sub - discount);
    return {
      name: name || extra.name || "Customer",
      email: email || extra.email || "",
      method: method || extra.method || "gcash",
      items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
      sub,
      discount,
      total,
      paymentIntentId: extra.paymentIntentId || "",
      clientKey: extra.clientKey || "",
      date: extra.date || Date.now(),
    };
  }

  function formatOrderDate(ts) {
    return new Date(ts).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function paymentLabel(method) {
    return method === "cod" ? "Cash on Delivery" : "GCash via PayMongo (paid)";
  }

  function setReceiptStatus(message) {
    const el = document.querySelector(".order-receipt-status");
    if (el) el.textContent = message || "";
  }

  /* ---------- EmailJS config ----------
   * 1) Include the SDK in your HTML (e.g. check-out.html), before shop.js:
   *      <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
   * 2) Fill in your own IDs from https://dashboard.emailjs.com/
   * 3) Your EmailJS template should reference the variable names used in
   *    templateParams below (to_name, to_email, order_date, payment,
   *    items, subtotal, discount, total, message).
   */
  const EMAILJS_PUBLIC_KEY = "oO7F91jSeX8mEcLvL";
  const EMAILJS_SERVICE_ID = "service_ace06e3";
  const EMAILJS_TEMPLATE_ID = "template_g5f6mzh";

  let emailjsReady = false;
  function ensureEmailJs() {
    if (emailjsReady) return true;
    if (typeof window.emailjs === "undefined") return false;
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    emailjsReady = true;
    return true;
  }

  async function sendOrderReceipt(order) {
    if (!order || !order.email) {
      setReceiptStatus("No email was provided, so a receipt was not sent.");
      return;
    }

    if (!ensureEmailJs()) {
      setReceiptStatus(
        "The order is complete, but the receipt could not be sent (EmailJS script not loaded)."
      );
      return;
    }

    setReceiptStatus("Sending a receipt to " + order.email + "…");

    const when = formatOrderDate(order.date);
    const paidWith = paymentLabel(order.method);
    const itemLines = (order.items || [])
      .map((i) => i.name + " × " + i.qty + " — " + formatPeso(i.price * i.qty))
      .join("\n");

    const templateParams = {
      to_name: order.name,
      to_email: order.email,
      order_date: when,
      payment: paidWith,
      items: itemLines || "(none)",
      subtotal: formatPeso(order.sub),
      discount: formatPeso(order.discount || 0),
      total: formatPeso(order.total),
      message:
        "Hi " +
        order.name +
        ",\n\nThank you for your Nike Basketball order.\n\n" +
        "Order date: " +
        when +
        "\nPayment: " +
        paidWith +
        "\n\nItems:\n" +
        (itemLines || "(none)") +
        "\n\nSubtotal: " +
        formatPeso(order.sub) +
        "\nDiscount: " +
        formatPeso(order.discount || 0) +
        "\nTotal: " +
        formatPeso(order.total) +
        "\n\nThis is your order receipt.",
    };

    try {
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      setReceiptStatus("A receipt with your order date, items, and payment was sent to " + order.email + ".");
      showToast("Receipt sent to " + order.email);
    } catch (err) {
      setReceiptStatus(
        "The order is complete, but the receipt email could not be sent. Check spam, or try again later."
      );
      console.error("EmailJS send failed:", err);
    }
  }

  function finishOrder(order) {
    if (orderFinished) return;
    orderFinished = true;
    const name = order.name;
    const method = order.method;
    stopPaymongoPoll();
    clearCart();
    sessionStorage.removeItem(PENDING_PAY_KEY);
    closeGcashQR();

    const form = document.getElementById("checkout-form");
    const success = document.getElementById("order-success");
    if (form) form.hidden = true;
    if (success) {
      success.hidden = false;
      const copy = success.querySelector(".order-success-copy");
      if (copy) {
        copy.textContent =
          method === "cod"
            ? `Thanks ${name}! Your order is confirmed. Pay cash on delivery.`
            : `Thanks ${name}! Your GCash payment was received through PayMongo.`;
      }
    }
    showToast("Order placed — cart cleared");
    sendOrderReceipt(order);
  }

  function startStatusPoll(order) {
    stopPaymongoPoll();
    paymongoPoll = setInterval(async () => {
      try {
        const data = await window.PaymongoGcash.getStatus(order.paymentIntentId, order.clientKey);
        if (data.status === "succeeded") {
          setPaymentStatus("success");
          finishOrder(order);
        } else if (data.status === "processing") {
          setPaymentStatus("processing", "Processing payment…");
        } else if (data.status === "awaiting_next_action") {
          setPaymentStatus("processing", "Waiting for GCash scan…");
        }
      } catch {
        /* keep showing QR; retry on next poll */
      }
    }, 3000);
  }

  async function startPaymongoGcash(order) {
    const name = order.name;
    const email = order.email;
    const amount = order.total;
    orderFinished = false;
    openPaymongoOverlay(name, email, amount);
    sessionStorage.setItem(PENDING_PAY_KEY, JSON.stringify(order));

    if (!window.PaymongoGcash) {
      setPaymentStatus("failed", "PayMongo script did not load. Refresh check-out.html.");
      return;
    }

    let data;
    try {
      data = await window.PaymongoGcash.startCheckout({ name, email, amount });
    } catch (err) {
      const msg = (err && err.message) || "PayMongo could not create a QR code";
      setPaymentStatus("failed", msg);
      showToast(msg);
      return;
    }

    const qrImg = document.getElementById("gcash-qr");
    if (!data.qrImageUrl || !qrImg) {
      setPaymentStatus("failed", "PayMongo did not return a QR code. Enable QR Ph in your PayMongo dashboard.");
      return;
    }

    qrImg.src = data.qrImageUrl;
    qrImg.style.imageRendering = "pixelated";
    order.paymentIntentId = data.paymentIntentId;
    order.clientKey = data.clientKey;
    sessionStorage.setItem(PENDING_PAY_KEY, JSON.stringify(order));
    setPaymentStatus("processing", "Waiting for GCash scan…");
    startStatusPoll(order);
  }

  async function maybeCompletePaymongoReturn() {
    if (!document.getElementById("checkout-form")) return;

    const params = new URLSearchParams(window.location.search);
    const intentId =
      params.get("payment_intent_id") ||
      params.get("paymentIntentId") ||
      "";
    const clientKeyFromUrl = params.get("client_key") || params.get("clientKey") || "";
    if (!intentId) return;

    let pending = {};
    try {
      pending = JSON.parse(sessionStorage.getItem(PENDING_PAY_KEY) || "{}");
    } catch {
      pending = {};
    }

    const name = pending.name || "Customer";
    const order = buildOrderSnapshot(name, pending.email || "", "gcash", pending);
    openPaymongoOverlay(name, order.email, order.total || pending.amount || 0);
    setPaymentStatus("processing", "Confirming payment…");

    try {
      const data = await window.PaymongoGcash.getStatus(
        intentId,
        clientKeyFromUrl || pending.clientKey || ""
      );
      if (data.status === "succeeded") {
        setPaymentStatus("success");
        finishOrder(order);
        window.history.replaceState({}, "", "check-out.html");
        return;
      }
      if (data.status === "processing" || data.status === "awaiting_next_action") {
        setPaymentStatus("processing", "Payment is still processing. Keep this page open.");
        order.paymentIntentId = intentId;
        order.clientKey = clientKeyFromUrl || pending.clientKey || "";
        startStatusPoll(order);
        return;
      }
      setPaymentStatus("failed", "Payment was not completed. You can try again.");
    } catch (err) {
      setPaymentStatus(
        "failed",
        (err && err.message) || "Could not confirm payment with PayMongo."
      );
    }
  }

  function setupCheckoutForm() {
    const form = document.getElementById("checkout-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = (document.getElementById("order-name") || {}).value?.trim() || "";
      const email = (document.getElementById("order-email") || {}).value?.trim() || "";
      const method = (document.querySelector('input[name="payment"]:checked') || {}).value || "gcash";

      let ok = true;
      form.querySelectorAll(".field-error").forEach((n) => n.remove());
      form.querySelectorAll(".is-invalid").forEach((n) => n.classList.remove("is-invalid"));

      function fail(id, msg) {
        const input = document.getElementById(id);
        if (!input) return;
        input.classList.add("is-invalid");
        const err = document.createElement("span");
        err.className = "field-error";
        err.textContent = msg;
        input.insertAdjacentElement("afterend", err);
        ok = false;
      }

      if (!name || name.length < 2) fail("order-name", "Enter your full name");
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("order-email", "Enter a valid email");

      const cart = getCart();
      if (!cart.length) {
        showToast("Cart is empty");
        return;
      }

      if (!ok) return;

      const sub = cartSubtotal(cart);
      const discount = getDiscount(sub);
      const total = Math.max(0, sub - discount);
      const order = buildOrderSnapshot(name, email, method, { items: cart, sub, discount, total });
      orderFinished = false;

      if (method === "cod") {
        finishOrder(order);
        return;
      }

      startPaymongoGcash(order);
    });

    const overlay = document.getElementById("paymongo-overlay");
    if (overlay) {
      overlay.querySelector("[data-cancel-pay]")?.addEventListener("click", closeGcashQR);
    }
  }

  /* ---------- cart page buttons ---------- */
  function setupCartButtons() {
    document.querySelector(".clear-btn")?.addEventListener("click", () => {
      clearCart();
      renderCartPage();
      showToast("Cart cleared");
    });

    document.querySelector(".update-btn")?.addEventListener("click", () => {
      renderCartPage();
      showToast("Cart updated");
    });

    const couponInput = document.getElementById("coupon-code");
    if (couponInput) {
      couponInput.addEventListener("change", () => {
        const code = couponInput.value.trim().toUpperCase();
        if (code === "HOOPS20") {
          localStorage.setItem(COUPON_KEY, code);
          showToast("Coupon HOOPS20 applied (−20%)");
        } else if (code) {
          localStorage.removeItem(COUPON_KEY);
          showToast("Invalid coupon");
        } else {
          localStorage.removeItem(COUPON_KEY);
        }
        renderCartPage();
      });
    }
  }

  /* ---------- public: add to cart (for product pages) ---------- */
  window.addToCart = function (product) {
    const cart = getCart();
    const existing = cart.find((i) => i.id === product.id);
    if (existing) existing.qty += product.qty || 1;
    else cart.push({ ...product, qty: product.qty || 1 });
    saveCart(cart);
    showToast("Added to cart");
  };

  function findProduct(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function addProductById(id, qty) {
    const product = findProduct(id);
    if (!product) return;
    window.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: qty || 1,
    });
  }

  function productCardHtml(p) {
    const badge = p.status
      ? `<div class="p-status ${p.status}">${p.status}</div>`
      : "";
    return `
      <div class="col-lg-3 col-sm-6 mix ${p.category}">
        <div class="single-product-item">
          <figure>
            <a href="product-page.html?id=${encodeURIComponent(p.id)}" class="product-image-btn">
              <img src="${p.image}" alt="${p.name}">
            </a>
            ${badge}
          </figure>
          <div class="product-text">
            <a href="product-page.html?id=${encodeURIComponent(p.id)}"><h6>${p.name}</h6></a>
            <p>${formatPeso(p.price)}</p>
            <button type="button" class="add-to-cart-btn" data-add-id="${p.id}">Add to cart</button>
          </div>
        </div>
      </div>`;
  }

  function sortedProducts(list, sort) {
    const items = list.slice();
    if (sort === "price" || sort === "price-asc") items.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
    else if (sort === "newest") items.reverse();
    return items;
  }

  function bindAddButtons(root) {
    (root || document).querySelectorAll("[data-add-id]").forEach((btn) => {
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const qty = Number((document.getElementById("product-qty") || {}).value) || 1;
        addProductById(btn.getAttribute("data-add-id"), qty);
      });
    });
  }

  function renderProductGrid(container, products) {
    if (!container) return;
    if (!products.length) {
      container.innerHTML = `<div class="col-12"><p class="empty-cart">No products found.</p></div>`;
      return;
    }
    container.innerHTML = products.map(productCardHtml).join("");
    bindAddButtons(container);
  }

  function renderShopPage() {
    const list = document.getElementById("shop-product-list");
    if (!list) return;

    const countEl = document.querySelector(".categories-filter .cf-right span");
    const sortEl = document.querySelector(".categories-filter select.sort");

    function paint() {
      const sort = (sortEl && sortEl.value) || "";
      const items = sortedProducts(PRODUCTS, sort);
      renderProductGrid(list, items);
      if (countEl) countEl.textContent = items.length + " Products";
    }

    if (sortEl) {
      sortEl.addEventListener("change", paint);
    }
    paint();
  }

  function renderHomeProducts() {
    const list = document.getElementById("product-list");
    if (!list) return;
    renderProductGrid(list, PRODUCTS);
    if (window.mixitup && !list.dataset.mixitup) {
      window.mixitup(list);
      list.dataset.mixitup = "1";
    }
  }

  function renderRelatedProducts() {
    const list = document.getElementById("related-product-list");
    if (!list) return;
    const params = new URLSearchParams(window.location.search);
    const currentId = params.get("id") || "lebron-xxi";
    const related = PRODUCTS.filter((p) => p.id !== currentId).slice(0, 4);
    renderProductGrid(list, related);
  }

  function renderProductDetail() {
    const page = document.getElementById("product-detail-page");
    if (!page) return;

    const params = new URLSearchParams(window.location.search);
    const product = findProduct(params.get("id") || "lebron-xxi") || PRODUCTS[0];

    const title = page.querySelector(".product-content h2");
    const price = page.querySelector(".pc-meta h5");
    const desc = page.querySelector(".product-content > p");
    const addBtn = page.querySelector("[data-add-id]");
    page.querySelectorAll(".product-img img").forEach((img) => {
      img.src = product.image;
      img.alt = product.name;
    });
    if (title) title.textContent = product.name;
    if (price) price.textContent = formatPeso(product.price);
    if (desc) desc.textContent = product.description;
    if (addBtn) addBtn.setAttribute("data-add-id", product.id);

    const crumb = document.querySelector(".page-breadcrumb .active");
    if (crumb) crumb.textContent = product.name;
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    maybeCompletePaymongoReturn();
    renderShopPage();
    renderHomeProducts();
    renderProductDetail();
    renderRelatedProducts();
    renderCartPage();
    renderCheckoutSummary();
    setupPaymentToggle();
    setupCheckoutForm();
    setupCartButtons();
    bindAddButtons(document);
  });
})();