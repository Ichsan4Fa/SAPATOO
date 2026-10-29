// Reveal once when an element enters the viewport. Content is never left hidden.
export const startReveals = () => {
  const targets = document.querySelectorAll('[data-reveal], .prices, .footer');
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  targets.forEach((el) => observer.observe(el));
  window.addEventListener('load', () => setTimeout(() => {
    targets.forEach((el) => { const box = el.getBoundingClientRect(); if (box.top < innerHeight && box.bottom > 0) el.classList.add('is-in'); });
  }, 2500));
};
