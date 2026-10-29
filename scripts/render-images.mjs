// Draws the app icons and the link preview picture with headless Chrome: npm run images.
// The icon comes from assets/icons/icon.svg; the preview uses the Minggu drawing from index.html.
// Set CHROME_PATH if Chrome or Edge is not in its usual place.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = join(import.meta.dirname, '..');
const icons = join(root, 'assets', 'icons');

const findChrome = () => {
  const candidates = [
    process.env.CHROME_PATH,
    join(process.env.PROGRAMFILES ?? '', 'Google/Chrome/Application/chrome.exe'),
    join(process.env['PROGRAMFILES(X86)'] ?? '', 'Google/Chrome/Application/chrome.exe'),
    join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe'),
    join(process.env['PROGRAMFILES(X86)'] ?? '', 'Microsoft/Edge/Application/msedge.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ];
  const found = candidates.find((path) => path && existsSync(path));
  if (!found) throw new Error('Chrome was not found. Set CHROME_PATH to its executable.');
  return found;
};

const chrome = findChrome();
const work = mkdtempSync(join(tmpdir(), 'sapatoo-images-'));

const screenshot = (name, html, width, height, output) => {
  const page = join(work, `${name}.html`);
  writeFileSync(page, html);
  execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--user-data-dir=${join(work, 'profile')}`, `--window-size=${width},${height}`,
    '--virtual-time-budget=5000', `--screenshot=${output}`, pathToFileURL(page).href,
  ], { stdio: 'ignore' });
  console.log(`wrote ${output}`);
};

const page = (width, height, body, head = '') => `<!doctype html><html><head><meta charset="utf-8">${head}
<style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden;background:#181715}</style></head><body>${body}</body></html>`;

const iconSvg = readFileSync(join(icons, 'icon.svg'), 'utf8').replace('<svg ', '<svg style="display:block;width:100%;height:100%" ');
for (const [file, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512], ['apple-touch-icon.png', 180]]) {
  screenshot(file, page(size, size, iconSvg), size, size, join(icons, file));
}

const shoe = readFileSync(join(root, 'index.html'), 'utf8').match(/<symbol id="minggu"[\s\S]*?<\/symbol>/)[0];
const preview = page(1200, 630, `
<svg width="0" height="0" style="position:absolute">${shoe}</svg>
<div class="card">
  <div class="words">
    <span class="eyelet"></span>
    <p class="name">SAPATOO</p>
    <p class="kind">shoe store</p>
    <p class="line">Sneakers, running shoes, boots and dress shoes. Every pair is named after a word Indonesian took from Portuguese.</p>
  </div>
  <svg class="shoe" viewBox="0 0 640 290"><use href="#minggu"/></svg>
</div>`, `<style>
  ${[['Regular', 400], ['Bold', 700]].map(([name, weight]) => `@font-face{font-family:'General Sans';src:url('${pathToFileURL(join(root, 'assets', 'fonts', `GeneralSans-${name}.woff2`)).href}') format('woff2');font-weight:${weight};font-display:block}`).join('\n  ')}
  .card{box-sizing:border-box;width:1200px;height:630px;padding:72px 64px;display:grid;grid-template-columns:minmax(0,1fr) 460px;align-items:center;gap:40px;font-family:'General Sans',sans-serif;color:#e8e8e3}
  .eyelet{display:block;width:44px;height:44px;border-radius:50%;background:#181715;border:11px solid #bfb21a;box-sizing:border-box;margin-bottom:40px}
  .name{margin:0;font-size:112px;font-weight:700;line-height:.9;letter-spacing:-.03em;color:#bfb21a}
  .kind{margin:4px 0 0;font-size:64px;font-weight:700;line-height:1;letter-spacing:-.02em}
  .line{margin:36px 0 0;max-width:30ch;font-size:26px;line-height:1.35;color:#b5b4ac}
  .shoe{width:460px;--upper:#f6f5f0;--upper-shade:#e2e1d9;--upper-light:#fff;--lace:#181715;--eyelet:#181715;--stitch:#a3a297;--mark:#bfb21a;--tab:#bfb21a;--stripe:#bfb21a;--sole:#f1f1ec;--sole-dark:#c9c8bf;--sole-shade:#8f8d84}
</style>`);
screenshot('og', preview, 1200, 630, join(root, 'assets', 'og.png'));

rmSync(work, { recursive: true, force: true });
