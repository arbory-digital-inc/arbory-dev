#!/usr/bin/env node
/* eslint-disable no-await-in-loop, no-console, no-restricted-syntax */
/**
 * Copy a DA content tree from one repository to another.
 *
 * Usage:
 *   DA_TOKEN=xxxx node tools/da/copy-tree.js [options]
 *
 * Defaults copy the full Arbory DA tree into this dev repository:
 *   arbory-digital-inc/arbory-da  ->  arbory-digital-inc/arbory-dev
 *
 * Examples:
 *   node tools/da/copy-tree.js --dry-run
 *   node tools/da/copy-tree.js --root=en --concurrency=8
 *   node tools/da/copy-tree.js \
 *     --from=https://da.live/#/arbory-digital-inc/arbory-da \
 *     --to=https://da.live/#/arbory-digital-inc/arbory-dev
 *
 * Options:
 *   --dry-run              Crawl and print what would be copied; do not write.
 *   --from=<ref>           Source DA ref: org/repo[/path] or DA/content URL.
 *   --to=<ref>             Target DA ref: org/repo[/path] or DA/content URL.
 *   --source-org=<org>     Source DA org (default: arbory-digital-inc).
 *   --source-repo=<repo>   Source DA repo (default: arbory-da).
 *   --target-org=<org>     Target DA org (default: arbory-digital-inc).
 *   --target-repo=<repo>   Target DA repo (default: arbory-dev).
 *   --root=<path>          Source subtree to crawl (default: repository root).
 *   --target-root=<path>   Target subtree. If omitted, source paths are kept.
 *   --concurrency=<n>      Parallel copy workers (default: 4).
 *   --token-file=<path>    Token file (default: ~/today-da-token.txt).
 */
import { readFile } from 'node:fs/promises';
import { argv, env, exit } from 'node:process';
import { basename, join, posix } from 'node:path';
import { homedir } from 'node:os';

const DEFAULTS = {
  sourceOrg: 'arbory-digital-inc',
  sourceRepo: 'arbory-da',
  targetOrg: 'arbory-digital-inc',
  targetRepo: 'arbory-dev',
  root: '',
  targetRoot: null,
  concurrency: 4,
  apiBase: 'https://admin.da.live',
  tokenFile: join(homedir(), 'today-da-token.txt'),
};

function usage() {
  console.log(`Usage: node tools/da/copy-tree.js [options]

Copy DA content from arbory-digital-inc/arbory-da to arbory-digital-inc/arbory-dev.

Options:
  --dry-run              Crawl and print what would be copied; do not write.
  --from=<ref>           Source DA ref: org/repo[/path] or DA/content URL.
  --to=<ref>             Target DA ref: org/repo[/path] or DA/content URL.
  --source-org=<org>     Source DA org (default: arbory-digital-inc).
  --source-repo=<repo>   Source DA repo (default: arbory-da).
  --target-org=<org>     Target DA org (default: arbory-digital-inc).
  --target-repo=<repo>   Target DA repo (default: arbory-dev).
  --root=<path>          Source subtree to crawl (default: repository root).
  --target-root=<path>   Target subtree. If omitted, source paths are kept.
  --concurrency=<n>      Parallel copy workers (default: 4).
  --token-file=<path>    Token file (default: ~/today-da-token.txt).`);
}

function extractToken(raw) {
  if (!raw) return '';
  if (!raw.startsWith('{') && !raw.startsWith('[') && !raw.startsWith('"')) return raw;
  try {
    const stack = [JSON.parse(raw)];
    while (stack.length) {
      const cur = stack.pop();
      if (cur && typeof cur === 'object') {
        for (const [key, value] of Object.entries(cur)) {
          if (typeof value === 'string' && /^(access_?token|token)$/i.test(key)) return value;
          if (value && typeof value === 'object') stack.push(value);
        }
      }
    }
  } catch {
    // not JSON; fall through
  }
  return raw;
}

function cleanPath(value = '') {
  return value.replace(/^\/+|\/+$/g, '');
}

