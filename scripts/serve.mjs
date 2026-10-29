// A small static server for working on the site locally: npm start (or node scripts/serve.mjs [port]).
// It is for this machine only. It answers only requests addressed to localhost, so a web page cannot reach it
// through DNS rebinding; it never serves hidden files such as .git; and it never leaves the project folder.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, isAbsolute, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(join(import.meta.dirname, '..'));
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
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

export const isLocalHost = (host, port) => [`localhost:${port}`, `127.0.0.1:${port}`, `[::1]:${port}`].includes(String(host).toLowerCase());

// Maps a request address to a file inside `base`: 400 for a malformed address, 404 for hidden files and for
// anything outside the folder (a string-prefix test would also let in a neighbouring folder like base-old).
export const resolvePath = (url, base = root) => {
  let path;
  try {
    path = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  } catch {
    return { status: 400 };
  }
  const file = normalize(join(base, path.endsWith('/') ? `${path}index.html` : path));
  const inside = relative(base, file);
  if (inside === '' || inside.startsWith('..') || isAbsolute(inside)) return { status: 404 };
  if (inside.split(sep).some((part) => part.startsWith('.'))) return { status: 404 };
  return { status: 200, file };
};

const send = (res, status, body, file) => res.writeHead(status, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }).end(body);

const handle = async (req, res, port) => {
  if (!isLocalHost(req.headers.host, port)) {
    res.writeHead(421, { 'Content-Type': 'text/plain; charset=utf-8' }).end('This server only answers requests for localhost.');
    return;
  }
  const { status, file } = resolvePath(req.url);
  if (status === 400) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Bad request');
    return;
  }
  if (status === 200) {
    const body = await readFile(file).catch(() => null);
    if (body !== null) { send(res, 200, body, file); return; }
  }
  // Like GitHub Pages: anything missing gets the site's own 404 page.
  const notFound = join(root, '404.html');
  send(res, 404, await readFile(notFound).catch(() => 'Not found'), notFound);
};

export const startServer = (port) => createServer((req, res) => {
  handle(req, res, port).catch(() => { if (!res.headersSent) res.writeHead(500).end(); });
}).listen(port, '127.0.0.1', () => console.log(`Serving ${root} at http://localhost:${port}`));

const runDirectly = process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (runDirectly) startServer(Number(process.argv[2]) || 5173);
