// Keeps the shop usable without a connection. Every request goes to the network first, so a visitor always
// gets the newest page when online; the copy saved last time is used only when the network fails.
// Change VERSION when the list of core files below changes.
const VERSION = 'sapatoo-v1';
const CORE = [
  './',
  'index.html',
  '404.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/main.js',
  'js/shop.js',
  'js/sizes.js',
  'js/money.js',
  'js/bag.js',
  'js/order.js',
  'js/selection.js',
  'js/catalog.js',
  'js/ui/dialogs.js',
  'js/ui/shop-links.js',
  'js/ui/reveal.js',
  'js/ui/film.js',
  'js/ui/showcase.js',
  'js/ui/pair-links.js',
  'js/ui/size-slip.js',
  'js/ui/pair-sheet.js',
  'js/ui/bag-panel.js',
  'assets/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const saveCopy = (request, response) => {
  if (response.status !== 200) return;
  const copy = response.clone();
  caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
};

const savedCopy = async (request) => {
  const hit = await caches.match(request, { ignoreSearch: request.mode === 'navigate' });
  if (hit) return hit;
  if (request.mode === 'navigate') return (await caches.match('./')) ?? Response.error();
  return Response.error();
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Only the shop's own files; the film is streamed in ranges, which a cache cannot replay.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin || request.headers.has('range')) return;
  event.respondWith(
    fetch(request)
      .then((response) => { saveCopy(request, response); return response; })
      .catch(() => savedCopy(request)),
  );
});