function parseDaRef(ref) {
  let value = ref.trim();
  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    if (url.hostname === 'da.live' && url.hash.startsWith('#/')) {
      value = url.hash.slice(2);
    } else if (url.hostname === 'content.da.live' || url.hostname === 'admin.da.live') {
      value = url.pathname.replace(/^\/(source|list)\//, '').replace(/^\/+/, '');
    } else {
      throw new Error(`Unsupported DA URL: ${ref}`);
    }
  }

  const [org, repo, ...pathParts] = cleanPath(value).split('/');
  if (!org || !repo) throw new Error(`Expected DA ref as org/repo[/path], got: ${ref}`);
  return { org, repo, path: cleanPath(pathParts.join('/')) };
}

function parseArgs(args) {
  const opts = { ...DEFAULTS, dryRun: false };
  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg.startsWith('--from=')) {
      const ref = parseDaRef(arg.slice(7));
      opts.sourceOrg = ref.org;
      opts.sourceRepo = ref.repo;
      opts.root = ref.path;
    } else if (arg.startsWith('--to=')) {
      const ref = parseDaRef(arg.slice(5));
      opts.targetOrg = ref.org;
      opts.targetRepo = ref.repo;
      opts.targetRoot = ref.path || null;
    } else if (arg.startsWith('--source-org=')) opts.sourceOrg = arg.slice(13);
    else if (arg.startsWith('--source-repo=')) opts.sourceRepo = arg.slice(14);
    else if (arg.startsWith('--target-org=')) opts.targetOrg = arg.slice(13);
    else if (arg.startsWith('--target-repo=')) opts.targetRepo = arg.slice(14);
    else if (arg.startsWith('--root=')) opts.root = cleanPath(arg.slice(7));
    else if (arg.startsWith('--target-root=')) opts.targetRoot = cleanPath(arg.slice(14));
    else if (arg.startsWith('--concurrency=')) opts.concurrency = Number(arg.slice(14));
    else if (arg.startsWith('--token-file=')) opts.tokenFile = arg.slice(13);
    else if (arg.startsWith('--api-base=')) opts.apiBase = arg.slice(11).replace(/\/+$/, '');
    else throw new Error(`Unknown option: ${arg}`);
  }

  if (!Number.isInteger(opts.concurrency) || opts.concurrency < 1) {
    throw new Error('--concurrency must be a positive integer');
  }
  opts.root = cleanPath(opts.root);
  opts.targetRoot = opts.targetRoot === null ? null : cleanPath(opts.targetRoot);
  return opts;
}

function encodeDaPath(path) {
  return cleanPath(path)
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
}

function buildUrl(base, kind, org, repo, path = '', continuationToken = '') {
  const encoded = encodeDaPath(path);
  const url = new URL(`${base}/${kind}/${encodeURIComponent(org)}/${encodeURIComponent(repo)}/${encoded}`);
  if (continuationToken) url.searchParams.set('continuation-token', continuationToken);
  return url.toString();
}

function entryRelativePath(entry, org, repo) {
  const prefix = `/${org}/${repo}/`;
  if (!entry.path || !entry.path.startsWith(prefix)) {
    throw new Error(`Unexpected DA list entry path: ${entry.path}`);
  }
  return cleanPath(entry.path.slice(prefix.length));
}

function targetPathFor(sourcePath, opts) {
  if (!opts.targetRoot) return sourcePath;
  const root = cleanPath(opts.root);
  let relativeToRoot = sourcePath;
  if (root && sourcePath === root) relativeToRoot = '';
  else if (root && sourcePath.startsWith(`${root}/`)) relativeToRoot = sourcePath.slice(root.length + 1);
  return cleanPath(posix.join(opts.targetRoot, relativeToRoot));
}

