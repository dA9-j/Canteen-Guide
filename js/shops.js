'use strict';

(async function () {
  const grid = document.getElementById('shop-grid');
  let data;
  try {
    data = await Canteen.loadData();
  } catch (err) {
    Canteen.showLoadError(grid);
    return;
  }
  const reviews = Canteen.allReviews(data);
  grid.replaceChildren(...data.shops.map((shop) => Canteen.shopCard(shop, reviews)));
})();
