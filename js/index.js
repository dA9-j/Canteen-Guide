'use strict';

(async function () {
  const { el } = Canteen;
  const shopsBox = document.getElementById('featured-shops');
  const menusBox = document.getElementById('popular-menus');
  const randomBtn = document.getElementById('random-btn');
  const randomResult = document.getElementById('random-result');
  const randomHint = document.getElementById('random-hint');
  const MAIN_CATEGORIES = ['อาหารจานเดียว', 'ก๋วยเตี๋ยว'];

  function updateHint() {
    const budget = Canteen.getBudget();
    randomHint.textContent = budget === null
      ? 'ยังไม่ได้ตั้งงบวันนี้ จะสุ่มจากอาหารจานหลักทุกเมนู (ตั้งงบได้ที่หน้าตะกร้า)'
      : 'สุ่มจากอาหารจานหลักที่ราคาไม่เกินงบ ' + budget + ' บาท';
  }
  updateHint();

  let data;
  try {
    data = await Canteen.loadData();
  } catch (err) {
    Canteen.showLoadError(shopsBox);
    menusBox.replaceChildren();
    randomBtn.disabled = true;
    return;
  }

  const shops = Canteen.shopMap(data);
  const reviews = Canteen.allReviews(data);
  const best = Canteen.bestSellerIds(data.menus);

  const topShops = data.shops
    .map((shop) => ({ shop, ...Canteen.shopRating(reviews, shop.id) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3);
  shopsBox.replaceChildren(...topShops.map((item) => Canteen.shopCard(item.shop, reviews)));

  const picks = [...data.menus]
    .sort((a, b) => best.includes(b.id) - best.includes(a.id))
    .slice(0, 4);
  menusBox.replaceChildren(...picks.map((menu) => Canteen.menuCard(menu, shops[menu.shopId], best)));

  randomBtn.addEventListener('click', () => {
    updateHint();
    const budget = Canteen.getBudget();
    const pool = data.menus.filter(
      (m) => MAIN_CATEGORIES.includes(m.category) && (budget === null || m.price <= budget)
    );
    if (pool.length === 0) {
      randomResult.replaceChildren(
        el('p', { class: 'alert alert-info', text: 'ไม่พบเมนูที่ราคาไม่เกิน ' + budget + ' บาท ลองเพิ่มงบที่หน้าตะกร้า' })
      );
      return;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    randomResult.replaceChildren(
      el('h3', { text: 'เมนูที่สุ่มได้' }),
      Canteen.menuCard(pick, shops[pick.shopId], Canteen.bestSellerIds(data.menus))
    );
  });
})();
