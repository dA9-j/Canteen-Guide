'use strict';

(async function () {
  const { el } = Canteen;
  const form = document.getElementById('review-form');
  const shopSelect = document.getElementById('shop');
  const nameInput = document.getElementById('reviewer');
  const commentInput = document.getElementById('comment');
  const counter = document.getElementById('comment-count');
  const message = document.getElementById('form-message');
  const summaryBox = document.getElementById('shop-summary');
  const listBox = document.getElementById('review-list');
  const firstRadio = document.getElementById('rating-1');
  const NAME_PATTERN = /^[A-Za-z0-9ก-๙ _.\-]{2,30}$/;

  let data;
  try {
    data = await Canteen.loadData();
  } catch (err) {
    Canteen.showLoadError(listBox);
    summaryBox.replaceChildren();
    form.querySelectorAll('input, select, textarea, button').forEach((c) => { c.disabled = true; });
    return;
  }

  const shops = Canteen.shopMap(data);
  data.shops.forEach((s) => shopSelect.append(el('option', { value: s.id, text: s.name })));
  const preset = new URLSearchParams(location.search).get('shop');
  if (shops[preset]) shopSelect.value = preset;

  function render() {
    const reviews = Canteen.allReviews(data);

    summaryBox.replaceChildren(
      el('ul', { class: 'summary-list' },
        data.shops.map((shop) => {
          const { avg, count } = Canteen.shopRating(reviews, shop.id);
          return el('li', {},
            el('strong', { text: shop.name }),
            el('br'),
            Canteen.ratingEl(avg, count)
          );
        })
      )
    );

    listBox.replaceChildren(
      ...reviews.slice(0, 10).map((r) => {
        const shop = shops[r.shopId];
        const date = new Date(r.date).toLocaleDateString('th-TH', { dateStyle: 'medium' });
        return el('article', { class: 'review-item' },
          el('h3', { text: shop ? shop.name : 'ร้านอาหาร' }),
          el('p', {}, Canteen.ratingEl(Number(r.rating), 1).firstChild, ' ' + r.rating + ' / 5'),
          el('p', { text: r.comment }),
          el('p', { class: 'meta', text: 'โดย ' + r.name + ' เมื่อ ' + date })
        );
      })
    );
  }

  /* ----- validation ----- */
  function check(control, ok, errorId, msg) {
    document.getElementById(errorId).textContent = ok ? '' : '⚠ ' + msg;
    control.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok ? null : control;
  }

  function validate() {
    const rating = form.querySelector('input[name="rating"]:checked');
    const comment = commentInput.value.trim();
    return [
      check(shopSelect, shopSelect.value !== '', 'shop-error', 'กรุณาเลือกร้านที่ต้องการรีวิว'),
      check(firstRadio, rating !== null, 'rating-error', 'กรุณาให้คะแนน 1–5'),
      check(nameInput, NAME_PATTERN.test(nameInput.value.trim()), 'reviewer-error',
        'ชื่อต้องยาว 2–30 ตัวอักษร ใช้ได้เฉพาะตัวอักษร ตัวเลข เว้นวรรค . _ -'),
      check(commentInput, comment.length >= 10 && comment.length <= 300, 'comment-error',
        'ความคิดเห็นต้องมี 10–300 ตัวอักษร (ตอนนี้ ' + comment.length + ')')
    ].filter(Boolean);
  }

  commentInput.addEventListener('input', () => {
    counter.textContent = commentInput.value.length + ' / 300 ตัวอักษร';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    message.className = '';
    message.textContent = '';
    const invalid = validate();
    if (invalid.length > 0) {
      invalid[0].focus();
      return;
    }
    const saved = Canteen.addReview({
      id: 'u' + Date.now(),
      shopId: shopSelect.value,
      name: nameInput.value.trim(),
      rating: Number(form.querySelector('input[name="rating"]:checked').value),
      comment: commentInput.value.trim(),
      date: new Date().toISOString()
    });
    if (!saved) {
      message.className = 'alert alert-error';
      message.textContent = '⚠ บันทึกรีวิวไม่สำเร็จ เบราว์เซอร์อาจปิดการเก็บข้อมูล';
      return;
    }
    form.reset();
    counter.textContent = '0 / 300 ตัวอักษร';
    form.querySelectorAll('[aria-invalid]').forEach((c) => c.setAttribute('aria-invalid', 'false'));
    message.className = 'alert alert-ok';
    message.textContent = '✔ ขอบคุณสำหรับรีวิว บันทึกเรียบร้อยแล้ว';
    render();
  });

  render();
})();
