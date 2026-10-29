import { sizesOf } from '../catalog.js';
import { formatRupiah } from '../money.js';
import { setUpDialog } from './dialogs.js';

const capitalise = (word) => word.charAt(0).toUpperCase() + word.slice(1);

const chip = ({ name, value, label, checked = false, marked = false }) => {
  const wrapper = Object.assign(document.createElement('label'), { className: marked ? 'chip chip--yours' : 'chip' });
  const input = Object.assign(document.createElement('input'), { type: 'radio', name, value, checked, required: true });
  wrapper.append(input, Object.assign(document.createElement('span'), { textContent: label }));
  return wrapper;
};

const sizeNoteFor = (pair, footSize, fits) => {
  if (footSize === null) return `Made in EU ${pair.min} to ${pair.max}.`;
  if (fits) return `EU ${footSize}, marked, is the size the slip measured for you.`;
  return `The slip measured EU ${footSize}. ${pair.name} comes in EU ${pair.min} to ${pair.max}.`;
};

// A pair's own swing tag: what it is, its colours and sizes, and the button that puts it in the bag.
export const setUpPairSheet = ({ catalog, selection, bag, onAdded }) => {
  const dialog = document.getElementById('pair-sheet');
  const sheet = setUpDialog(dialog);
  const form = document.getElementById('pair-form');
  const shoe = dialog.querySelector('.pair-tag__shoe');
  const colourField = document.getElementById('pair-colours');
  const colourChips = dialog.querySelector('[data-chips="colour"]');
  const sizeChips = dialog.querySelector('[data-chips="size"]');
  let pair = null;

  const open = (name) => {
    pair = catalog.get(name);
    if (!pair) return;
    selection.set({ pair: name });
    const { colour, footSize } = selection.get();
    const fits = footSize !== null && footSize >= pair.min && footSize <= pair.max;
    const hasColours = pair.colours.length > 0; // only the Minggu comes in colours, and only the Minggu is drawn

    document.getElementById('pair-title').textContent = pair.name;
    document.getElementById('pair-desc').textContent = pair.description;
    document.getElementById('pair-price-tag').textContent = formatRupiah(pair.price);
    document.getElementById('pair-size-note').textContent = sizeNoteFor(pair, footSize, fits);
    shoe.toggleAttribute('hidden', !hasColours); // an <svg> has no .hidden property
    shoe.dataset.colour = colour;
    colourField.hidden = !hasColours;
    colourChips.replaceChildren(...pair.colours.map((value) => chip({ name: 'colour', value, label: capitalise(value), checked: value === colour })));
    sizeChips.replaceChildren(...sizesOf(pair).map((size) => chip({ name: 'size', value: String(size), label: String(size), checked: fits && size === footSize, marked: fits && size === footSize })));
    sheet.open();
  };

  form.addEventListener('change', (event) => {
    if (event.target.name !== 'colour') return;
    shoe.dataset.colour = event.target.value;
    selection.set({ colour: event.target.value });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const colour = pair.colours.length > 0 ? form.elements.colour.value : null;
    bag.add({ pair: pair.name, colour, size: Number(form.elements.size.value), price: pair.price });
    sheet.close();
    onAdded();
  });

  return { open };
};
