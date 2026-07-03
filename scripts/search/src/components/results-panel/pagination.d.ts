import { OpenSearchResponse } from '../../types/open-search';
import { Results } from './results-panel';
declare const createPagination: (data: OpenSearchResponse, results: Results, currentPage: number) => "" | HTMLDivElement;
export default createPagination;
