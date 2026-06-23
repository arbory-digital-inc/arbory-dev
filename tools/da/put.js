#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Upload a single local file (any type — SVG, image, html, json) to a
 * Document Authoring (DA) source path, and optionally trigger an AEM preview.
 *
 * Unlike upload.js (which maps content/*.plain.html trees), this is a direct
 * "put this file at this DA path" helper — handy for icons/logos.
 *
 *   node tools/da/put.js <local-file> <da-path> [options]
 *
 * <da-path> is org/repo/path (e.g. icons/shriram-general-insurance.svg implies
 * the default org/repo) — or a full org/repo/path. The leading
 * https://content.da.live/ prefix is stripped if present.
 *
 * Examples:
 *   node tools/da/put.js tools/importer/staged-icons/foo.svg icons/foo.svg
 *   node tools/da/put.js logo.svg sasaem/sas-da/icons/foo.svg --preview=edge-150
 *
 * Options:
 *   --org=<org>          DA org (default: sasaem).
 *   --repo=<repo>        DA repo (default: sas-da).
 *   --preview=<branch>   After upload, POST an AEM preview for <branch>.
 *   --token-file=<path>  Token file (default: ~/today-da-token.txt).
 */
import { readFile } from 'node:fs/promises';
import { argv, env, exit } from 'node:process';
import { basename, join } from 'node:path';
import { homedir } from 'node:os';

const DEFAULTS = {
  org: 'sasaem',
  repo: 'sas-da',
  apiBase: 'https://admin.da.live/source',
  previewBase: 'https://admin.hlx.page/preview',
  tokenFile: join(homedir(), 'today-da-token.txt'),
};

const MIME = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  json: 'application/json',
  html: 'text/html',
};

function extractToken(raw) {
  if (!raw) return '';
  if (!raw.startsWith('{') && !raw.startsWith('[') && !raw.startsWith('"')) return raw;
  try {
    const stack = [JSON.parse(raw)];
    while (stack.length) {
      const cur = stack.pop();
      if (cur && typeof cur === 'object') {
        for (const [k, v] of Object.entries(cur)) {
          if (typeof v === 'string' && /^(access_?token|token)$/i.test(k)) return v;
          if (v && typeof v === 'object') stack.push(v);
        }
      }
    }
  } catch { /* not JSON */ }
  return raw;
}

function parseArgs(args) {
  const opts = { ...DEFAULTS, preview: null, positionals: [] };
  for (const a of args) {
    if (a.startsWith('--org=')) opts.org = a.slice(6);
    else if (a.startsWith('--repo=')) opts.repo = a.slice(7);
    else if (a.startsWith('--preview=')) opts.preview = a.slice(10);
    else if (a.startsWith('--token-file=')) opts.tokenFile = a.slice(13);
    else if (a.startsWith('--')) throw new Error(`Unknown option: ${a}`);
    else opts.positionals.push(a);
  }
  if (opts.positionals.length !== 2) {
    throw new Error('Usage: node tools/da/put.js <local-file> <da-path> [--preview=branch]');
  }
  [opts.file, opts.daPath] = opts.positionals;
  opts.daPath = opts.daPath.replace(/^https?:\/\/content\.da\.live\//i, '').replace(/^\/+/, '');
  // If the path already starts with org/repo, use it verbatim; else prefix.
  if (!opts.daPath.startsWith(`${opts.org}/${opts.repo}/`)) {
    opts.daPath = `${opts.org}/${opts.repo}/${opts.daPath}`;
  }
  return opts;
}

async function main() {
  let opts;
  try {
    opts = parseArgs(argv.slice(2));
  } catch (e) {
    console.error(e.message);
    exit(2);
  }

  opts.token = env.DA_TOKEN;
  if (!opts.token) {
    try {
      opts.token = extractToken((await readFile(opts.tokenFile, 'utf8')).trim());
    } catch (e) { if (e.code !== 'ENOENT') throw e; }
  }
  if (!opts.token) {
    console.error('Error: no auth token (DA_TOKEN, --token-file, or ~/today-da-token.txt).');
    exit(1);
  }

  const buf = await readFile(opts.file);
  const ext = basename(opts.file).split('.').pop().toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';

  const url = `${opts.apiBase}/${opts.daPath}`;
  const form = new FormData();
  form.append('data', new Blob([buf], { type }), basename(opts.daPath));
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opts.token}` },
    body: form,
  });
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    console.error(`✗ POST ${res.status} ${url}: ${text.slice(0, 300)}`);
    exit(1);
  }
  console.log(`✓ ${opts.file} -> ${url} [${res.status}]`);

  if (opts.preview) {
    const rel = opts.daPath.replace(`${opts.org}/${opts.repo}/`, '');
    const pUrl = `${opts.previewBase}/${opts.org}/${opts.repo}/${opts.preview}/${rel}`;
    const pRes = await fetch(pUrl, { method: 'POST', headers: { Authorization: `Bearer ${opts.token}` } });
    if (!pRes.ok) {
      const pErr = pRes.headers.get('x-error') || (await pRes.text()).slice(0, 200);
      console.error(`✗ preview ${pRes.status}: ${pErr}`);
      exit(1);
    }
    console.log(`✓ previewed ${opts.preview}/${rel} [${pRes.status}]`);
  }
}

main().catch((e) => {
  console.error(e);
  exit(1);
});
