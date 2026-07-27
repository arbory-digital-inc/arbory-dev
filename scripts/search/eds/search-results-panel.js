import "../common-DNRtji8p.js";
import { t as createResultsPanel } from "../search-results-panel-DsW7SMWW.js";
import { a as replaceElWithError, i as readPanelOptions, n as loadCssFile, t as getEDSConfig } from "../eds-helper-jHyHkGKx.js";
//#region src/exports/eds/decorate-results-panel.ts
function decorate(block, renderers) {
	loadCssFile("/scripts/search/streamx-search.css");
	const config = getEDSConfig(block);
	block.innerHTML = "";
	if (!config.searchApiUrl) {
		replaceElWithError(block, "The <em>Results panel</em> block requires <i>searchApiUrl</i>");
		return;
	}
	const queryParam = config.queryParam || "query";
	const inputConfig = {
		searchApiUrl: config.searchApiUrl,
		searchPageUrl: config.searchPageUrl ? (query) => `${config.searchPageUrl}?${queryParam}=${encodeURIComponent(query)}` : void 0,
		minSearchLength: Number(config.minSearchLength) || 3,
		queryParam,
		initialQuery: config.initialQuery || void 0,
		submitInPlace: !config.searchPageUrl,
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
		...readPanelOptions(config),
		queryParam,
		renderers: resultsRenderers
	});
	block.append(resultPanel);
}
//#endregion
export { decorate as default };

//# sourceMappingURL=search-results-panel.js.map