async function loadToken(opts) {
  if (env.DA_TOKEN) return env.DA_TOKEN;
  if (!opts.tokenFile) return '';
  try {
    return extractToken((await readFile(opts.tokenFile, 'utf8')).trim());
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  return '';
}

async function fetchOk(url, opts, label) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${label} failed: HTTP ${res.status} ${url}: ${text.slice(0, 300)}`);
  }
  return res;
}

async function listPage(dir, opts, continuationToken = '') {
  const url = buildUrl(opts.apiBase, 'list', opts.sourceOrg, opts.sourceRepo, dir, continuationToken);
  const res = await fetchOk(url, {
    headers: { Authorization: `Bearer ${opts.token}` },
  }, 'list');
  const entries = await res.json();
  if (!Array.isArray(entries)) throw new Error(`Unexpected list response for ${url}`);
  return {
    entries,
    continuationToken: res.headers.get('da-continuation-token') || '',
  };
}

async function listDir(dir, opts) {
  const entries = [];
  let continuationToken = '';
  const seenTokens = new Set();

  do {
    const page = await listPage(dir, opts, continuationToken);
    entries.push(...page.entries);
    continuationToken = page.continuationToken;
    if (seenTokens.has(continuationToken)) break;
    if (continuationToken) seenTokens.add(continuationToken);
  } while (continuationToken);

  return entries;
}

async function crawlTree(opts) {
  const files = [];
  const dirs = [opts.root];

  for (let index = 0; index < dirs.length; index += 1) {
    const dir = dirs[index];
    const entries = await listDir(dir, opts);
    for (const entry of entries) {
      const relativePath = entryRelativePath(entry, opts.sourceOrg, opts.sourceRepo);
      if (entry.ext) files.push(relativePath);
      else dirs.push(relativePath);
    }
    console.log(`Listed ${dir || '/'} (${entries.length} item(s), ${files.length} file(s) found)`);
  }

  return files;
}

async function copyFile(sourcePath, opts) {
  const targetPath = targetPathFor(sourcePath, opts);
  const sourceUrl = buildUrl(opts.apiBase, 'source', opts.sourceOrg, opts.sourceRepo, sourcePath);
  const targetUrl = buildUrl(opts.apiBase, 'source', opts.targetOrg, opts.targetRepo, targetPath);

  if (opts.dryRun) {
    console.log(`[dry-run] ${sourceUrl} -> ${targetUrl}`);
    return { sourcePath, targetPath, status: 'dry-run' };
  }

  const getRes = await fetchOk(sourceUrl, {
    headers: { Authorization: `Bearer ${opts.token}` },
  }, 'download');
  const type = getRes.headers.get('content-type') || 'application/octet-stream';
  const data = await getRes.arrayBuffer();

  const form = new FormData();
  form.append('data', new Blob([data], { type }), basename(targetPath));

  const postRes = await fetchOk(targetUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opts.token}` },
    body: form,
  }, 'upload');

  return { sourcePath, targetPath, status: postRes.status };
}

async function pool(items, size, worker) {
  const results = [];
  let index = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      try {
        results[current] = { ok: true, value: await worker(items[current]) };
      } catch (err) {
        results[current] = { ok: false, error: err, item: items[current] };
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

  if (opts.help) {
    usage();
    return;
  }

  opts.token = await loadToken(opts);
  if (!opts.token) {
    console.error('Error: no auth token found. Provide one via DA_TOKEN, --token-file, or ~/today-da-token.txt.');
    exit(1);
  }

  console.log(`Copying da.live/${opts.sourceOrg}/${opts.sourceRepo}/${opts.root} -> da.live/${opts.targetOrg}/${opts.targetRepo}/${opts.targetRoot || '(same paths)'}${opts.dryRun ? ' (dry run)' : ''}`);

  const files = await crawlTree(opts);
  if (!files.length) {
    console.error('No files found to copy.');
    exit(1);
  }

  console.log(`Copying ${files.length} file(s) with concurrency ${opts.concurrency}`);
  const results = await pool(files, opts.concurrency, (file) => copyFile(file, opts));

  let failures = 0;
  for (const result of results) {
    if (result.ok) {
      console.log(`  ✓ ${result.value.sourcePath} -> ${result.value.targetPath} [${result.value.status}]`);
    } else {
      failures += 1;
      console.error(`  ✗ ${result.item}: ${result.error.message}`);
    }
  }

  if (failures) {
    console.error(`\n${failures} copy operation(s) failed.`);
    exit(1);
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  exit(1);
});
