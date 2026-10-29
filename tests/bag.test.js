import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addToBag, setQuantity, removeLine, countPairs, subtotal, lineKey, readLines, createBag, reconcileLines, MAX_QUANTITY } from '../js/bag.js';

const tinta = { pair: 'Tinta', colour: null, size: 42, price: 649000 };
const minggu = { pair: 'Minggu', colour: 'black', size: 42, price: 459000 };

const fakeStorage = (saved) => {
  const items = new Map(saved === undefined ? [] : [['sapatoo.bag.v1', saved]]);
  return { getItem: (key) => items.get(key) ?? null, setItem: (key, value) => items.set(key, value), items };
};

test('adding the same pair, colour and size again raises its quantity', () => {
  const lines = addToBag(addToBag([], tinta), tinta);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].quantity, 2);
});

test('a different size or colour is its own line', () => {
  const lines = addToBag(addToBag(addToBag([], minggu), { ...minggu, size: 43 }), { ...minggu, colour: 'chalk' });
  assert.equal(lines.length, 3);
});

test('quantity stops at the maximum', () => {
  let lines = [];
  for (let i = 0; i < MAX_QUANTITY + 3; i += 1) lines = addToBag(lines, tinta);
  assert.equal(lines[0].quantity, MAX_QUANTITY);
  assert.equal(setQuantity(lines, lineKey(tinta), 20)[0].quantity, MAX_QUANTITY);
});

test('setting a quantity to zero or removing a line takes it out', () => {
  const lines = addToBag(addToBag([], tinta), minggu);
  assert.deepEqual(setQuantity(lines, lineKey(tinta), 0).map((line) => line.pair), ['Minggu']);
  assert.deepEqual(removeLine(lines, lineKey(minggu)).map((line) => line.pair), ['Tinta']);
});

test('pairs and subtotal count every quantity', () => {
  const lines = setQuantity(addToBag(addToBag([], tinta), minggu), lineKey(minggu), 2);
  assert.equal(countPairs(lines), 3);
  assert.equal(subtotal(lines), 649000 + 2 * 459000);
});

test('a bag saved earlier comes back, and broken saves are dropped', () => {
  assert.deepEqual(readLines(fakeStorage(JSON.stringify([{ ...tinta, quantity: 2 }]))), [{ ...tinta, quantity: 2 }]);
  assert.deepEqual(readLines(fakeStorage('{not json')), []);
  assert.deepEqual(readLines(fakeStorage(JSON.stringify([{ pair: 'Tinta', size: '42' }, { ...tinta, quantity: 1 }]))), [{ ...tinta, quantity: 1 }]);
});

const catalog = new Map([
  ['Tinta', { price: 649000, min: 36, max: 46, colours: [] }],
  ['Minggu', { price: 459000, min: 36, max: 46, colours: ['black', 'chalk', 'brass'] }],
  ['Boneka', { price: 299000, min: 19, max: 24, colours: [] }],
]);

test('a saved bag takes today\'s prices and loses pairs, sizes and colours that are not sold', () => {
  // The tampered bag from the security audit, plus an old price and a duplicate line.
  const saved = [
    { pair: 'Tinta', colour: null, size: 42, price: 1000, quantity: 2 },
    { pair: 'Discontinued pair', colour: 'gold', size: 12, price: 5000, quantity: 1 },
    { pair: 'Boneka', colour: null, size: 45, price: 299000, quantity: 1 },
    { pair: 'Minggu', colour: 'gold', size: 42, price: 459000, quantity: 1 },
    { pair: 'Minggu', colour: 'black', size: 42, price: 400000, quantity: 5 },
    { pair: 'Minggu', colour: 'black', size: 42, price: 459000, quantity: 7 },
    { pair: 'Tinta', colour: 'black', size: 40, price: 649000, quantity: 1 },
  ];
  assert.deepEqual(reconcileLines(saved, catalog), [
    { pair: 'Tinta', colour: null, size: 42, price: 649000, quantity: 2 },
    { pair: 'Minggu', colour: 'black', size: 42, price: 459000, quantity: MAX_QUANTITY },
    { pair: 'Tinta', colour: null, size: 40, price: 649000, quantity: 1 },
  ]);
});

test('a corrected bag is saved back, so the bad lines do not return', () => {
  const storage = fakeStorage(JSON.stringify([{ ...tinta, price: 1000, quantity: 1 }, { pair: 'Gone', colour: null, size: 40, price: 1, quantity: 1 }]));
  const bag = createBag({ storage, check: (lines) => reconcileLines(lines, catalog) });
  assert.deepEqual(bag.lines(), [{ ...tinta, quantity: 1 }]);
  assert.deepEqual(JSON.parse(storage.items.get('sapatoo.bag.v1')), [{ ...tinta, quantity: 1 }]);
});

test('the bag saves every change and tells whoever is watching', () => {
  const storage = fakeStorage();
  const bag = createBag({ storage });
  const seen = [];
  bag.watch((lines) => seen.push(countPairs(lines)));
  bag.add(tinta);
  bag.add(tinta);
  bag.empty();
  assert.deepEqual(seen, [0, 1, 2, 0]);
  assert.equal(storage.items.get('sapatoo.bag.v1'), '[]');
});
