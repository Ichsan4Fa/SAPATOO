import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orderNumber, orderMessage, whatsappLink, describeLine, pairsLabel } from '../js/order.js';
import { formatRupiah } from '../js/money.js';
import { SHOP } from '../js/shop.js';

const lines = [
  { pair: 'Tinta', colour: null, size: 42, price: 649000, quantity: 1 },
  { pair: 'Minggu', colour: 'black', size: 38, price: 459000, quantity: 2 },
];

test('rupiah are written with dots between thousands', () => {
  assert.equal(formatRupiah(1290000), 'Rp 1.290.000');
  assert.equal(formatRupiah(299000), 'Rp 299.000');
});

test('order numbers carry the date and a short code without look-alike letters', () => {
  const number = orderNumber(new Date(2026, 9, 29), () => 0);
  assert.equal(number, 'SPT-261029-2222');
  assert.match(orderNumber(), /^SPT-\d{6}-[2-9A-HJ-NP-Z]{4}$/);
});

test('a line names the pair, colour and size', () => {
  assert.equal(describeLine(lines[0]), 'Tinta, EU 42');
  assert.equal(describeLine(lines[1]), 'Minggu in black, EU 38');
  assert.equal(pairsLabel(1), '1 pair');
});

test('a courier order lists every line, the subtotal, payment and address', () => {
  const message = orderMessage({
    number: 'SPT-261029-ABCD',
    lines,
    customer: { name: 'Sari', delivery: 'courier', address: 'Jl. Braga 12, Bandung 40111', payment: 'transfer', note: '' },
  });
  assert.equal(message, [
    'Hello SAPATOO, I would like to order (SPT-261029-ABCD):',
    '',
    '1 × Tinta, EU 42: Rp 649.000',
    '2 × Minggu in black, EU 38: Rp 918.000',
    '',
    'Subtotal: Rp 1.567.000 for 3 pairs',
    'Delivery: Courier to my address (free)',
    'Payment: Bank transfer',
    '',
    'Name: Sari',
    'Address: Jl. Braga 12, Bandung 40111',
  ].join('\n'));
});

test('a small courier order asks for the courier rate; a collected order has no address', () => {
  const small = [{ pair: 'Boneka', colour: null, size: 20, price: 299000, quantity: 1 }];
  const courier = orderMessage({ number: 'X', lines: small, customer: { name: 'Sari', delivery: 'courier', address: 'Bandung', payment: 'ewallet' } });
  assert.match(courier, /Delivery: Courier to my address \(please add the courier's rate\)/);
  const collect = orderMessage({ number: 'X', lines: small, customer: { name: 'Sari', delivery: 'collect', address: 'ignored', payment: 'shop', note: 'Saturday' } });
  assert.match(collect, /Delivery: I will collect it in the shop/);
  assert.doesNotMatch(collect, /Address:/);
  assert.match(collect, /Note: Saturday$/);
});

test('the WhatsApp link goes to the shop number with the message encoded', () => {
  assert.equal(whatsappLink('Hi & bye\nok'), `https://wa.me/${SHOP.whatsapp}?text=Hi%20%26%20bye%0Aok`);
});
