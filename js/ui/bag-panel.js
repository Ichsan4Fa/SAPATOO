import { countPairs, subtotal, lineKey, MAX_QUANTITY } from '../bag.js';
import { formatRupiah } from '../money.js';
import { describeLine, orderMessage, orderNumber, whatsappLink, emailLink, pairsLabel } from '../order.js';
import { SHOP } from '../shop.js';
import { setUpDialog } from './dialogs.js';

// The bag, printed like a receipt, and its checkout: bag → your details → sent.
export const setUpBagPanel = ({ bag }) => {
  const dialog = document.getElementById('bag');
  const panel = setUpDialog(dialog);
  const steps = dialog.querySelectorAll('[data-step]');
  const lineList = dialog.querySelector('[data-bag-lines]');
  const lineTemplate = document.getElementById('bag-line');
  const checkout = document.getElementById('checkout');
  const fab = document.querySelector('[data-bag-fab]');
  const cta = document.querySelector('[data-cta]');
  const ctaLine = document.querySelector('[data-cta-line]');
  const ctaText = ctaLine ? ctaLine.textContent : '';
  const onScreen = { topbar: true, footer: false };

  const showStep = (name, { focus = true } = {}) => {
    steps.forEach((step) => { step.hidden = step.dataset.step !== name; });
    if (!focus) return;
    const heading = name === 'sent' ? document.getElementById('sent-title') : document.getElementById('bag-title');
    heading.focus();
  };
  const currentStep = () => [...steps].find((step) => !step.hidden)?.dataset.step ?? 'bag';

  const renderLine = (line) => {
    const item = lineTemplate.content.firstElementChild.cloneNode(true);
    const name = describeLine(line);
    item.dataset.key = lineKey(line);
    item.querySelector('.bag-line__name').textContent = name;
    item.querySelector('.bag-line__price').textContent = formatRupiah(line.price * line.quantity);
    item.querySelector('.bag-line__quantity').textContent = line.quantity;
    const [less, more] = item.querySelectorAll('[data-change]');
    less.setAttribute('aria-label', line.quantity === 1 ? `Remove ${name}` : `One less ${name}`);
    more.setAttribute('aria-label', `One more ${name}`);
    more.disabled = line.quantity >= MAX_QUANTITY;
    item.querySelector('[data-remove]').setAttribute('aria-label', `Remove ${name}`);
    return item;
  };

  // Re-rendering replaces the buttons, so keyboard focus is put back on the same control of the same line.
  const focusedControl = () => {
    const item = document.activeElement?.closest?.('.bag-line');
    if (!item) return null;
    return { key: item.dataset.key, selector: document.activeElement.matches('[data-remove]') ? '[data-remove]' : `[data-change="${document.activeElement.dataset.change}"]` };
  };
  const restoreFocus = (control) => {
    if (!control) return;
    const item = [...lineList.children].find((child) => child.dataset.key === control.key);
    (item?.querySelector(control.selector) ?? document.getElementById('bag-title')).focus();
  };

  const updateFab = () => {
    fab.hidden = countPairs(bag.lines()) === 0 || onScreen.topbar || onScreen.footer || panel.isOpen();
  };

  const render = (lines) => {
    const control = focusedControl();
    const count = countPairs(lines);
    const total = subtotal(lines);
    lineList.replaceChildren(...lines.map(renderLine));
    dialog.querySelector('[data-bag-empty]').hidden = count > 0;
    dialog.querySelector('[data-bag-filled]').hidden = count === 0;
    dialog.querySelectorAll('[data-bag-subtotal]').forEach((output) => { output.textContent = formatRupiah(total); });
    dialog.querySelector('[data-bag-delivery]').textContent = total >= SHOP.freeDeliveryFrom
      ? 'Delivery is free on this order.'
      : `Delivery is free from ${formatRupiah(SHOP.freeDeliveryFrom)}. Below that, we add the courier's rate when we reply.`;
    document.querySelectorAll('[data-bag-count]').forEach((badge) => { badge.textContent = count; });
    document.querySelectorAll('[data-open-bag]').forEach((button) => {
      button.toggleAttribute('data-filled', count > 0);
      button.setAttribute('aria-label', `${button === fab ? 'Your bag' : 'Bag'}, ${pairsLabel(count)}`);
    });
    if (ctaLine) ctaLine.textContent = count > 0 ? `${pairsLabel(count)} in your bag, ${formatRupiah(total)}. Check out and send the order on WhatsApp.` : ctaText;
    if (count === 0 && currentStep() === 'details') showStep('bag', { focus: panel.isOpen() });
    updateFab();
    restoreFocus(control);
  };

  lineList.addEventListener('click', (event) => {
    const item = event.target.closest('.bag-line');
    const line = item && bag.lines().find((entry) => lineKey(entry) === item.dataset.key);
    if (!line) return;
    const change = event.target.closest('[data-change]');
    if (change) bag.setQuantity(item.dataset.key, line.quantity + Number(change.dataset.change));
    if (event.target.closest('[data-remove]')) bag.remove(item.dataset.key);
  });

  dialog.querySelectorAll('[data-step-to]').forEach((button) => button.addEventListener('click', () => showStep(button.dataset.stepTo)));

  // Collecting in the shop needs no address and allows paying there; a courier needs both the other way round.
  const addressField = checkout.querySelector('[data-address]');
  const payInShop = checkout.elements.payment.querySelector('option[value="shop"]');
  const syncDelivery = () => {
    const collecting = checkout.elements.delivery.value === 'collect';
    addressField.hidden = collecting;
    checkout.elements.address.required = !collecting;
    payInShop.disabled = !collecting;
    if (!collecting && checkout.elements.payment.value === 'shop') checkout.elements.payment.value = 'transfer';
  };
  checkout.addEventListener('change', (event) => { if (event.target.name === 'delivery') syncDelivery(); });
  syncDelivery();

  const prepareOrder = () => {
    const fields = checkout.elements;
    fields.name.value = fields.name.value.trim();
    fields.address.value = fields.address.value.trim();
    if (!checkout.reportValidity()) return null;
    const number = orderNumber();
    const message = orderMessage({
      number,
      lines: bag.lines(),
      customer: { name: fields.name.value, delivery: fields.delivery.value, address: fields.address.value, payment: fields.payment.value, note: fields.note.value.trim() },
    });
    return { number, whatsapp: whatsappLink(message), email: emailLink(`SAPATOO order ${number}`, message) };
  };

  const send = (channel) => {
    const order = prepareOrder();
    if (!order) return;
    dialog.querySelector('[data-order-number]').textContent = order.number;
    dialog.querySelector('[data-resend-whatsapp]').href = order.whatsapp;
    dialog.querySelector('[data-resend-email]').href = order.email;
    if (channel === 'whatsapp') window.open(order.whatsapp, '_blank', 'noopener');
    else window.location.href = order.email;
    showStep('sent');
  };
  checkout.addEventListener('submit', (event) => { event.preventDefault(); send('whatsapp'); });
  dialog.querySelector('[data-email-order]').addEventListener('click', () => send('email'));

  dialog.querySelector('[data-finish]').addEventListener('click', () => {
    bag.empty();
    checkout.reset();
    syncDelivery();
    panel.close();
  });

  dialog.addEventListener('close', () => {
    if (currentStep() === 'sent') showStep('bag', { focus: false });
    updateFab();
  });

  const open = ({ step = 'bag' } = {}) => {
    showStep(step, { focus: false });
    panel.open();
    updateFab();
  };

  document.querySelectorAll('[data-open-bag]').forEach((button) => {
    if (button !== fab) button.hidden = false;
    button.addEventListener('click', () => open());
  });
  cta?.addEventListener('click', (event) => {
    if (countPairs(bag.lines()) === 0) return;
    event.preventDefault();
    open();
  });

  // The floating bag button shows only when the header's bag button is out of sight, and never over the footer.
  if ('IntersectionObserver' in window) {
    const watch = (element, key) => element && new IntersectionObserver(([entry]) => { onScreen[key] = entry.isIntersecting; updateFab(); }).observe(element);
    watch(document.querySelector('.topbar'), 'topbar');
    watch(document.querySelector('.footer'), 'footer');
  }

  bag.watch(render);
  return { open };
};
