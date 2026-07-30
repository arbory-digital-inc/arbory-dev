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
  const url = getHitUrl(item);

  const link = document.createElement('a');
  link.className = 'results-panel-item';
  link.href = url;

  // A hit whose payload never got enriched has no title. Falling back to the
  // URL keeps the row clickable - throwing here would make the library drop it
  // from the list while it still counted toward the reported total.
  const title = document.createElement('span');
  title.className = 'results-panel-item__title';
  title.textContent = item._source.payload?.title || url;

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

/*
 * Renderers shared by the standalone panel and the tabbed search.
 *
 * The library looks up `item-${_source.type}` per hit and, with no match, drops
 * the row (or shows a "Missing renderer" diagnostic when debugMode is on). The
 * index currently holds two page types, so both are mapped to the same renderer:
 *
 *   page/eds       - what .github/workflows/streamx-publish.yaml ingests today,
 *                    so every newly published page arrives under this type.
 *   page/eds-page  - legacy hits from an earlier ingestion path. No workflow in
 *                    this repo emits it, but they are still in the index, so the
 *                    mapping stays until they are reingested or purged.
 */
export const searchRenderers = {
  'item-page/eds': renderItem,
  'item-page/eds-page': renderItem,
  searchIcon,
  clearIcon,
};

/** Top-level values a facet shows before "show more" takes over. */
const FACET_VISIBLE_LIMIT = 5;

const NODE_SELECTOR = ':scope > .stx-results-panel__facet-node';
const CHILD_NODE_SELECTOR = ':scope > .stx-results-panel__facet-children > .stx-results-panel__facet-node';

/**
 * Adds a filter field and a truncated value list to one facet group.
 *
 * The library renders every bucket the response carried, uncapped and
 * unfiltered, so a facet at `facetFieldSize: 20` fills the whole column. Both
 * controls are added from here because the bundle is copy-in-only.
 *
 * Skipped entirely for groups at or under the limit - a filter field above four
 * checkboxes is clutter, not help.
 *
 * @param {Element} group One `.stx-results-panel__facet`
 */
function enhanceFacetGroup(group) {
  const values = group.querySelector('.stx-results-panel__facet-values');
  const nodes = values ? [...values.querySelectorAll(NODE_SELECTOR)] : [];
  if (nodes.length <= FACET_VISIBLE_LIMIT) return;

  const groupName = group.querySelector('.stx-results-panel__facet-name')?.textContent?.trim();

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'results-panel-facet-search';
  search.placeholder = 'Filter';
  search.setAttribute('aria-label', groupName ? `Filter ${groupName}` : 'Filter values');

  // A button rather than an anchor: it acts on this page and goes nowhere, so a
  // link would be the wrong affordance and the wrong keyboard contract.
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'results-panel-facet-more';

  let expanded = false;

  const labelOf = (node) => node
    .querySelector(':scope > .stx-results-panel__facet-row .stx-results-panel__facet-label')
    ?.textContent?.trim()?.toLowerCase() || '';

  /*
   * Matches a subtree and reports whether anything in it hit, so a parent can
   * stay visible for the sake of a matching descendant.
   *
   * `inherited` carries a matched ancestor downwards: once a parent matches, its
   * whole subtree stays browsable rather than being filtered out from under it.
   */
  const filterNode = (node, query, inherited) => {
    const self = !query || labelOf(node).includes(query);
    const children = [...node.querySelectorAll(CHILD_NODE_SELECTOR)];
    const childMatch = children
      .map((child) => filterNode(child, query, inherited || self))
      .some(Boolean);

    node.hidden = !(self || childMatch || inherited);

    // A hit two levels down is worthless while its parent is still collapsed.
    if (query && childMatch) {
      const panel = node.querySelector(':scope > .stx-results-panel__facet-children');
      const toggle = node.querySelector(':scope > .stx-results-panel__facet-row .stx-results-panel__facet-subtoggle');
      if (panel) panel.hidden = false;
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }

    return self || childMatch;
  };

  const apply = () => {
    const query = search.value.trim().toLowerCase();
    nodes.forEach((node) => filterNode(node, query, false));

    // The cap applies to whatever survived the filter, so searching inside a
    // long facet does not immediately bury its own matches.
    const matching = nodes.filter((node) => !node.hidden);
    if (!expanded) matching.slice(FACET_VISIBLE_LIMIT).forEach((node) => { node.hidden = true; });

    // Clamped, not just tested: styles.css puts `display: inline-block` on every
    // button, so a stylesheet that has not undone it for [hidden] would leave a
    // "Show -3 more" on screen instead of hiding the control.
    const over = Math.max(0, matching.length - FACET_VISIBLE_LIMIT);
    more.hidden = over === 0;
    more.textContent = expanded ? 'Show less' : `Show ${over} more`;
    more.setAttribute('aria-expanded', String(expanded));
  };

  // Re-collapsing on every keystroke keeps "show more" meaning the same thing
  // for each new query.
  search.addEventListener('input', () => {
    expanded = false;
    apply();
  });

  more.addEventListener('click', () => {
    expanded = !expanded;
    apply();
  });

  values.prepend(search);
  values.append(more);
  apply();
}

/**
 * Keeps the facet controls attached across re-renders.
 *
 * `updateFacets` replaces the entire facets container on every response, so a
 * one-shot pass would be thrown away by the next query, filter or page change.
 * Only *added* nodes are inspected, so the controls added above never retrigger
 * this, and the marker makes a second pass over the same container a no-op.
 *
 * @param {Element} root Element containing one or more results panels
 */
export function observeFacets(root) {
  const enhance = (container) => {
    if (container.dataset.facetsEnhanced) return;
    container.dataset.facetsEnhanced = 'true';
    container.querySelectorAll('.stx-results-panel__facet').forEach(enhanceFacetGroup);
  };

  const enhanceWithin = (node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.classList.contains('stx-results-panel__facets-container')) enhance(node);
    else node.querySelectorAll('.stx-results-panel__facets-container').forEach(enhance);
  };

  root.querySelectorAll('.stx-results-panel__facets-container').forEach(enhance);

  const observer = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach(enhanceWithin));
  });
  observer.observe(root, { childList: true, subtree: true });
}

export default function decorate(block) {
  decorateResultsPanel(block, searchRenderers);
  observeFacets(block);
}
