import { sizesFor, parseLength, clampFoot, toHalf, isStocked, STOCKED_SIZES } from '../sizes.js';
import { formatRupiah } from '../money.js';

// The size slip: type or step a foot length, it prints the size, and adds the chosen pair in that size to the bag.
export const setUpSizeSlip = ({ catalog, selection, bag, onAdded }) => {
  const form = document.getElementById('size-form');
  if (!form || catalog.size === 0) return;
  const { foot, pair: pairMenu, colour: colourMenu } = form.elements;
  const colourRow = document.getElementById('colour-row');
  const price = document.getElementById('pair-price');
  const euSize = document.getElementById('size-eu');
  const otherSizes = document.getElementById('size-other');
  const addButton = document.getElementById('add-size');
  const total = document.getElementById('size-total');
  const via = document.getElementById('size-via');

  // The pair menu repeats the price list, in its groups.
  let group = null;
  catalog.forEach((pair) => {
    const heading = pair.link.closest('.sheet__group').querySelector('h3').textContent;
    if (!group || group.label !== heading) {
      group = Object.assign(document.createElement('optgroup'), { label: heading });
      pairMenu.append(group);
    }
    group.append(new Option(pair.name, pair.name));
  });
  form.querySelectorAll('[data-js-row]').forEach((row) => { row.hidden = false; });

  const measure = () => {
    const cm = parseLength(foot.value);
    return Number.isFinite(cm) ? { cm: clampFoot(cm), ...sizesFor(clampFoot(cm)) } : null;
  };

  const render = () => {
    const sizes = measure();
    if (!sizes) return;
    const { pair: name, colour } = selection.get();
    const pair = catalog.get(name);
    pairMenu.value = name;
    colourMenu.value = colour;
    colourRow.hidden = pair.colours.length === 0;
    price.textContent = formatRupiah(pair.price);
    euSize.textContent = `EU ${sizes.eu}`;
    otherSizes.textContent = isStocked(sizes.eu) ? sizes.other : `Outside our sizes, EU ${STOCKED_SIZES.min} to ${STOCKED_SIZES.max}`;

    // A pair that is not made in this size cannot be added in it: the line says which sizes it comes in.
    const fits = sizes.eu >= pair.min && sizes.eu <= pair.max;
    addButton.disabled = !fits;
    via.hidden = !fits;
    total.textContent = fits ? `Add ${name}, EU ${sizes.eu}` : `${name} comes in EU ${pair.min} to ${pair.max}`;
  };

  const remember = () => {
    const sizes = measure();
    if (sizes) selection.set({ footSize: sizes.eu }); else render();
  };

  foot.addEventListener('input', remember);
  foot.addEventListener('change', () => {
    const cm = parseLength(foot.value);
    if (Number.isFinite(cm)) foot.value = clampFoot(toHalf(cm));
    remember();
  });
  form.querySelectorAll('.step').forEach((button) => button.addEventListener('click', () => {
    const cm = parseLength(foot.value) || 26.5;
    foot.value = clampFoot(toHalf(cm) + parseFloat(button.dataset.step));
    remember();
  }));
  pairMenu.addEventListener('change', () => selection.set({ pair: pairMenu.value }));
  colourMenu.addEventListener('change', () => selection.set({ colour: colourMenu.value }));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const sizes = measure();
    const { pair: name, colour } = selection.get();
    const pair = catalog.get(name);
    if (!sizes || sizes.eu < pair.min || sizes.eu > pair.max) return;
    bag.add({ pair: name, colour: pair.colours.length ? colour : null, size: sizes.eu, price: pair.price });
    selection.set({ footSize: sizes.eu });
    onAdded();
  });

  selection.watch(render);
};
