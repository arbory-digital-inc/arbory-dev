import { QueryInputLabels, QueryInputRenderers } from '../types/query-input';
declare const defaultConfig: {
    input: {
        minSearchLength: number;
        groupByCategory: boolean;
        labels: Required<QueryInputLabels>;
        renderers: Required<QueryInputRenderers>;
    };
    useNonModal: boolean;
    analytics: () => void;
};
export default defaultConfig;
