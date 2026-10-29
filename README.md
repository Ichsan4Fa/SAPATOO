# SAPATOO

The website of SAPATOO, a shoe store for men, women and kids. Every pair is named after a word Indonesian took from Portuguese, starting with the shop's own name: *sapato*, Portuguese for shoe, which became the Indonesian *sepatu*.

It is a static site in plain HTML, CSS and JavaScript, with no framework, no dependencies and no build step. Orders don't go through a server: visitors fill a bag, and checkout sends the order to the shop on WhatsApp (or by email) with an order number. The shop replies with the total, the delivery cost and a payment link.

## What it does

- **Price list.** Sixteen pairs. Each one opens its own swing tag with its colours and sizes.
- **Size finder.** A foot length in centimetres gives the EU, UK and US size, and adds the chosen pair in that size. Pairs not made in that size say which sizes they come in.
- **Bag.** Kept on the visitor's device between visits, with quantities and the free-delivery threshold.
- **Checkout.** Name, courier or collection, payment preference and a note, sent on WhatsApp or by email.
- **App and offline.** It can be installed from the browser, and pages already visited open without a connection.
- **No JavaScript needed to read it.** Without JavaScript the price list, size chart and contact links still work.

## Run it

You need Node 22 or newer. There is nothing to install.

```bash
npm start
```

That serves the site at http://localhost:5173. The other scripts:

```bash
npm test
```

```bash
npm run images
```

`npm test` checks the size, bag and order maths and the local server's guards. `npm run images` redraws the app icons and the link preview picture from `assets/icons/icon.svg` and the shoe drawing; it needs Chrome or Edge.

## Before going live

| What | Where |
| --- | --- |
| WhatsApp number | `js/shop.js`, and the `62XXXXXXXXXX` placeholders in `index.html` (one find and replace) |
| Email address | `js/shop.js`, and `hello@sapatoo.example` in `index.html` |
| Pairs, prices and sizes | The price list in `index.html`. Each `.item` link carries `data-price` and `data-sizes`, and the page reads every pair from there |
| Shop address, hours, delivery and payment terms | `index.html` (the price list, the slip, the questions and the footer) |
| Site address | If it isn't `https://ichsan4fa.github.io/SAPATOO/`, change the canonical and preview links in `index.html`, `robots.txt` and `sitemap.xml` |
| Instagram, Privacy and Terms links | The footer in `index.html` |

When you add or rename a file in `js/`, add it to the list in `sw.js` and change its `VERSION`, so returning visitors get the new files.

## Security notes

- **Totals in an order message are the customer's claim.** The page checks every saved bag against today's price list, but a WhatsApp or email message can be edited before it is sent. Always reply with the total from your own price list.
- **One address, shared.** Every GitHub Pages site of one account lives under the same address (`ichsan4fa.github.io`), and sites there can read each other's saved data. If you publish other sites on this account, give the shop its own domain.
- **The local server is for this computer only.** `npm start` answers only requests for `localhost`, never serves hidden files such as `.git`, and stays inside the project folder.
- **No third parties at visit time.** The fonts are hosted with the site, so a visit only contacts GitHub Pages; WhatsApp and email are opened only when the visitor sends an order.

## Publish

`.github/workflows/pages.yml` runs the tests and publishes the site to GitHub Pages on every push to `main`. Turn it on once in the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The steps the workflow borrows from GitHub (`actions/checkout` and the others) are pinned to exact commits, because a version label like `v4` can be moved to different code. The comment beside each one names its release. To update a step, find the new release on its GitHub page and copy that release's full commit ID.

## Where things are

- `index.html` is the page; `css/style.css` styles it.
- `js/main.js` wires the page together. The shop's logic is in `js/shop.js`, `sizes.js`, `money.js`, `bag.js`, `order.js`, `selection.js` and `catalog.js`; each file in `js/ui/` runs one part of the page.
- `sw.js` is the offline helper; `manifest.webmanifest` makes the site installable; `404.html` is the page for missing addresses.
- `scripts/` holds the local server and the image renderer; `tests/` holds the tests.
- `.taste-skill/notes.md` has the design notes: the idea behind the page and why it looks the way it does.

## Pictures and type

The typeface is General Sans by the Indian Type Foundry, used under the ITF Free Font License from [Fontshare](https://www.fontshare.com/fonts/general-sans); its files are in `assets/fonts/`.

The shoes are drawn by SAPATOO. The other pictures come from Wikimedia Commons: "Shoe trees" by Wilfredor (CC0), "Shoe Last" by Harvey Thoss (CC0), "Portuguese Malacca, 1635" (CC0), "Schoenmaker op Java" by Willem van de Poll (CC0), and the film "Shoemaker in puran dhaka" by Wasiul Bahar (CC BY-SA 4.0). Full credits are in `assets/credits.json` and the page footer.
