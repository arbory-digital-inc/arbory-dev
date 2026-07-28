import decorateSearchTabs from '../../scripts/search/eds/search-tabs.js';
import { searchRenderers } from '../results-panel/results-panel.js';

/**
 * Slides one shared indicator under the active tab.
 *
 * The library gives every button its own state but no shared indicator, so the
 * bar lives on the button row as a pseudo-element and is driven from here via
 * two custom properties.
 *
 * Position is read off `aria-selected`, which the library sets on every
 * activation path - pointer, keyboard, and the `stx-tab` URL param - so one
 * MutationObserver covers all of them without patching the bundle.
 *
 * @param {Element} block The decorated search-tabs block
 */
function slideTabIndicator(block) {
  const list = block.querySelector('.stx-tabs__buttons');
  if (!list) return;

  const position = () => {
    const active = list.querySelector('[aria-selected="true"]');
    if (!active) return;
    // offsetLeft is measured against the row, which the CSS positions.
    list.style.setProperty('--stx-indicator-x', `${active.offsetLeft}px`);
    list.style.setProperty('--stx-indicator-w', `${active.offsetWidth}px`);
  };

  position();

  // Transitions are held back for one frame so the bar appears under the first
  // tab instead of sliding in from the left edge on load.
  requestAnimationFrame(() => list.classList.add('tabs-indicator-ready'));

  const selection = new MutationObserver(position);
  selection.observe(list, {
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-selected'],
  });

  // Label widths move when the row is resized or a webfont swaps in.
  const resize = new ResizeObserver(position);
  resize.observe(list);
  if (document.fonts) document.fonts.ready.then(position);
}

export default function decorate(block) {
  decorateSearchTabs(block, '.search-tab', searchRenderers);
  slideTabIndicator(block);
}
