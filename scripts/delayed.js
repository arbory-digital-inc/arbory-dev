// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadCSS } from './aem.js';

async function loadInlineSearch() {
  loadCSS('/scripts/search/streamx-search.css');
  const { createSearchInput } = await import('./search/streamx-search-inline.js');
  const navSearchInput = document.querySelector('.nav-search-input');

  if (!navSearchInput) {
    // eslint-disable-next-line no-console
    console.error('nav search input field is not defined!');
    return;
  }

  const streamxSearchInput = createSearchInput({
    searchOpenElementSelector: '',
    searchApiUrl: 'https://blog-dev.arborydigital.com/search/pages',

  }, navSearchInput);

  streamxSearchInput.querySelector('input').classList.add('nav-search-input');
}

// Core Web Vitals RUM collection
sampleRUM('cwv');

loadInlineSearch();

// add more delayed functionality here
/* Add in ALI ARMS RUM CODE */

/* END ALI ARMS RUM CODE */
