/* eslint-disable no-underscore-dangle */
import decorateResultsPanel from '../../scripts/search/eds/search-results-panel.js';
import { getHitUrl } from '../../scripts/search/streamx-search-results-panel.js';

/**
 * Renders one search result as a link to the page it represents.
 *
 * `getHitUrl` turns the hit's `_id` ("en:/en/blog/post") into its URL, stripping
 * the namespace prefix when the hit carries one. Index values are applied with
 * textContent/href rather than innerHTML, so they are never parsed as markup.
 * @param {Object} item Search hit
 * @returns {HTMLElement} The rendered result
 */
export function renderItem(item) {
  const link = document.createElement('a');
  link.className = 'results-panel-item';
  link.href = getHitUrl(item);

  const title = document.createElement('span');
  title.className = 'results-panel-item__title';
  title.textContent = item._source.payload.title;

  const type = document.createElement('span');
  type.className = 'results-panel-item__type';
  type.textContent = item._source.type;

  link.append(title, type);

  return link;
}

/*
 * Inline SVG icons replacing the library's default "🔍" and "✕" glyphs.
 *
 * These return strings rather than elements on purpose. The library's `html`
 * tag only turns HTMLElement/Array/NodeList values into real nodes and
 * concatenates everything else straight into innerHTML - and an SVG built with
 * createElementNS is an SVGElement, not an HTMLElement, so it would render as
 * the literal text "[object SVGSVGElement]".
 *
 * Both buttons already carry an aria-label, so the glyphs stay hidden.
 */
const icon = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;

export const searchIcon = () => icon('<circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" />');

export const clearIcon = () => icon('<path d="M18 6 6 18M6 6l12 12" />');

/** Renderers shared by the standalone panel and the tabbed search. */
export const searchRenderers = {
  'item-page/eds-page': renderItem,
  searchIcon,
  clearIcon,
};

export default function decorate(block) {
  decorateResultsPanel(block, searchRenderers);
}
