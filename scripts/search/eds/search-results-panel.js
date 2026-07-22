import { t as createResultsPanel } from "../search-results-panel-XEbvRceR.js";
import { i as replaceElWithError, n as getEDSConfig, r as loadCssFile, t as generatePannelLabels } from "../eds-helper-NkKtY9o8.js";
//#region src/exports/eds/decorate-results-panel.ts
function decorate(block, renderers) {
	loadCssFile("/scripts/search/streamx-search.css");
	const config = getEDSConfig(block);
	block.innerHTML = "";
	if (!config.searchApiUrl) {
		replaceElWithError(block, "The <em>Results panel</em> block requires <i>searchApiUrl</i>");
		return;
	}
	// URL param carrying the query; shared by the input (writer) and panel (reader).
	const queryParam = config.queryParam || "query";
	const inputConfig = {
		searchApiUrl: config.searchApiUrl,
		searchPageUrl: config.searchPageUrl ? (query) => `${config.searchPageUrl}?${queryParam}=${encodeURIComponent(query)}` : void 0,
		minSearchLength: Number(config.minSearchLength) || 3,
		// Typeahead uses the same GET request as the header search; submitting
		// (Enter / picking a suggestion / search button) refreshes the adjacent
		// results panel in place via the query URL param (POST fetch below).
		submitInPlace: true,
		queryParam,
		// Optional preconfigured query: fetched at render, shown on focus while the input is empty.
		initialQuery: config.initialQuery || void 0,
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
		method: "POST",
		queryParam,
		// Facet nesting depth for this query (default flat / level 0 only).
		facetDepthLevel: Number(config.facetDepthLevel) || void 0,
		renderers: resultsRenderers,
		labels: generatePannelLabels(config)
	});
	block.append(resultPanel);
}
//#endregion
export { decorate as default };

//# sourceMappingURL=search-results-panel.js.map