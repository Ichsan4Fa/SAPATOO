import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sizesFor, parseLength, clampFoot, isStocked, toHalf } from '../js/sizes.js';

test('an adult foot gets EU, UK and US sizes', () => {
  assert.deepEqual(sizesFor(26.5), { eu: 42, other: 'UK 8 · US 9 men, 10 women' });
});

test('a child foot gets kids sizes', () => {
  assert.deepEqual(sizesFor(12), { eu: 20, other: 'UK 4 kids · US 4½ kids' });
});

test('the printed size chart matches the formula', () => {
  // The <noscript> chart in index.html: foot length, EU, UK.
  const chart = [[22.5, 36, '3½'], [23.5, 38, '4½'], [24.5, 39, '5½'], [25.5, 41, '7'], [26.5, 42, '8'], [27.5, 44, '9½'], [28.5, 45, '10½'], [29.5, 47, '11½']];
  for (const [cm, eu, uk] of chart) {
    const sizes = sizesFor(cm);
    assert.equal(sizes.eu, eu, `${cm} cm`);
    assert.ok(sizes.other.startsWith(`UK ${uk} `), `${cm} cm gives ${sizes.other}`);
  }
});

test('lengths typed with a comma or spaces are read', () => {
  assert.equal(parseLength(' 24,3 '), 24.3);
  assert.ok(Number.isNaN(parseLength('abc')));
});

test('lengths are kept to what the slip accepts and rounded to half centimetres', () => {
  assert.equal(clampFoot(40), 32);
  assert.equal(clampFoot(4), 10);
  assert.equal(toHalf(24.3), 24.5);
});

test('only EU 19 to 47 is stocked', () => {
  assert.equal(isStocked(19), true);
  assert.equal(isStocked(47), true);
  assert.equal(isStocked(48), false);
});
