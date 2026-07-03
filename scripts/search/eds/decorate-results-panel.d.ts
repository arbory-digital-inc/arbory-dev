import { ResultsPanelRenderers } from '../../components/results-panel/results-panel';
import { QueryInputRenderers } from '../../types/query-input';
type EDSResultsPanelRenderers = Partial<QueryInputRenderers> & Partial<ResultsPanelRenderers>;
export default function decorate(block: HTMLElement, renderers?: EDSResultsPanelRenderers): void;
export {};
