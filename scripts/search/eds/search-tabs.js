import { t as createSearchTabs } from "../search-tabs-DnOw8MkO.js";
import { i as replaceElWithError, n as loadCssFile, r as renderEDSLableTemplate, t as getEDSConfig } from "../eds-helper-CnTHYa0p.js";
//#region src/exports/eds/decorate-search-tabs.ts
function decorate(block, tabSelector, renderers) {
	loadCssFile("/scripts/search/streamx-search.css");
	const config = getEDSConfig(block);
	block.innerHTML = "";
	if (!config.searchApiUrl) {
		replaceElWithError(block, "The <em>Search Tabs</em> block requires <i>searchApiUrl</i>");
		return;
	}
	const inputConfig = {
		searchApiUrl: config.searchApiUrl,
		searchPageUrl: (query) => `${config.searchPageUrl ?? ""}?stx-search=${encodeURIComponent(query)}`,
		minSearchLength: Number(config.minSearchLength) || 3,
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
				labels: {
					paginationInfo: (currentPage, pageNumber) => renderEDSLableTemplate(tabConfig.paginationInfo, {
						currentPage,
						pageNumber
					}),
					totalResults: (totalCount) => renderEDSLableTemplate(tabConfig.totalResults, { totalCount }),
					ariaPaginationGoToPage: (pageNumber) => renderEDSLableTemplate(tabConfig.ariaPaginationGoToPage, { pageNumber }),
					ariaPaginationNavigation: tabConfig.ariaPaginationNavigation
				}
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