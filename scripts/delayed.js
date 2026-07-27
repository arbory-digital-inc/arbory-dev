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

  // Authored config from the nav's `search-config` block (stashed by header.js).
  let authored = {};
  try {
    authored = JSON.parse(navSearchInput.dataset.searchConfig || '{}');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Could not parse authored nav search config', error);
  }

  // The endpoint comes from the authored `search-config` block; without it the
  // nav search cannot work, so bail out loudly rather than guess a URL.
  if (!authored.searchApiUrl) {
    // eslint-disable-next-line no-console
    console.error('Nav search is missing "searchApiUrl". Author it in the nav\'s "search-config" block.');
    return;
  }

  const queryParam = authored.queryParam || 'query';
  const streamxSearchInput = createSearchInput({
    searchOpenElementSelector: '',
    searchApiUrl: authored.searchApiUrl,
    searchPageUrl: authored.searchPageUrl
      ? (query) => `${authored.searchPageUrl}?${queryParam}=${encodeURIComponent(query)}`
      : undefined,
    // Chars typed before the typeahead GET fires; authorable via `minSearchLength`.
    minSearchLength: Number(authored.minSearchLength) || 2,
    queryParam,
    initialQuery: authored.initialQuery || undefined,
    // The nav's own magnifier toggle is the search affordance here, so the
    // component's built-in search button would be a duplicate icon.
    showSearchButton: false,
    // Authorable copy, matching the search blocks' label keys. Undefined values
    // are dropped by the component, so each falls back to the library default.
    labels: {
      inputPlaceholder: authored.inputPlaceholder || undefined,
      inputLabel: authored.inputLabel || undefined,
      clearButtonAria: authored.clearButtonAria || undefined,
      searchButtonAria: authored.searchButtonAria || undefined,
    },
  }, navSearchInput);

  const searchInputEl = streamxSearchInput.querySelector('input');
  searchInputEl.classList.add('nav-search-input');

  // The nav toggle opens the search and auto-focuses it, but focus alone can't be
  // relied on (already-focused input fires no focus event, and the toggle click
  // closes the dropdown as an "outside" click). Show it explicitly on every open.
  const navSearch = streamxSearchInput.closest('.nav-search');
  const navSearchToggle = navSearch?.querySelector('.nav-search-toggle');
  if (navSearch && navSearchToggle) {
    navSearchToggle.addEventListener('click', () => {
      if (navSearch.classList.contains('expanded')) streamxSearchInput.showInitialSuggestions?.();
    });
    // This init is delayed, so the search may already be open by the time we mount.
    if (navSearch.classList.contains('expanded')) {
      searchInputEl.focus();
      streamxSearchInput.showInitialSuggestions?.();
    }
  }
}

// Core Web Vitals RUM collection
sampleRUM('cwv');

loadInlineSearch();

// add more delayed functionality here
/* Add in ALI ARMS RUM CODE */

/* END ALI ARMS RUM CODE */
