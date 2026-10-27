// SAPATOO homepage: reveals, the colour tabs, the size slip, and the film.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ORDER_TO = 'hello@sapatoo.example';

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

// The Minggu sneaker in three colours. The order cell carries the chosen colour.
(() => {
  const shoe = document.querySelector('.showcase__shoe');
  const tabs = document.querySelectorAll('.tab');
  const order = document.getElementById('order-minggu');
  const nameSlot = order && order.querySelector('[data-colour-name]');
  if (!shoe || !tabs.length) return;

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    const colour = tab.dataset.colour;
    tabs.forEach((t) => t.setAttribute('aria-pressed', String(t === tab)));
    shoe.dataset.colour = colour;
    shoe.setAttribute('aria-label', `Drawing of a pair of Minggu sneakers in ${colour}, side view`);
    if (!reduceMotion) { shoe.classList.remove('is-swapping'); void shoe.getBoundingClientRect(); shoe.classList.add('is-swapping'); }
    if (nameSlot) nameSlot.textContent = colour;
    if (order) {
      const subject = `Order: Minggu sneaker, ${colour}`;
      const body = `I would like to order the Minggu sneaker in ${colour}, size EU `;
      order.href = `mailto:${ORDER_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  }));
})();

// The size slip. A shoe's inside is about 1.5 cm longer than the foot; EU sizes are counted in
// Paris points (2/3 cm), UK sizes in barleycorns (1/3 inch) from a fixed start.
(() => {
  const input = document.getElementById('foot');
  if (!input) return;
  const eu = document.getElementById('size-eu');
  const other = document.getElementById('size-other');
  const total = document.getElementById('size-total');
  const order = document.getElementById('order-size');

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

  function update() {
    let cm = parse(input.value);
    if (!Number.isFinite(cm)) return;
    cm = Math.min(32, Math.max(10, cm));
    const s = sizesFor(cm);
    const inRange = s.eu >= RANGE[0] && s.eu <= RANGE[1];
    eu.textContent = `EU ${s.eu}`;
    other.textContent = inRange ? s.other : `Outside our sizes, EU ${RANGE[0]} to ${RANGE[1]}`;
    total.textContent = `EU ${s.eu}`;
    const subject = `Order in size EU ${s.eu}`;
    const body = `My foot is ${cm} cm. I would like to order these shoes in size EU ${s.eu}: `;
    order.href = `mailto:${ORDER_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
  document.getElementById('size-form').addEventListener('submit', (e) => { e.preventDefault(); update(); });
  update();
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
