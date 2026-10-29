// A small static server for working on the site locally: npm start (or node scripts/serve.mjs [port]).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = normalize(join(import.meta.dirname, '..'));
const port = Number(process.argv[2]) || 5173;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

const send = (res, status, body, file) => res.writeHead(status, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }).end(body);

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = normalize(join(root, path.endsWith('/') ? `${path}index.html` : path));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    send(res, 200, await readFile(file), file);
  } catch {
    // Like GitHub Pages: anything missing gets the site's own 404 page.
    const notFound = join(root, '404.html');
    send(res, 404, await readFile(notFound).catch(() => 'Not found'), notFound);
  }
}).listen(port, '127.0.0.1', () => console.log(`Serving ${root} at http://localhost:${port}`));
