import { QueryInputConfig } from '../types/config';
import { TabConfig } from '../components/tabs/tabs';
import { ResultsPanelRenderers } from '../components/results-panel/results-panel';
declare const mountQueryInput: (customConfig: QueryInputConfig, mountPoint: Element) => void;
declare const createTabContent: (mountPoint: Element, config: TabConfig[], renderers?: ResultsPanelRenderers, debug?: boolean) => void;
export { mountQueryInput, createTabContent };
