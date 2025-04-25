/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

import { loadArea, getConfig } from '../../scripts/nx.js';

/**
 * Updates media paths in the fragment to be absolute
 * @param {string} path The base path of the fragment
 * @param {HTMLElement|Document} doc The document or element to update
 */
function replaceDotMedia(path, doc) {
  const resetAttributeBase = (tag, attr) => {
    doc.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
      elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
    });
  };
  resetAttributeBase('img', 'src');
  resetAttributeBase('source', 'srcset');
}

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @param {Object} options Configuration options
 * @param {boolean} options.useNx Whether to use nx.js functionality
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path, options = {}) {
  if (!path || !path.startsWith('/')) return null;
  
  const resp = await fetch(`${path}.plain.html`);
  if (!resp.ok) return null;
  
  const html = await resp.text();
  
  if (options.useNx) {
    // NX.js approach
    const { decorateArea } = getConfig();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Make embedded images cacheable
    replaceDotMedia(path, doc);
    
    const sections = doc.querySelectorAll('body > div');
    const fragment = document.createElement('div');
    fragment.append(...sections);
    
    // Hydrate like a normal page
    if (decorateArea) decorateArea(fragment);
    loadArea(fragment);
    
    return fragment;
  } else {
    // AEM approach
    const main = document.createElement('main');
    main.innerHTML = html;
    
    // Reset base path for media to fragment base
    replaceDotMedia(path, main);
    
    decorateMain(main);
    await loadSections(main);
    return main;
  }
}

/**
 * Decorates the block using AEM approach
 * @param {HTMLElement} block The block to decorate
 */
export async function decorateAemBlock(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.closest('.section').classList.add(...fragmentSection.classList);
      block.closest('.fragment').replaceWith(...fragment.childNodes);
    }
  }
}

/**
 * Initializes the fragment using NX approach
 * @param {HTMLElement} a The anchor element to replace
 */
export async function initNxFragment(a) {
  const path = a.getAttribute('href');
  const fragment = await loadFragment(path, { useNx: true });
  if (fragment) a.parentElement.replaceChild(fragment, a);
}

/**
 * Main block decoration function - detects which system to use based on context
 * @param {HTMLElement} block The block element or anchor to process
 */
export default async function decorate(block) {
  // Determine if we're using nx.js based on some condition
  // This could be based on a data attribute, CSS class, or environment variable
  const isNxJs = block.tagName === 'A' || block.classList.contains('nx-fragment');
  
  if (isNxJs) {
    // If it's an anchor tag, use nx.js approach
    await initNxFragment(block);
  } else {
    // Otherwise use AEM approach
    await decorateAemBlock(block);
  }
}