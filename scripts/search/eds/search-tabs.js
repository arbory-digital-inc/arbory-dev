import { t as createSearchTabs } from "../search-tabs-DnOw8MkO.js";
import { i as replaceElWithError, n as getEDSConfig, r as loadCssFile, t as generatePannelLabels } from "../eds-helper-NkKtY9o8.js";
//#region src/exports/eds/decorate-search-tabs.ts
function decorate(block, tabSelector, renderers) {
	loadCssFile("/scripts/search/streamx-search.css");
	const config = getEDSConfig(block);
	block.innerHTML = "";
	if (!config.searchApiUrl) {
		replaceElWithError(block, "The <em>Search Tabs</em> block requires <i>searchApiUrl</i>");
		return;
	}
	// URL param carrying the query; shared by the input (writer) and tab panels (readers).
	const queryParam = config.queryParam || "query";
	const inputConfig = {
		searchApiUrl: config.searchApiUrl,
		searchPageUrl: (query) => `${config.searchPageUrl ?? ""}?${queryParam}=${encodeURIComponent(query)}`,
		minSearchLength: Number(config.minSearchLength) || 3,
		// Submitting refreshes the active tab's panel in place via the query URL param.
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
	const tabsConfigs = [...document.querySelectorAll(tabSelector)].map((tab) => {
		const tabConfig = getEDSConfig(tab);
		if (!tabConfig.id) {
			replaceElWithError(block, "The <em>Search Tab</em> block requires <i>id</i>");
			return;
		}
		if (!tabConfig.displayName) {
			replaceElWithError(block, "The <em>Search Tab</em> block requires <i>displayName</i>");
			return;
		}
		if (!tabConfig.dataSources) {
			replaceElWithError(block, "The <em>Search Tab</em> block requires <i>dataSources</i>");
			return;
		}
		tab.remove();
		return {
			id: tabConfig.id,
			displayName: tabConfig.displayName,
			results: {
				pageSize: Number(tabConfig.pageSize) || 10,
				dataSources: [tabConfig.dataSources],
				method: "POST",
				queryParam,
				// Facet nesting depth for this tab (default flat); per-tab, else block-level.
				facetDepthLevel: Number(tabConfig.facetDepthLevel || config.facetDepthLevel) || void 0,
				labels: generatePannelLabels(tabConfig)
			}
		};
	});
	const resultsRenderers = Object.fromEntries(Object.entries(renderers || {}).filter(([, renderer]) => renderer !== void 0));
	const searchTab = createSearchTabs(inputConfig, tabsConfigs.filter((tab) => tab !== void 0), resultsRenderers);
	block.append(searchTab);
}
//#endregion
export { decorate as default };

//# sourceMappingURL=search-tabs.js.map