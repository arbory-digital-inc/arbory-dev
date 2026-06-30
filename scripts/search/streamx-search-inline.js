import { n as DEFAULT_CONFIG, t as creatQueryInput } from "./common-CExKURVS.js";
import { t as createSearchModal } from "./modal-DeCKnVAW.js";
//#region src/exports/search-inline.ts
var getTriggerOpenEl = (searchOpenElementSelector) => {
	if (!searchOpenElementSelector) throw new Error("No trigger selector provided!");
	const triggerEl = document.querySelector(searchOpenElementSelector);
	if (!triggerEl) throw new Error(`No trigger element found! Used selector: "${searchOpenElementSelector}`);
	return triggerEl;
};
var getTriggerCloseEl = (searchCloseElementSelector) => {
	if (!searchCloseElementSelector) return;
	return document.querySelector(searchCloseElementSelector);
};
var bootstrapModal = (config) => {
	const { openModal, closeModal, element } = createSearchModal(config);
	document.body.append(element);
	return {
		openModal,
		closeModal
	};
};
function createSearchInModal(customConfig) {
	const config = {
		...DEFAULT_CONFIG,
		...customConfig,
		input: {
			...DEFAULT_CONFIG.input,
			...customConfig.input,
			labels: {
				...DEFAULT_CONFIG.input.labels,
				...customConfig.input.labels
			},
			renderers: {
				...DEFAULT_CONFIG.input.renderers,
				...customConfig.input.renderers
			}
		}
	};
	const { searchOpenElementSelector, searchCloseElementSelector } = config;
	const triggerEl = getTriggerOpenEl(searchOpenElementSelector);
	let modalData = null;
	triggerEl.addEventListener("click", () => {
		if (!modalData) modalData = bootstrapModal(config);
		modalData.openModal();
	});
	if (searchCloseElementSelector) {
		const triggerCloseEl = getTriggerCloseEl(searchCloseElementSelector);
		if (triggerCloseEl) triggerCloseEl.addEventListener("click", () => {
			if (modalData) modalData.closeModal();
		});
	}
}
function createSearchInput(customConfig, mountPoint) {
	const { element } = creatQueryInput(customConfig);
	if (mountPoint.tagName === "INPUT") mountPoint.replaceWith(element);
	else mountPoint.append(element);
	return element;
}
//#endregion
export { createSearchInModal, createSearchInput };

//# sourceMappingURL=streamx-search-inline.js.map