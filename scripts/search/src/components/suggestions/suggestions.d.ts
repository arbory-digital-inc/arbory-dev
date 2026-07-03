import { QueryInput } from '../../types/query-input.ts';
import { OpenSearchItem, OpenSearchResponse } from '../../types/open-search.ts';
export declare function orderByTypeWithFlags(items: OpenSearchItem[]): (OpenSearchItem & {
    isFirstInGroup: boolean;
})[];
declare const createSuggestions: (response: OpenSearchResponse, config: QueryInput) => {
    element: Element | HTMLCollection;
};
export default createSuggestions;
