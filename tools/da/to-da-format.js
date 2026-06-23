#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Convert local .plain.html (div-based block structure used by aem.page)
 * to the DA-stored HTML format:
 *   - Wrap document in <body><header></header><main>...</main><footer></footer></body>
 *   - Inside every block (`<div class="...">`), wrap each leaf cell's text/inline
 *     content in <p>...</p>. Cells that contain block elements
 *     (img/picture/ul/ol/h1-6/p/div/table/etc) are left untouched.
 *
 * Library usage:
 *   import { toDaFormat } from './to-da-format.js';
 *   const daHtml = toDaFormat(plainHtml);
 *
 * CLI usage:
 *   node tools/da/to-da-format.js <in.plain.html> [out.html]
 *   (if out is omitted, prints to stdout)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { argv, exit, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const BLOCK_TAGS = new Set([
  'p', 'div', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'picture', 'img', 'table', 'figure', 'blockquote', 'pre', 'hr',
  'section', 'article', 'header', 'footer', 'main', 'nav',
]);

function cellHasBlock(cell) {
  for (const child of cell.children) {
    if (BLOCK_TAGS.has(child.tagName.toLowerCase())) return true;
  }
  return false;
}

function wrapCellTextInP(cell, doc) {
  if (cellHasBlock(cell)) return;
  const html = cell.innerHTML.trim();
  if (!html) return;
  cell.innerHTML = '';
  const p = doc.createElement('p');
  p.innerHTML = html;
  cell.appendChild(p);
}

function processBlock(blockDiv, doc) {
  for (const row of blockDiv.children) {
    if (row.tagName.toLowerCase() === 'div') {
      for (const cell of row.children) {
        if (cell.tagName.toLowerCase() === 'div') {
          wrapCellTextInP(cell, doc);
        }
      }
    }
  }
}

/**
 * Transform a `.plain.html` body fragment into the DA-stored HTML format.
 * Idempotent: if the input already starts with `<body>` it is returned as-is.
 * @param {string} src plain.html body fragment
 * @returns {string} DA-formatted HTML
 */
export function toDaFormat(src) {
  if (/^\s*<body[\s>]/i.test(src)) return src;

  const dom = new JSDOM(`<!doctype html><html><body>${src}</body></html>`);
  const { document } = dom.window;

  const blocks = document.querySelectorAll('body > div div[class]');
  for (const block of blocks) processBlock(block, document);

  const inner = document.body.innerHTML.trim();
  return `\n<body>\n  <header></header>\n  <main>${inner}</main>\n  <footer></footer>\n</body>\n`;
}

async function cli() {
  const [, , inPath, outPath] = argv;
  if (!inPath) {
    console.error('Usage: node tools/da/to-da-format.js <in.plain.html> [out.html]');
    exit(2);
  }
  const src = await readFile(inPath, 'utf8');
  const out = toDaFormat(src);
  if (outPath) {
    await writeFile(outPath, out, 'utf8');
    console.log(`wrote ${outPath} (${out.length} bytes)`);
  } else {
    stdout.write(out);
  }
}

if (argv[1] === fileURLToPath(import.meta.url)) {
  cli().catch((err) => {
    console.error(err);
    exit(1);
  });
}
