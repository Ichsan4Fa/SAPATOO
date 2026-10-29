// The pairs, read from the price list so the list in index.html stays the one place they are written.
export const readCatalog = (root = document) => {
  const pairs = new Map();
  root.querySelectorAll('.item[data-pair]').forEach((link) => {
    const [min, max] = link.dataset.sizes.split('-').map(Number);
    pairs.set(link.dataset.pair, {
      name: link.dataset.pair,
      price: Number(link.dataset.price),
      description: link.querySelector('.item__desc').textContent.replace(/,\s*EU\s*\d+–\d+\s*$/, '.'),
      colours: link.dataset.colours ? link.dataset.colours.split(',') : [],
      min,
      max,
      link,
    });
  });
  return pairs;
};

export const sizesOf = (pair) => Array.from({ length: pair.max - pair.min + 1 }, (_, index) => pair.min + index);
