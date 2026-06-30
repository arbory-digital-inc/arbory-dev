import { a as html, t as creatQueryInput } from "./common-CExKURVS.js";
import "./modal-DeCKnVAW.js";
import { t as createResultsPanel$1 } from "./results-panel-C-8PM_EN.js";
//#region src/inline-search/index.ts
function createTextInput(customConfig, mountPoint) {
	const { element } = creatQueryInput(customConfig);
	if (mountPoint && mountPoint.tagName === "INPUT") mountPoint.replaceWith(element);
	else if (mountPoint) mountPoint.append(element);
	return element;
}
//#endregion
//#region src/exports/search-results-panel.ts
var createResultsPanel = (searchIputConfig, resultPanelConfig) => {
	return html`
    <div class="stx-search-results-panel">${createTextInput(searchIputConfig)} ${createResultsPanel$1(resultPanelConfig)}</div>
  `;
};
//#endregion
export { createResultsPanel };

//# sourceMappingURL=streamx-serach-result-panel.js.map