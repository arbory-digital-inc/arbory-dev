import decorateSearchTabs from '../../scripts/search/eds/search-tabs.js';
import { renderItem } from '../results-panel/results-panel.js';

export default function decorate(block) {
  decorateSearchTabs(block, '.search-tab', { 'item-page/eds-page': renderItem });
}
