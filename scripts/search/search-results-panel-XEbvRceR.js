import { a as html, t as createQueryInput } from "./common-CzdFOaSu.js";
import "./modal-CTqFzm0O.js";
import { t as createResultsPanel$1 } from "./results-panel-BckklzwN.js";
//#region src/inline-search/index.ts
function mountQueryInput(customConfig, mountPoint) {
	const { element } = createQueryInput(customConfig);
	if (mountPoint && mountPoint.tagName === "INPUT") mountPoint.replaceWith(element);
	else if (mountPoint) mountPoint.append(element);
	return element;
}
//#endregion
//#region src/exports/search-results-panel.ts
var createResultsPanel = (searchIputConfig, resultPanelConfig) => {
	return html`
    <div class="stx-search-results-panel">${mountQueryInput(searchIputConfig)} ${createResultsPanel$1(resultPanelConfig)}</div>
  `;
};
//#endregion
export { createResultsPanel as t };

//# sourceMappingURL=search-results-panel-XEbvRceR.js.map