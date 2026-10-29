// Links that name a pair. On the price list (and "Order in black") they open the pair's tag;
// "Find your size" only puts the pair on the slip and lets the link scroll there.
export const setUpPairLinks = ({ catalog, selection, openSheet }) => {
  document.querySelectorAll('a[data-pair]').forEach((link) => link.addEventListener('click', (event) => {
    const name = link.dataset.pair;
    if (link.matches('.item, [data-open-sheet]')) {
      event.preventDefault();
      openSheet(name);
      return;
    }
    selection.set({ pair: name });
  }));

  selection.watch(({ pair }) => catalog.forEach((entry) => {
    if (entry.name === pair) entry.link.setAttribute('aria-current', 'true'); else entry.link.removeAttribute('aria-current');
  }));
};
