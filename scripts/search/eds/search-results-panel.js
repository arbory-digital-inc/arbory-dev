import { t as createResultsPanel } from "../search-results-panel-XEbvRceR.js";
import { i as replaceElWithError, n as loadCssFile, r as renderEDSLableTemplate, t as getEDSConfig } from "../eds-helper-CnTHYa0p.js";
//#region src/exports/eds/decorate-results-panel.ts
function decorate(block, renderers) {
	loadCssFile("/scripts/search/streamx-search.css");
	const config = getEDSConfig(block);
	block.innerHTML = "";
	if (!config.searchApiUrl) {
		replaceElWithError(block, "The <em>Results panel</em> block requires <i>searchApiUrl</i>");
		return;
	}
	const inputConfig = {
		searchApiUrl: config.searchApiUrl,
		searchPageUrl: config.searchPageUrl ? (query) => `${config.searchPageUrl}?stx-search=${encodeURIComponent(query)}` : void 0,
		minSearchLength: Number(config.minSearchLength) || 3,
		labels: {
			inputPlaceholder: config.inputPlaceholder,
			inputLabel: config.inputLabel,
			clearButtonAria: config.clearButtonAria,
			searchButtonAria: config.searchButtonAria
		},
		renderers
	};
	const resultsRenderers = Object.fromEntries(Object.entries(renderers || {}).filter(([, renderer]) => renderer !== void 0));
	const resultPanel = createResultsPanel(inputConfig, {
		pageSize: Number(config.pageSize) || 10,
		dataSources: config.dataSources ? [config.dataSources] : [],
		renderers: resultsRenderers,
		labels: {
			paginationInfo: (currentPage, pageNumber) => renderEDSLableTemplate(config.paginationInfo, {
				currentPage,
				pageNumber
			}),
			totalResults: (totalCount) => renderEDSLableTemplate(config.totalResults, { totalCount }),
			ariaPaginationGoToPage: (pageNumber) => renderEDSLableTemplate(config.ariaPaginationGoToPage, { pageNumber }),
			ariaPaginationNavigation: config.ariaPaginationNavigation
		}
	});
	block.append(resultPanel);
}
//#endregion
export { decorate as default };

//# sourceMappingURL=search-results-panel.js.map