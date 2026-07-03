export declare const loadCssFile: (cssFile: string) => void;
export declare const renderEDSLableTemplate: (template: string | undefined, values: Record<string, string | number>) => string;
export declare const getEDSConfig: <TConfig extends Record<string, string | undefined>>(block: HTMLElement) => Partial<TConfig>;
export declare const replaceElWithError: (root: HTMLElement, error: string) => void;
export type EDSPannelLabels = {
    paginationInfo?: string;
    totalResults?: string;
    ariaPaginationGoToPage?: string;
    ariaPaginationNavigation?: string;
};
export declare const generatePannelLabels: (config: EDSPannelLabels) => Partial<Required<import('./components/results-panel/results-panel').ResultsPanelLabelsConfig>>;
