import { a as html, o as normalizeLabels, r as createLazyComponent, t as createQueryInput } from "./common-CzdFOaSu.js";
import { n as config, t as createResultsPanel } from "./results-panel-BckklzwN.js";
//#region src/components/tabs/tabs.ts
var resolvedTab = (tabsConfig, customRenderers = {}, labels = {}) => {
	return tabsConfig.map((c) => ({
		...c,
		results: {
			pageSize: 10,
			...c.results,
			renderers: {
				...customRenderers,
				...c.results?.renderers
			},
			labels: normalizeLabels(labels)
		}
	}));
};
var getTabId = (id) => `stx-tab-${id}`;
var getTabContentId = (id) => `stx-tab-content-${id}`;
var createTabButton = (tabData, isSelected) => {
	const { id, displayName } = tabData;
	return html`
    <button
      id="${getTabId(id)}"
      role="tab"
      aria-selected="${String(isSelected)}"
      aria-controls="${getTabContentId(id)}"
      tabindex="${isSelected ? "0" : "-1"}"
      class="stx-tabs__button"
    >
      ${displayName}
    </button>
  `;
};
var createTabContent = (tabData, isSelected) => {
	const { id } = tabData;
	const { element, build } = createLazyComponent(() => {
		return createResultsPanel(tabData.results);
	});
	return {
		element: html`
    <div
      id="${getTabContentId(id)}"
      role="tabpanel"
      aria-labelledby="${getTabId(id)}"
      class="stx-tabs__content"
      ${isSelected ? "" : "hidden"}
    >
      <div>${element}</div>
    </div>
  `,
		build
	};
};
function createTabs(tabsConfig, customRenderers) {
	const tabs = resolvedTab(tabsConfig, customRenderers);
	const buttonList = tabs.map((el, index) => createTabButton(el, !index));
	const tabsLazyMounts = [];
	const contentList = [];
	tabs.forEach((el, index) => {
		const { element, build } = createTabContent(el, !index);
		tabsLazyMounts.push(build);
		contentList.push(element);
	});
	const tabsEl = html`
    <div class="stx-tabs">
      <div role="tablist" class="stx-tabs__buttons">${buttonList}</div>
      ${contentList}
    </div>
  `;
	const activateTab = (selectedTabButton) => {
		buttonList.forEach((button, index) => {
			const isSelected = button === selectedTabButton;
			const contentElId = button.getAttribute("aria-controls");
			const contentEl = tabsEl.querySelector(`#${contentElId}`);
			button.setAttribute("aria-selected", String(isSelected));
			button.tabIndex = isSelected ? 0 : -1;
			if (contentEl && contentEl instanceof HTMLElement) {
				contentEl.hidden = !isSelected;
				if (isSelected) tabsLazyMounts[index]();
			}
		});
	};
	tabsLazyMounts[0]();
	const onKeyDown = (e) => {
		const { target } = e;
		if (!(target instanceof HTMLButtonElement)) return;
		const currentButtonIndex = buttonList.indexOf(target);
		const tabCount = buttonList.length;
		let nextIndex = currentButtonIndex;
		switch (e.key) {
			case "ArrowRight":
				e.preventDefault();
				nextIndex = (currentButtonIndex + 1) % tabCount;
				break;
			case "ArrowLeft":
				e.preventDefault();
				nextIndex = (currentButtonIndex - 1 + tabCount) % tabCount;
				break;
			case "Home":
				e.preventDefault();
				nextIndex = 0;
				break;
			case "End":
				e.preventDefault();
				nextIndex = tabCount - 1;
				break;
			default: return;
		}
		if (nextIndex !== currentButtonIndex) {
			buttonList[nextIndex].focus();
			buttonList[nextIndex].click();
		}
	};
	buttonList.forEach((tab) => {
		tab.addEventListener("click", () => {
			activateTab(tab);
		});
		tab.addEventListener("keydown", (e) => {
			onKeyDown(e);
		});
	});
	return tabsEl;
}
//#endregion
//#region src/exports/search-tabs.ts
var createSearchTabs = (inputConfig, tabsConfig, resultsRenderers, debug) => {
	if (debug) config.debug = true;
	return html` <div class="stx-search-tabs">
    ${createQueryInput(inputConfig).element} ${createTabs(tabsConfig, resultsRenderers)}
  </div>`;
};
//#endregion
export { createSearchTabs as t };

//# sourceMappingURL=search-tabs-DnOw8MkO.js.map