import { SHOP } from '../shop.js';

// The links in index.html carry placeholder contact details for visitors without JavaScript;
// with it, they take the shop's real details from shop.js.
export const applyShopDetails = () => {
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
    link.href = link.href.replace(/^https:\/\/wa\.me\/[^?]*/, `https://wa.me/${SHOP.whatsapp}`);
  });
  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.href = link.href.replace(/^mailto:[^?]*/, `mailto:${SHOP.email}`);
    if (link.textContent.includes('@')) link.textContent = SHOP.email;
  });
};
