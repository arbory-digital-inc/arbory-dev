import { ResultsPanelRenderers } from '../../components/results-panel/results-panel';
import { QueryInputRenderers } from '../../types/query-input';
type EDSTabsRenderers = Partial<QueryInputRenderers> & Partial<ResultsPanelRenderers>;
export default function decorate(block: HTMLElement, tabSelector: string, renderers?: EDSTabsRenderers): void;
export {};
