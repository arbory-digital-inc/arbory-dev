import { TabConfig } from '../components/tabs/tabs';
import { ResultsPanelRenderers } from '../components/results-panel/results-panel';
import { QueryInputConfig } from '../types/config';
declare const createSearchTabs: (inputConfig: QueryInputConfig, tabsConfig: TabConfig[], resultsRenderers?: ResultsPanelRenderers, debug?: boolean) => HTMLDivElement;
export { createSearchTabs };
