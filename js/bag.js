// The bag: one line per pair, colour and size, kept on this device only.

export const MAX_QUANTITY = 9;
const STORAGE_KEY = 'sapatoo.bag.v1';

export const lineKey = ({ pair, colour, size }) => [pair, colour ?? '', size].join('|');

export const addToBag = (lines, item) => {
  const key = lineKey(item);
  if (!lines.some((line) => lineKey(line) === key)) return [...lines, { ...item, quantity: 1 }];
  return lines.map((line) => (lineKey(line) === key ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + 1) } : line));
};

export const removeLine = (lines, key) => lines.filter((line) => lineKey(line) !== key);

export const setQuantity = (lines, key, quantity) => {
  if (quantity < 1) return removeLine(lines, key);
  return lines.map((line) => (lineKey(line) === key ? { ...line, quantity: Math.min(MAX_QUANTITY, quantity) } : line));
};

export const countPairs = (lines) => lines.reduce((sum, line) => sum + line.quantity, 0);
export const subtotal = (lines) => lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

// Anything read back from storage was written by an older page or edited by hand, so only well-formed lines survive.
const isLine = (line) => line !== null && typeof line === 'object'
  && typeof line.pair === 'string' && line.pair !== ''
  && (line.colour === null || typeof line.colour === 'string')
  && Number.isInteger(line.size) && Number.isInteger(line.price) && line.price > 0
  && Number.isInteger(line.quantity) && line.quantity >= 1 && line.quantity <= MAX_QUANTITY;

export const readLines = (storage) => {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter(isLine) : [];
  } catch {
    return [];
  }
};

const writeLines = (storage, lines) => {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* private windows can refuse storage; the bag still works until the tab closes */ }
};

const memoryStorage = () => {
  const items = new Map();
  return { getItem: (key) => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) };
};

const deviceStorage = () => {
  try {
    window.localStorage.getItem(STORAGE_KEY);
    return window.localStorage;
  } catch {
    return memoryStorage();
  }
};

export const createBag = (storage = deviceStorage()) => {
  let lines = readLines(storage);
  const listeners = new Set();
  const publish = () => listeners.forEach((listener) => listener(lines));
  const commit = (next) => { lines = next; writeLines(storage, lines); publish(); };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY) return;
      lines = readLines(storage);
      publish();
    });
  }

  return {
    lines: () => lines,
    add: (item) => commit(addToBag(lines, item)),
    setQuantity: (key, quantity) => commit(setQuantity(lines, key, quantity)),
    remove: (key) => commit(removeLine(lines, key)),
    empty: () => commit([]),
    watch: (listener) => { listeners.add(listener); listener(lines); },
  };
};
