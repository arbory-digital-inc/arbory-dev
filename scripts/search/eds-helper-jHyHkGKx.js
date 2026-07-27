import { c as html } from "./common-DNRtji8p.js";
//#region src/eds-helper.ts
var loadCssFile = (cssFile) => {
	const styleEl = document.createElement("link");
	styleEl.setAttribute("href", cssFile);
	styleEl.setAttribute("rel", "stylesheet");
	document.head.append(styleEl);
};
var renderEDSLableTemplate = (template, values) => {
	if (!template) return "";
	return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
		const value = values[key];
		return value === void 0 ? "" : String(value);
	});
};
var getEDSConfig = (block) => {
	const rows = [...block.querySelectorAll(":scope > div")];
	const config = {};
	rows.forEach((row, index) => {
		try {
			const [keyEl, valueEl] = row.querySelectorAll(":scope > div");
			const key = keyEl?.textContent?.trim();
			const value = valueEl?.textContent?.trim();
			if (key && value !== void 0) config[key] = value;
		} catch (error) {
			console.error(`There are some problems with building EDS config. Row number: ${index + 1}`, error, block);
		}
	});
	return config;
};
var replaceElWithError = (root, error) => {
	const errorEl = html`
    <div
      style="
        color: red;
        padding: 10px;
        border: solid 2px red;
        background: rgba(255, 0, 0, 0.2)
      "
    >
      ${error}
    </div>
  `;
	root.append(errorEl);
};
/**
* Layers two EDS configs: `override` wins key by key, but empty values fall
* through to `base`, so an empty cell in a tab block cannot blank out a
* block-level default.
*/
var mergeEDSConfigs = (base, override) => ({
	...base,
	...Object.fromEntries(Object.entries(override).filter(([, value]) => value))
});
var generatePannelLabels = (config) => {
	const lables = {};
	if (config.paginationInfo) lables.paginationInfo = (currentPage, pageNumber) => renderEDSLableTemplate(config.paginationInfo, {
		currentPage,
		pageNumber
	});
	if (config.totalResults) lables.totalResults = (totalCount) => renderEDSLableTemplate(config.totalResults, { totalCount });
	if (config.ariaPaginationGoToPage) lables.ariaPaginationGoToPage = (pageNumber) => renderEDSLableTemplate(config.ariaPaginationGoToPage, { pageNumber });
	if (config.ariaPaginationNavigation) lables.ariaPaginationNavigation = config.ariaPaginationNavigation;
	return lables;
};
/** Maps authored EDS rows to a results-panel config. Single source of truth. */
var readPanelOptions = (config) => ({
	pageSize: Number(config.pageSize) || 10,
	dataSources: config.dataSources ? [config.dataSources] : [],
	method: "POST",
	requestId: config.requestId || void 0,
	facetDepthLevel: Number(config.facetDepthLevel) || void 0,
	facetFilterField: config.facetFilterField || void 0,
	facetFieldPrefix: config.facetFieldPrefix || void 0,
	facetPathSeparator: config.facetPathSeparator || void 0,
	facetFieldSize: Number(config.facetFieldSize) || void 0,
	debugMode: config.debugMode === void 0 ? void 0 : config.debugMode.trim().toLowerCase() === "true",
	labels: generatePannelLabels(config)
});
//#endregion
export { replaceElWithError as a, readPanelOptions as i, loadCssFile as n, mergeEDSConfigs as r, getEDSConfig as t };

//# sourceMappingURL=eds-helper-jHyHkGKx.js.map