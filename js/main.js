// SAPATOO homepage: reveals, one order shared by the colour tabs, the price list and the size slip, and the film.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ORDER_TO = 'hello@sapatoo.example';
// The shop's WhatsApp number, country code first and digits only (62 for Indonesia).
// The same placeholder is written into the links in index.html: replace it everywhere.
const WHATSAPP = '62XXXXXXXXXX';

const whatsappLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
const emailLink = (subject, body) => `mailto:${ORDER_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
const orderMessage = ({ pair, price, size, foot }) => [
  'Hello SAPATOO, I would like to order:',
  `Pair: ${pair}, ${price}`,
  `Size: EU ${size || ''}${foot ? ` (my foot is ${foot} cm)` : ''}`,
  'Deliver to: ',
].join('\n');

// Reveal once when an element enters the viewport. Content is never left hidden.
(() => {
  const targets = document.querySelectorAll('[data-reveal], .prices, .footer');
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
  window.addEventListener('load', () => setTimeout(() => {
    targets.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
  }, 2500));
})();

// The pairs, read from the price list so the list stays the one place they are written.
const pairs = new Map();
document.querySelectorAll('.item[data-pair]').forEach((link) => {
  const [min, max] = link.dataset.sizes.split('-').map(Number);
  pairs.set(link.dataset.pair, {
    name: link.dataset.pair,
    price: link.querySelector('.item__price').textContent,
    group: link.closest('.sheet__group').querySelector('h3').textContent,
    min, max, link,
  });
});

// One order, shared by the colour tabs, the price list and the size slip.
const order = { pair: 'Minggu', colour: 'black' };
const watchers = [];
const watchOrder = (fn) => { watchers.push(fn); fn(); };
const changeOrder = (changes) => { Object.assign(order, changes); watchers.forEach((fn) => fn()); };
const describePair = () => (order.pair === 'Minggu' ? `Minggu sneaker in ${order.colour}` : order.pair);

// The Minggu sneaker in three colours. The order cell carries the chosen colour.
(() => {
  const shoe = document.querySelector('.showcase__shoe');
  const tabs = document.querySelectorAll('.tab');
  const cell = document.getElementById('order-minggu');
  const nameSlot = cell && cell.querySelector('[data-colour-name]');
  if (!shoe || !tabs.length || !pairs.has('Minggu')) return;

  tabs.forEach((tab) => tab.addEventListener('click', () => changeOrder({ colour: tab.dataset.colour })));
  watchOrder(() => {
    const { colour } = order;
    tabs.forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.colour === colour)));
    if (nameSlot) nameSlot.textContent = colour;
    if (cell) cell.href = whatsappLink(orderMessage({ pair: `Minggu sneaker in ${colour}`, price: pairs.get('Minggu').price }));
    if (shoe.dataset.colour === colour) return;
    shoe.dataset.colour = colour;
    shoe.setAttribute('aria-label', `Drawing of a pair of Minggu sneakers in ${colour}, side view`);
    if (!reduceMotion) { shoe.classList.remove('is-swapping'); void shoe.getBoundingClientRect(); shoe.classList.add('is-swapping'); }
  });
})();

// Picking a pair on the price list, or "Find your size" under the Minggu, puts it on the slip.
(() => {
  document.querySelectorAll('a[data-pair]').forEach((link) => link.addEventListener('click', () => changeOrder({ pair: link.dataset.pair })));
  watchOrder(() => pairs.forEach((p) => {
    if (p.name === order.pair) p.link.setAttribute('aria-current', 'true'); else p.link.removeAttribute('aria-current');
  }));
})();

// The size slip, which is also the order form. A shoe's inside is about 1.5 cm longer than the foot;
// EU sizes are counted in Paris points (2/3 cm), UK sizes in barleycorns (1/3 inch) from a fixed start.
(() => {
  const input = document.getElementById('foot');
  if (!input || !pairs.size) return;
  const eu = document.getElementById('size-eu');
  const other = document.getElementById('size-other');
  const total = document.getElementById('size-total');
  const via = document.getElementById('size-via');
  const link = document.getElementById('order-size');
  const emailLine = document.getElementById('order-email-line');
  const emailOut = document.getElementById('order-email');
  const pairMenu = document.getElementById('pair');
  const colourMenu = document.getElementById('colour');
  const colourRow = document.getElementById('colour-row');
  const price = document.getElementById('pair-price');

  const half = (n) => Math.round(n * 2) / 2;
  const fmt = (n) => String(n).replace('.5', '½');
  const parse = (v) => parseFloat(String(v).trim().replace(',', '.'));
  const RANGE = [19, 47]; // the smallest and largest EU sizes on the price list

  function sizesFor(cm) {
    const last = cm + 1.5;
    const euSize = Math.round(last * 1.5);
    const barleycorns = (last / 2.54) * 3;
    if (euSize < 35) {
      const ukKids = half(barleycorns - 12);
      return { eu: euSize, other: ukKids <= 13.5 ? `UK ${fmt(ukKids)} kids · US ${fmt(ukKids + 0.5)} kids` : `UK ${fmt(half(barleycorns - 25))}` };
    }
    const uk = half(barleycorns - 25);
    return { eu: euSize, other: `UK ${fmt(uk)} · US ${fmt(uk + 1)} men, ${fmt(uk + 2)} women` };
  }

  // The pair menu lists the price list, in its groups.
  let group = null;
  pairs.forEach((p) => {
    if (!group || group.label !== p.group) { group = document.createElement('optgroup'); group.label = p.group; pairMenu.append(group); }
    group.append(new Option(p.name, p.name));
  });
  document.querySelectorAll('.slip [data-js-row]').forEach((row) => { row.hidden = false; });

  function update() {
    let cm = parse(input.value);
    if (!Number.isFinite(cm)) return;
    cm = Math.min(32, Math.max(10, cm));
    const s = sizesFor(cm);
    const p = pairs.get(order.pair);
    pairMenu.value = p.name;
    colourMenu.value = order.colour;
    colourRow.hidden = p.name !== 'Minggu';
    price.textContent = p.price;
    eu.textContent = `EU ${s.eu}`;
    other.textContent = s.eu >= RANGE[0] && s.eu <= RANGE[1] ? s.other : `Outside our sizes, EU ${RANGE[0]} to ${RANGE[1]}`;

    // A pair that is not made in this size cannot be ordered in it: the line says which sizes it comes in.
    const fits = s.eu >= p.min && s.eu <= p.max;
    via.hidden = !fits;
    emailLine.hidden = !fits;
    if (!fits) {
      total.textContent = `${p.name} comes in EU ${p.min} to ${p.max}`;
      link.removeAttribute('href');
      return;
    }
    const message = orderMessage({ pair: describePair(), price: p.price, size: s.eu, foot: cm });
    total.textContent = `Order ${p.name} in EU ${s.eu}`;
    link.href = whatsappLink(message);
    emailOut.href = emailLink(`Order: ${describePair()}, EU ${s.eu}`, message);
  }

  input.addEventListener('input', update);
  input.addEventListener('change', () => {
    const cm = parse(input.value);
    if (Number.isFinite(cm)) input.value = Math.min(32, Math.max(10, half(cm)));
    update();
  });
  document.querySelectorAll('.step').forEach((btn) => btn.addEventListener('click', () => {
    const cm = parse(input.value) || 26.5;
    input.value = Math.min(32, Math.max(10, half(cm) + parseFloat(btn.dataset.step)));
    update();
  }));
  pairMenu.addEventListener('change', () => changeOrder({ pair: pairMenu.value }));
  colourMenu.addEventListener('change', () => changeOrder({ colour: colourMenu.value }));
  document.getElementById('size-form').addEventListener('submit', (e) => { e.preventDefault(); update(); });
  watchOrder(update);
})();

// The film plays only while it is on screen, and not at all for reduced motion.
(() => {
  const video = document.querySelector('.faq__film video');
  if (!video) return;
  if (reduceMotion) { video.removeAttribute('autoplay'); video.pause(); return; }
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) video.play().catch(() => {}); else video.pause();
  });
  io.observe(video);
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
})();
