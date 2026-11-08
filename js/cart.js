'use strict';

(async function () {
  const { el } = Canteen;
  const content = document.getElementById('cart-content');
  const heading = document.getElementById('cart-heading');
  const budgetForm = document.getElementById('budget-form');
  const budgetInput = document.getElementById('budget');
  const budgetError = document.getElementById('budget-error');
  const budgetStatus = document.getElementById('budget-status');
  const clearBudgetBtn = document.getElementById('clear-budget');

  let data = null;

  budgetInput.value = Canteen.getBudget() ?? '';

  function renderBudgetStatus(total) {
    const budget = Canteen.getBudget();
    if (budget === null) {
      budgetStatus.className = 'alert alert-info';
      budgetStatus.textContent = 'ยังไม่ได้ตั้งงบวันนี้';
    } else if (total > budget) {
      budgetStatus.className = 'alert alert-error';
      budgetStatus.textContent = '⚠ เกินงบ ' + (total - budget) + ' บาท (งบ ' + budget + ' บาท, ราคารวม ' + total + ' บาท)';
    } else {
      budgetStatus.className = 'alert alert-ok';
      budgetStatus.textContent = '✔ อยู่ในงบ เหลืออีก ' + (budget - total) + ' บาท (งบ ' + budget + ' บาท)';
    }
  }

  function iconButton(action, text, label, id) {
    return el('button', {
      type: 'button',
      class: 'btn btn-secondary btn-icon',
      'data-action': action,
      'data-id': id,
      'aria-label': label,
      text
    });
  }

  function render() {
    const { items, total, kcal, count } = Canteen.cartTotals(data.menus);
    renderBudgetStatus(total);

    if (items.length === 0) {
      content.replaceChildren(
        el('p', { class: 'empty' }, 'ตะกร้ายังว่าง ', el('a', { href: 'menu.html', text: 'ไปเลือกเมนู' }))
      );
      return;
    }

    const shops = Canteen.shopMap(data);
    const list = el('ul', { class: 'cart-list' });
    items.forEach(({ menu, qty }) => {
      const shop = shops[menu.shopId];
      list.append(
        el('li', { class: 'cart-item' },
          el('div', { class: 'cart-info' },
            el('h3', { text: menu.name }),
            el('p', { class: 'meta', text: (shop ? shop.name + ', ' : '') + '฿' + menu.price + ' ต่อรายการ' })
          ),
          el('div', { class: 'qty-controls', role: 'group', 'aria-label': 'จำนวน ' + menu.name },
            iconButton('dec', '−', 'ลดจำนวน ' + menu.name, menu.id),
            el('span', { class: 'qty', text: qty }),
            iconButton('inc', '+', 'เพิ่มจำนวน ' + menu.name, menu.id)
          ),
          el('p', { class: 'line-total', text: '฿' + menu.price * qty }),
          el('button', {
            type: 'button',
            class: 'btn btn-danger',
            'data-action': 'remove',
            'data-id': menu.id,
            'aria-label': 'ลบ ' + menu.name + ' ออกจากตะกร้า',
            text: 'ลบ'
          })
        )
      );
    });

    const summary = el('dl', { class: 'summary' },
      el('dt', { text: 'จำนวนรายการ' }), el('dd', { text: count + ' รายการ' }),
      el('dt', { text: 'พลังงานรวมโดยประมาณ' }), el('dd', { text: kcal + ' kcal' }),
      el('dt', { class: 'summary-total', text: 'ราคารวม' }), el('dd', { class: 'summary-total', text: '฿' + total })
    );

    content.replaceChildren(
      list,
      summary,
      el('button', { type: 'button', class: 'btn btn-secondary', 'data-action': 'clear', text: 'ล้างตะกร้า' })
    );
  }

  /* ----- ตั้งงบ ----- */
  budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = budgetInput.value.trim();
    const value = Number(raw);
    if (raw === '' || !Number.isInteger(value) || value < 1 || value > 5000) {
      budgetError.textContent = '⚠ กรุณากรอกงบเป็นจำนวนเต็ม 1–5,000 บาท';
      budgetInput.setAttribute('aria-invalid', 'true');
      budgetInput.focus();
      return;
    }
    budgetError.textContent = '';
    budgetInput.setAttribute('aria-invalid', 'false');
    Canteen.setBudget(value);
    if (data) render();
    Canteen.toast('บันทึกงบวันนี้ ' + value + ' บาทแล้ว');
  });

  clearBudgetBtn.addEventListener('click', () => {
    Canteen.setBudget(null);
    budgetInput.value = '';
    budgetError.textContent = '';
    budgetInput.setAttribute('aria-invalid', 'false');
    if (data) render();
    else renderBudgetStatus(0);
    budgetInput.focus();
  });

  /* ----- โหลดเมนูเพื่อแสดงตะกร้า ----- */
  try {
    data = await Canteen.loadData();
  } catch (err) {
    Canteen.showLoadError(content);
    renderBudgetStatus(0);
    return;
  }

  content.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === 'inc') Canteen.changeQty(id, 1);
    else if (action === 'dec') Canteen.changeQty(id, -1);
    else if (action === 'remove') Canteen.removeItem(id);
    else if (action === 'clear') Canteen.clearCart();
    render();
    const again = id
      ? content.querySelector('button[data-action="' + action + '"][data-id="' + id + '"]')
      : null;
    (again || heading).focus();
  });

  render();
})();
