// The Minggu sneaker in three colours. The tabs, the slip and the pair's tag all share one chosen colour.
export const setUpShowcase = ({ selection }) => {
  const shoe = document.querySelector('.showcase__shoe');
  const tabs = document.querySelectorAll('.tab');
  const colourName = document.querySelector('#order-minggu [data-colour-name]');
  if (!shoe || tabs.length === 0) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  tabs.forEach((tab) => tab.addEventListener('click', () => selection.set({ colour: tab.dataset.colour })));

  selection.watch(({ colour }) => {
    tabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.dataset.colour === colour)));
    if (colourName) colourName.textContent = colour;
    if (shoe.dataset.colour === colour) return;
    shoe.dataset.colour = colour;
    shoe.setAttribute('aria-label', `Drawing of a pair of Minggu sneakers in ${colour}, side view`);
    if (reduceMotion) return;
    shoe.classList.remove('is-swapping');
    void shoe.getBoundingClientRect();
    shoe.classList.add('is-swapping');
  });
};
