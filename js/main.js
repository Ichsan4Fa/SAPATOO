// SAPATOO: the page's moving parts, wired together. The shop's logic lives in js/*.js (and is tested in tests/);
// each module in js/ui/ owns one part of the page.
import { readCatalog } from './catalog.js';
import { createBag } from './bag.js';
import { createSelection } from './selection.js';
import { applyShopDetails } from './ui/shop-links.js';
import { startReveals } from './ui/reveal.js';
import { startFilm } from './ui/film.js';
import { setUpShowcase } from './ui/showcase.js';
import { setUpPairLinks } from './ui/pair-links.js';
import { setUpSizeSlip } from './ui/size-slip.js';
import { setUpPairSheet } from './ui/pair-sheet.js';
import { setUpBagPanel } from './ui/bag-panel.js';

const catalog = readCatalog();
const bag = createBag();
const selection = createSelection({ pair: 'Minggu', colour: 'black', footSize: null });

applyShopDetails();
startReveals();
startFilm();

const bagPanel = setUpBagPanel({ bag });
const pairSheet = setUpPairSheet({ catalog, selection, bag, onAdded: bagPanel.open });
setUpShowcase({ selection });
setUpPairLinks({ catalog, selection, openSheet: pairSheet.open });
setUpSizeSlip({ catalog, selection, bag, onAdded: bagPanel.open });

if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* the shop still works, just not offline */ });
}
