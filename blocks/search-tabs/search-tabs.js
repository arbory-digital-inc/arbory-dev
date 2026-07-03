/* eslint-disable no-underscore-dangle */
import decorateSearchTabs from '../../scripts/search/eds/search-tabs.js';

export default function decorate(block) {
  const renderItem = (item) => {
    const el = document.createElement('div');

    el.innerHTML = `
      <div class="results-panel-item">
        <span class="results-panel-item__title">${item._source.payload.title}</span>
        <span class="results-panel-item__type">${item._source.type}</span>
      </div>
    `;

    return el;
  };

  decorateSearchTabs(block, '.search-tab', { 'item-page/eds-page': renderItem });
}
