import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { isLocalHost, resolvePath } from '../scripts/serve.mjs';

const base = join(tmpdir(), 'sapatoo-site');

test('the dev server answers only requests addressed to this machine', () => {
  assert.equal(isLocalHost('localhost:5173', 5173), true);
  assert.equal(isLocalHost('LOCALHOST:5173', 5173), true);
  assert.equal(isLocalHost('127.0.0.1:5173', 5173), true);
  assert.equal(isLocalHost('[::1]:5173', 5173), true);
  assert.equal(isLocalHost('attacker.example', 5173), false); // DNS rebinding keeps the attacker's host name
  assert.equal(isLocalHost('localhost:5174', 5173), false);
  assert.equal(isLocalHost(undefined, 5173), false);
});

test('pages inside the folder are served', () => {
  assert.deepEqual(resolvePath('/', base), { status: 200, file: join(base, 'index.html') });
  assert.deepEqual(resolvePath('/css/style.css?v=2', base), { status: 200, file: join(base, 'css', 'style.css') });
});

test('hidden files such as .git are never served', () => {
  for (const path of ['/.git/config', '/.claude/launch.json', '/css/../.git/HEAD', '/%2Egit/config', '/js/.hidden']) {
    assert.equal(resolvePath(path, base).status, 404, path);
  }
});

test('nothing outside the folder is served, including a neighbouring folder with the same name start', () => {
  for (const path of ['/..%2F..%2FWindows%2Fwin.ini', '/..%5C..%5Csecret.txt', '/..%2Fsapatoo-site-old%2Fnotes.txt']) {
    assert.equal(resolvePath(path, base).status, 404, path);
  }
  // An encoded ".." segment is already removed by address parsing, so it stays inside the folder.
  assert.deepEqual(resolvePath('/%2E%2E/x', base), { status: 200, file: join(base, 'x') });
});

test('a malformed address is refused instead of crashing the server', () => {
  assert.deepEqual(resolvePath('/%E0%A4%A', base), { status: 400 });
});
