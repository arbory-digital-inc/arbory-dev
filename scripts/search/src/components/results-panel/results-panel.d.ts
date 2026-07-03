type CustomRenderer = (...args: any[]) => HTMLElement;
export type ResultsPanelRenderers = {
    [rendererName: string]: CustomRenderer;
};
export type ResultsPanelLabelsConfig = {
    paginationInfo?: (currentPage: number, pageNumber: number) => string;
    totalResults?: (totalCount: number) => string;
    ariaPaginationGoToPage?: (pageNumber: number) => string;
    ariaPaginationNavigation?: string;
};
export type ResultsPanelLabels = Required<ResultsPanelLabelsConfig>;
type ResultsPanelNormalizedLabels = {
    [K in keyof ResultsPanelLabels]: (...args: any[]) => string;
};
export interface ResultsConfig {
    pageSize?: number;
    dataSources: string[];
    renderers?: ResultsPanelRenderers;
    labels?: ResultsPanelLabelsConfig;
}
export type Results = Omit<Required<ResultsConfig>, "labels"> & {
    labels: ResultsPanelNormalizedLabels;
};
export declare const createResultsPanel: (resultsConfig: ResultsConfig | Results) => HTMLElement;
export {};
