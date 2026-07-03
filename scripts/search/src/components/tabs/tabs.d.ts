import { Results, ResultsConfig, ResultsPanelRenderers } from '../results-panel/results-panel';
export interface TabConfig {
    id: string;
    displayName: string;
    results: ResultsConfig;
}
export interface Tab {
    id: string;
    displayName: string;
    results: Results;
}
declare function createTabs(tabsConfig: TabConfig[], customRenderers?: ResultsPanelRenderers): HTMLDivElement;
export default createTabs;
