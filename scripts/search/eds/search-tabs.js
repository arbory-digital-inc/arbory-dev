import "../common-DNRtji8p.js";
import { t as createSearchTabs } from "../search-tabs-id6HcUPC.js";
import { a as replaceElWithError, i as readPanelOptions, n as loadCssFile, r as mergeEDSConfigs, t as getEDSConfig } from "../eds-helper-jHyHkGKx.js";
//#region src/exports/eds/decorate-search-tabs.ts
function decorate(block, tabSelector, renderers) {
	loadCssFile("/scripts/search/streamx-search.css");
	const config = getEDSConfig(block);
	block.innerHTML = "";
	if (!config.searchApiUrl) {
		replaceElWithError(block, "The <em>Search Tabs</em> block requires <i>searchApiUrl</i>");
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
	const tabsConfigs = [...document.querySelectorAll(tabSelector)].map((tab) => {
		const tabConfig = getEDSConfig(tab);
		const panelOptions = mergeEDSConfigs(config, tabConfig);
		if (!tabConfig.id) {
			replaceElWithError(block, "The <em>Search Tab</em> block requires <i>id</i>");
			return;
		}
		if (!tabConfig.displayName) {
			replaceElWithError(block, "The <em>Search Tab</em> block requires <i>displayName</i>");
			return;
		}
		if (!panelOptions.dataSources) {
			replaceElWithError(block, "The <em>Search Tab</em> block requires <i>dataSources</i>");
			return;
		}
		tab.remove();
		return {
			id: tabConfig.id,
			displayName: tabConfig.displayName,
			results: {
				...readPanelOptions(panelOptions),
				queryParam
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