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

export default function decorate(block) {
  decorateResultsPanel(block, { 'item-page/eds-page': renderItem });
}
