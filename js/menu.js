'use strict';

(async function () {
  const form = document.getElementById('filter-form');
  const grid = document.getElementById('menu-grid');
  const status = document.getElementById('result-count');
  const { el } = Canteen;

  let data;
  try {
    data = await Canteen.loadData();
  } catch (err) {
    Canteen.showLoadError(grid);
    return;
  }

  const shops = Canteen.shopMap(data);
  const best = Canteen.bestSellerIds(data.menus);

  /* เติมตัวเลือกร้านและประเภทจากข้อมูล */
  const shopSelect = form.elements['shop'];
  const categorySelect = form.elements['category'];
  data.shops.forEach((s) => shopSelect.append(el('option', { value: s.id, text: s.name })));
  [...new Set(data.menus.map((m) => m.category))].forEach((c) =>
    categorySelect.append(el('option', { value: c, text: c }))
  );

  /* ค่าเริ่มต้นจาก URL เช่น menu.html?q=กะเพรา&shop=s01 */
  const params = new URLSearchParams(location.search);
  form.elements['q'].value = params.get('q') || '';
  if (shops[params.get('shop')]) shopSelect.value = params.get('shop');
  if ([...categorySelect.options].some((o) => o.value === params.get('category'))) {
    categorySelect.value = params.get('category');
  }

  function priceMatches(price, range) {
    switch (range) {
      case 'u30': return price <= 30;
      case '31-50': return price >= 31 && price <= 50;
      case '51-80': return price >= 51 && price <= 80;
      case 'o80': return price > 80;
      default: return true;
    }
  }

  function render() {
    const f = new FormData(form);
    const q = (f.get('q') || '').trim().toLowerCase();
    const shopId = f.get('shop');
    const category = f.get('category');
    const range = f.get('price');

    const list = data.menus.filter((m) => {
      const shop = shops[m.shopId];
      if (q) {
        const haystack = [m.name, shop ? shop.name : '', ...(m.tags || [])].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (shopId && m.shopId !== shopId) return false;
      if (category && m.category !== category) return false;
      if (!priceMatches(m.price, range)) return false;
      if (f.get('halal') && !m.halal) return false;
      if (f.get('vegetarian') && !m.vegetarian) return false;
      return true;
    });

    const sort = f.get('sort');
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);

    status.textContent = list.length ? 'พบ ' + list.length + ' เมนู' : 'ไม่พบเมนูที่ตรงกับตัวกรอง';
    if (list.length === 0) {
      grid.replaceChildren(
        el('p', { class: 'empty', text: 'ลองลบตัวกรองบางข้อ หรือกดปุ่ม “ล้างตัวกรอง”' })
      );
      return;
    }
    grid.replaceChildren(...list.map((m) => Canteen.menuCard(m, shops[m.shopId], best)));
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); render(); });
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('reset', () => setTimeout(render, 0));
  render();
})();
