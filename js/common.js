'use strict';

/* โมดูลกลางที่ทุกหน้าใช้ร่วมกัน: โหลดข้อมูล, ตะกร้า, งบ, รีวิว, การ์ดแสดงผล */
const Canteen = (() => {
  const KEYS = {
    cart: 'canteen.cart',
    budget: 'canteen.budget',
    reviews: 'canteen.reviews',
    sales: 'canteen.sales'
  };

  /* ---------- localStorage (ห่อ try/catch กรณีถูกปิดใช้งาน) ---------- */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  /* ---------- โหลดข้อมูล ---------- */
  async function loadData() {
    const res = await fetch('data/canteen.json');
    if (!res.ok) {
      throw new Error('โหลดข้อมูลไม่สำเร็จ (HTTP ' + res.status + ')');
    }
    return res.json();
  }

  function shopMap(data) {
    return Object.fromEntries(data.shops.map((s) => [s.id, s]));
  }

  /* ---------- สร้าง element ด้วย DOM ---------- */
  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (value === undefined || value === null || value === false) continue;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else node.setAttribute(key, value === true ? '' : value);
    }
    for (const child of children.flat()) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child);
    }
    return node;
  }

  function showLoadError(container) {
    container.replaceChildren(
      el('p', {
        class: 'alert alert-error',
        role: 'alert',
        text: '⚠ โหลดข้อมูลไม่สำเร็จ กรุณารีเฟรชหน้านี้ หากเปิดไฟล์โดยตรงให้เปิดผ่าน Live Server แทน'
      })
    );
  }

  /* ---------- ตะกร้า ---------- */
  function getCart() {
    const cart = read(KEYS.cart, {});
    return cart && typeof cart === 'object' && !Array.isArray(cart) ? cart : {};
  }

  function saveCart(cart) {
    write(KEYS.cart, cart);
    updateBadge();
  }

  function addToCart(id) {
    const cart = getCart();
    cart[id] = (cart[id] || 0) + 1;
    saveCart(cart);
    const sales = read(KEYS.sales, {});
    sales[id] = (sales[id] || 0) + 1;
    write(KEYS.sales, sales);
  }

  function changeQty(id, delta) {
    const cart = getCart();
    if (!cart[id]) return;
    cart[id] += delta;
    if (cart[id] <= 0) delete cart[id];
    saveCart(cart);
  }

  function removeItem(id) {
    const cart = getCart();
    delete cart[id];
    saveCart(cart);
  }

  function clearCart() {
    saveCart({});
  }

  function cartCount() {
    return Object.values(getCart()).reduce((sum, qty) => sum + qty, 0);
  }

  function cartTotals(menus) {
    const items = [];
    let total = 0;
    let kcal = 0;
    let count = 0;
    for (const [id, qty] of Object.entries(getCart())) {
      const menu = menus.find((m) => m.id === id);
      if (!menu) continue;
      items.push({ menu, qty });
      total += menu.price * qty;
      kcal += (menu.kcal || 0) * qty;
      count += qty;
    }
    return { items, total, kcal, count };
  }

  function updateBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const n = cartCount();
    badge.textContent = n;
    const link = badge.closest('a');
    if (link) link.setAttribute('aria-label', 'ตะกร้า ' + n + ' รายการ');
  }

  /* ---------- งบวันนี้ ---------- */
  function getBudget() {
    const value = read(KEYS.budget, null);
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  function setBudget(value) {
    if (value === null) {
      try { localStorage.removeItem(KEYS.budget); } catch (err) { /* ไม่ทำอะไร */ }
    } else {
      write(KEYS.budget, value);
    }
  }

  /* ---------- ขายดี (นับจากจำนวนครั้งที่เพิ่มลงตะกร้า) ---------- */
  function bestSellerIds(menus) {
    const sales = read(KEYS.sales, {});
    return Object.entries(sales)
      .filter(([id, n]) => n > 0 && menus.some((m) => m.id === id))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);
  }

  /* ---------- รีวิว ---------- */
  function allReviews(data) {
    const local = read(KEYS.reviews, []);
    const mine = Array.isArray(local) ? local : [];
    return [...(data.reviews || []), ...mine].sort((a, b) => b.date.localeCompare(a.date));
  }

  function addReview(review) {
    const list = read(KEYS.reviews, []);
    const mine = Array.isArray(list) ? list : [];
    mine.push(review);
    return write(KEYS.reviews, mine);
  }

  function shopRating(reviews, shopId) {
    const rs = reviews.filter((r) => r.shopId === shopId);
    if (rs.length === 0) return { avg: 0, count: 0 };
    const sum = rs.reduce((acc, r) => acc + Number(r.rating), 0);
    return { avg: sum / rs.length, count: rs.length };
  }

  function ratingEl(avg, count) {
    const wrap = el('span', { class: 'rating' });
    if (!count) {
      wrap.append('ยังไม่มีรีวิว');
      return wrap;
    }
    const full = Math.round(avg);
    wrap.append(
      el('span', { class: 'stars', 'aria-hidden': 'true', text: '★'.repeat(full) + '☆'.repeat(5 - full) }),
      ' ' + avg.toFixed(1) + ' / 5 (' + count + ' รีวิว)'
    );
    return wrap;
  }

  /* ---------- เวลาเปิด–ปิด ---------- */
  function isOpen(shop, now = new Date()) {
    const toMinutes = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const current = now.getHours() * 60 + now.getMinutes();
    return current >= toMinutes(shop.open) && current < toMinutes(shop.close);
  }

  /* ---------- แจ้งเตือนสั้น ๆ ---------- */
  let toastTimer;
  function toast(message) {
    let box = document.getElementById('toast');
    if (!box) {
      box = el('div', { id: 'toast', class: 'toast', role: 'status', 'aria-live': 'polite' });
      document.body.append(box);
    }
    box.textContent = message;
    box.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('show'), 2500);
  }

  /* ---------- การ์ดเมนู ---------- */
  function menuCard(menu, shop, bestIds = []) {
    const img = el('img', {
      src: menu.image,
      alt: menu.name + (shop ? ' จากร้าน' + shop.name : ''),
      width: 400,
      height: 300,
      loading: 'lazy'
    });
    img.addEventListener('error', () => {
      if (!img.dataset.fallback) {
        img.dataset.fallback = '1';
        img.src = 'images/placeholder.svg';
      }
    });

    const badges = el('ul', { class: 'badges', 'aria-label': 'ป้ายอาหาร' });
    const addBadge = (text, cls) => badges.append(el('li', { class: 'badge ' + cls, text }));
    if (bestIds.includes(menu.id)) addBadge('ขายดี', 'badge-hot');
    if (menu.halal) addBadge('ฮาลาล', 'badge-halal');
    if (menu.vegetarian) addBadge('มังสวิรัติ', 'badge-veg');
    (menu.tags || []).forEach((tag) => addBadge(tag, 'badge-tag'));

    const button = el('button', {
      type: 'button',
      class: 'btn btn-primary',
      'aria-label': 'เพิ่มลงตะกร้า: ' + menu.name,
      text: 'เพิ่มลงตะกร้า'
    });
    button.addEventListener('click', () => {
      addToCart(menu.id);
      toast('เพิ่ม “' + menu.name + '” ลงตะกร้าแล้ว');
    });

    return el('article', { class: 'card menu-card' },
      img,
      el('div', { class: 'card-body' },
        el('h3', { text: menu.name }),
        el('p', { class: 'meta', text: shop ? 'ร้าน' + shop.name.replace(/^ร้าน/, '') : '' }),
        el('p', { class: 'meta', text: menu.category + ', ประมาณ ' + menu.kcal + ' kcal' }),
        badges.children.length ? badges : null,
        el('div', { class: 'card-foot' },
          el('p', { class: 'price-tag', text: '฿' + menu.price }),
          button
        )
      )
    );
  }

  /* ---------- การ์ดร้านอาหาร ---------- */
  function shopCard(shop, reviews) {
    const { avg, count } = shopRating(reviews, shop.id);
    const open = isOpen(shop);
    const id = encodeURIComponent(shop.id);
    return el('article', { class: 'card shop-card' },
      el('div', { class: 'card-body' },
        el('h3', { text: shop.name }),
        el('p', { class: 'meta', text: 'โซน' + shop.zone.replace(/^โซน/, '') }),
        el('p', { class: 'meta', text: 'เปิด ' + shop.open + '–' + shop.close + ' น.' }),
        el('p', {}, el('span', {
          class: 'badge ' + (open ? 'badge-open' : 'badge-closed'),
          text: open ? '● เปิดอยู่ตอนนี้' : '○ ปิดแล้ว'
        })),
        el('p', {}, ratingEl(avg, count)),
        el('p', { text: shop.description || '' }),
        el('div', { class: 'card-foot' },
          el('a', { class: 'btn btn-primary', href: 'menu.html?shop=' + id, 'aria-label': 'ดูเมนูร้าน' + shop.name, text: 'ดูเมนู' }),
          el('a', { class: 'btn btn-secondary', href: 'review.html?shop=' + id, 'aria-label': 'เขียนรีวิวร้าน' + shop.name, text: 'เขียนรีวิว' })
        )
      )
    );
  }

  /* ---------- เริ่มต้น ---------- */
  updateBadge();
  window.addEventListener('storage', updateBadge);

  return {
    loadData, shopMap, el, showLoadError,
    getCart, addToCart, changeQty, removeItem, clearCart, cartCount, cartTotals, updateBadge,
    getBudget, setBudget, bestSellerIds,
    allReviews, addReview, shopRating, ratingEl,
    isOpen, toast, menuCard, shopCard
  };
})();
