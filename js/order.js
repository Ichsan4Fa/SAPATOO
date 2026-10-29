import { SHOP } from './shop.js';
import { formatRupiah } from './money.js';
import { countPairs, subtotal } from './bag.js';

export const DELIVERY = {
  courier: 'Courier to my address',
  collect: 'I will collect it in the shop',
};

export const PAYMENT = {
  transfer: 'Bank transfer',
  card: 'Card',
  ewallet: 'E-wallet',
  shop: 'Cash or card in the shop',
};

export const describePair = ({ pair, colour }) => (colour ? `${pair} in ${colour}` : pair);
export const describeLine = (line) => `${describePair(line)}, EU ${line.size}`;
export const pairsLabel = (count) => `${count} ${count === 1 ? 'pair' : 'pairs'}`;

// Short enough to read out over the phone; no 0/O or 1/I to mix up.
const CODE_LETTERS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export const orderNumber = (date = new Date(), random = Math.random) => {
  const day = [date.getFullYear() % 100, date.getMonth() + 1, date.getDate()].map((part) => String(part).padStart(2, '0')).join('');
  const code = Array.from({ length: 4 }, () => CODE_LETTERS[Math.floor(random() * CODE_LETTERS.length)]).join('');
  return `SPT-${day}-${code}`;
};

const deliveryLine = (method, total) => {
  if (method === 'collect') return DELIVERY.collect;
  return total >= SHOP.freeDeliveryFrom ? `${DELIVERY.courier} (free)` : `${DELIVERY.courier} (please add the courier's rate)`;
};

export const orderMessage = ({ number, lines, customer }) => {
  const total = subtotal(lines);
  return [
    `Hello SAPATOO, I would like to order (${number}):`,
    '',
    ...lines.map((line) => `${line.quantity} × ${describeLine(line)}: ${formatRupiah(line.price * line.quantity)}`),
    '',
    `Subtotal: ${formatRupiah(total)} for ${pairsLabel(countPairs(lines))}`,
    `Delivery: ${deliveryLine(customer.delivery, total)}`,
    `Payment: ${PAYMENT[customer.payment]}`,
    '',
    `Name: ${customer.name}`,
    ...(customer.delivery === 'courier' ? [`Address: ${customer.address}`] : []),
    ...(customer.note ? [`Note: ${customer.note}`] : []),
  ].join('\n');
};

export const whatsappLink = (text) => `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`;
export const emailLink = (subject, body) => `mailto:${SHOP.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
