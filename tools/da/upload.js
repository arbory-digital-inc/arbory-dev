#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Upload local content fragments / pages to Document Authoring (DA).
 *
 * DA admin API: https://admin.da.live/source/{org}/{repo}/{path}.html
 *
 * Usage:
 *   DA_TOKEN=xxxx node tools/da/upload.js [paths...]
 *
 * Examples:
 *   # Upload everything under content/<locale>/ to DA root
 *   DA_TOKEN=$DA_TOKEN node tools/da/upload.js
 *
 *   # Upload a single fragment
 *   DA_TOKEN=$DA_TOKEN node tools/da/upload.js content/en/fragments/nav/footer.plain.html
 *
 *   # Dry run (print what would happen, no network calls)
 *   DA_TOKEN=$DA_TOKEN node tools/da/upload.js --dry-run
 *
 * Options:
 *   --dry-run            Print what would be uploaded; do not call DA.
 *   --org=<org>          Override DA org (default: sasaem).
 *   --repo=<repo>        Override DA repo (default: sas-da).
 *   --content=<dir>      Local content root (default: ./content).
 *   --concurrency=<n>    Parallel upload workers (default: 4).
 *   --token-file=<path>  Read auth token from file (default: ~/today-da-token.txt).
 *
 * Path mapping:
 *   content/en/fragments/nav/footer.plain.html
 *     -> https://admin.da.live/source/sasaem/sas-da/en/fragments/nav/footer.html
 *   content/en/home.plain.html
 *     -> https://admin.da.live/source/sasaem/sas-da/en/home.html
 *
 * Auth:
 *   Get an IMS access token from da.live (DevTools > Application > Local
 *   Storage > nx-ims). Provide it via DA_TOKEN env var, --token-file, or
 *   place it in ~/today-da-token.txt (the default token file).
 */
import { readFile, stat, readdir } from 'node:fs/promises';
import { argv, env, exit, cwd } from 'node:process';
import { join, relative, posix, sep } from 'node:path';
import { homedir } from 'node:os';
import { toDaFormat } from './to-da-format.js';

const DEFAULTS = {
  org: 'sasaem',
  repo: 'sas-da',
  content: 'content',
  concurrency: 4,
  apiBase: 'https://admin.da.live/source',
  tokenFile: join(homedir(), 'today-da-token.txt'),
};

/**
 * Extract a bearer token from a token file. Supports either:
 *   - a raw token string
 *   - a JSON blob (e.g. da.live's `nx-ims` value) with an
 *     `access_token` / `accessToken` / `token` field at any depth
 */
function extractToken(raw) {
  if (!raw) return '';
  // Likely raw token: starts with eyJ (JWT) or is a plain string with no JSON.
  if (!raw.startsWith('{') && !raw.startsWith('[') && !raw.startsWith('"')) {
    return raw;
  }
  try {
    const obj = JSON.parse(raw);
    const stack = [obj];
    while (stack.length) {
      const cur = stack.pop();
      if (cur && typeof cur === 'object') {
        for (const [k, v] of Object.entries(cur)) {
          if (typeof v === 'string' && /^(access_?token|token)$/i.test(k)) return v;
          if (v && typeof v === 'object') stack.push(v);
        }
      }
    }
  } catch {
    // not JSON; fall through
  }
  return raw;
}

function parseArgs(args) {
  const opts = { ...DEFAULTS, dryRun: false, paths: [] };
  for (const arg of args) {
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg.startsWith('--org=')) opts.org = arg.slice(6);
    else if (arg.startsWith('--repo=')) opts.repo = arg.slice(7);
    else if (arg.startsWith('--content=')) opts.content = arg.slice(10);
    else if (arg.startsWith('--concurrency=')) opts.concurrency = Number(arg.slice(14));
    else if (arg.startsWith('--token-file=')) opts.tokenFile = arg.slice(13);
    else if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
    else opts.paths.push(arg);
  }
  return opts;
}

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile()) out.push(full);
  }));
  return out;
}

async function collectFiles(opts) {
  const root = opts.content;
  const inputs = opts.paths.length ? opts.paths : [root];
  const files = new Set();
  for (const input of inputs) {
    const info = await stat(input);
    if (info.isDirectory()) {
      const found = await walk(input);
      found.forEach((f) => files.add(f));
    } else {
      files.add(input);
    }
  }
  return [...files].filter((f) => f.endsWith('.html'));
}

/**
 * Map a local content file to its DA path (without extension).
 *   content/en/fragments/nav/footer.plain.html -> en/fragments/nav/footer
 *   content/en/home.plain.html                 -> en/home
 */
function toDaPath(file, contentRoot) {
  const rel = relative(contentRoot, file).split(sep).join(posix.sep);
  return rel.replace(/\.plain\.html$/i, '').replace(/\.html$/i, '');
}

async function uploadFile(file, opts) {
  const daPath = toDaPath(file, opts.content);
  const url = `${opts.apiBase}/${opts.org}/${opts.repo}/${daPath}.html`;
  const raw = await readFile(file, 'utf8');
  // Transform `.plain.html` to DA-stored format (idempotent for already-DA HTML).
  const html = toDaFormat(raw);

  if (opts.dryRun) {
    console.log(`[dry-run] PUT ${url}  (${html.length} bytes)`);
    return { file, url, status: 'dry-run' };
  }

  // DA expects a multipart form with a `data` part containing the HTML.
  const form = new FormData();
  form.append('data', new Blob([html], { type: 'text/html' }), `${posix.basename(daPath)}.html`);

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opts.token}` },
    body: form,
  });

  const text = await res.text().catch(() => '');
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}: ${text.slice(0, 300)}`);
  }
  return { file, url, status: res.status, body: text };
}

async function pool(items, size, worker) {
  const results = [];
  let i = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const idx = i;
      i += 1;
      try {
        results[idx] = { ok: true, value: await worker(items[idx]) };
      } catch (err) {
        results[idx] = { ok: false, error: err, item: items[idx] };
      }
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  let opts;
  try {
    opts = parseArgs(argv.slice(2));
  } catch (err) {
    console.error(err.message);
    exit(2);
  }
  opts.token = env.DA_TOKEN;
  if (!opts.token && opts.tokenFile) {
    try {
      const raw = (await readFile(opts.tokenFile, 'utf8')).trim();
      opts.token = extractToken(raw);
      if (opts.token) console.log(`Using auth token from ${opts.tokenFile}`);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  if (!opts.dryRun && !opts.token) {
    console.error('Error: no auth token found. Provide one via DA_TOKEN, --token-file, or ~/today-da-token.txt.');
    console.error('Get one from da.live DevTools > Application > Local Storage > nx-ims.');
    exit(1);
  }

  const files = await collectFiles(opts);
  if (!files.length) {
    console.error(`No .html files found under ${opts.content} (cwd: ${cwd()})`);
    exit(1);
  }

  console.log(`Uploading ${files.length} file(s) to da.live/${opts.org}/${opts.repo}${opts.dryRun ? ' (dry run)' : ''}`);

  const results = await pool(files, opts.concurrency, (f) => uploadFile(f, opts));

  let failures = 0;
  for (const r of results) {
    if (r.ok) {
      console.log(`  ✓ ${r.value.file} -> ${r.value.url} [${r.value.status}]`);
    } else {
      failures += 1;
      console.error(`  ✗ ${r.item}: ${r.error.message}`);
    }
  }

  if (failures) {
    console.error(`\n${failures} upload(s) failed.`);
    exit(1);
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  exit(1);
});
