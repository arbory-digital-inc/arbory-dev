import { a as html, i as fetchSearchResults, r as addUrlChangeListener, s as normalizeLabels } from "./common-CExKURVS.js";
//#region src/config.ts
var config = { debug: false };
//#endregion
//#region src/components/results-panel/renderers.ts
var defaultRenderLoader = () => {
	return html`
    <span>
      <svg
        class="stx-results-panel__loader"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray="48 16"
        ></circle>
      </svg>
    </span>
  `;
};
var noItemRenderer = (item) => {
	if (config.debug) return html`
      <div class="stx-results-panel__no-item-renderer">
        No custom renderer for type: ${item._source.type}
      </div>
    `;
	return "";
};
var resultsPanelErrorRenderer = () => {
	return html`
    <div class="stx-results-panel__error">
      <span class="stx-results-panel__error-heading">
        Something went wrong :(
      </span>
      <span class="stx-results-panel__error-text">
        Please try again later
      </span>
    </div>
  `;
};
//#endregion
//#region src/components/results-panel/results-panel.ts
var DEFAULT_RESULTS_CONFIG = {
	pageSize: 20,
	renderers: {
		loader: defaultRenderLoader,
		error: resultsPanelErrorRenderer
	},
	labels: {
		paginationInfo: (currentPage, pageNumber) => `Page ${currentPage} of ${pageNumber}`,
		totalResults: (totalCount) => `${totalCount} results found.`,
		ariaPaginationGoToPage: (pageNumber) => `Go to page ${pageNumber}`,
		ariaPaginationNavigation: "Pagination"
	}
};
var resolveConfig = (resultsConfig) => {
	const defaultLabels = normalizeLabels(DEFAULT_RESULTS_CONFIG.labels);
	const configLabels = resultsConfig.labels ? normalizeLabels(resultsConfig.labels) : {};
	return {
		...DEFAULT_RESULTS_CONFIG,
		...resultsConfig,
		renderers: {
			...DEFAULT_RESULTS_CONFIG.renderers,
			...resultsConfig.renderers
		},
		labels: {
			...defaultLabels,
			...configLabels
		}
	};
};
var getLiveRegion = () => {
	const liveRegionEl = document.querySelector(".stx-results-panel__live-region");
	if (liveRegionEl) return liveRegionEl;
	const resultsPanelLiveRegion = html`<div
    class="stx-results-panel__live-region stx-sr-only"
    aria-live="polite"
    aria-atomic="true"
    role="status"
  ></div>`;
	document.body.append(resultsPanelLiveRegion);
	return resultsPanelLiveRegion;
};
var announceResults = (message) => {
	const statusEl = getLiveRegion();
	statusEl.textContent = "";
	requestAnimationFrame(() => {
		statusEl.textContent = message;
	});
};
var restoreFocusForPage = () => {
	let activePage;
	if (document.activeElement && document.activeElement.getAttribute("data-page-number")) activePage = document.activeElement.getAttribute("data-page-number");
	return () => {
		if (activePage) {
			const btn = document.querySelector(`[data-page-number="${activePage}"`);
			if (btn instanceof HTMLButtonElement) btn.focus();
		}
	};
};
var buildResultsForPage = (resultsPanel, results, pageNumber) => {
	const dataUrl = new URL(results.dataSources[0], window.location.href);
	const restorePageFocus = restoreFocusForPage();
	dataUrl.searchParams.set("from", String((pageNumber - 1) * results.pageSize));
	dataUrl.searchParams.set("size", String(results.pageSize));
	resultsPanel.innerHTML = "";
	resultsPanel.append(results.renderers.loader());
	const searchQueryParam = new URL(window.location.href).searchParams.get("stx-search") || "";
	fetchSearchResults(dataUrl.toString(), searchQueryParam).then((responseData) => {
		createResults(resultsPanel, responseData, results, pageNumber);
		restorePageFocus();
	});
};
var createResultsNumber = (data, results, currentPage) => {
	const totalNumber = data.hits?.total.value || 0;
	const pageSize = results.pageSize;
	const pagesNumber = Math.ceil(totalNumber / pageSize);
	return html`
    <div class="stx-results-panel__results-number">
      <span class="stx-results-panel__page-number">
        ${results.labels.paginationInfo(currentPage, pagesNumber)}
      </span>
      <span class="stx-results-panel__total-number">
        ${results.labels.totalResults(data.hits?.total.value || 0)}
      </span>
    </div>
  `;
};
var createPagination = (data, results, currentPage) => {
	const totalNumber = data.hits.total.value;
	const { pageSize } = results;
	const pagesCount = Math.ceil(totalNumber / pageSize);
	const paginationButtonList = [];
	let paginationStartPage = currentPage - 2;
	if (pagesCount <= 1) return "";
	if (currentPage <= 3) paginationStartPage = 1;
	else if (currentPage >= pagesCount - 2) paginationStartPage = pagesCount - 4;
	if (paginationStartPage > 1) paginationButtonList.push(html`<li class="stx-results-panel__pagination-list-item">
        <button data-page-number="1" aria-label="${results.labels.ariaPaginationGoToPage(1)}">1</a>
      </li>`);
	if (paginationStartPage > 2) paginationButtonList.push(html`<li
        class="stx-results-panel__pagination-list-item stx-results-panel__pagination-dots "
        aria-hidden="true"
      >
        ...
      </li>`);
	const paginationEndIndex = pagesCount < 5 ? pagesCount + 1 : paginationStartPage + 5;
	for (let i = paginationStartPage; i < paginationEndIndex; i++) paginationButtonList.push(html`<li class="stx-results-panel__pagination-list-item">
        <button
          data-page-number="${i}"
          class="${currentPage === i ? "stx-is-active" : ""}"
          aria-current="${currentPage === i ? "page" : null}"
          aria-label="${results.labels.ariaPaginationGoToPage(i)}"
        >
          ${i}
        </button>
      </li>`);
	if (paginationStartPage < pagesCount - 5) paginationButtonList.push(html`<li
        class="stx-results-panel__pagination-list-item stx-results-panel__pagination-dots"
        aria-hidden="true"
      >
        ...
      </li>`);
	if (paginationStartPage < pagesCount - 4) paginationButtonList.push(html` <li class="stx-results-panel__pagination-list-item">
        <button
          data-page-number="${pagesCount}"
          aria-label="${results.labels.ariaPaginationGoToPage(pagesCount)}"
        >
          ${pagesCount}
        </button>
      </li>`);
	return html`
    <nav
      aria-label="${results.labels.ariaPaginationNavigation()}"
      class="stx-results-panel__pagination-container"
    >
      <ul class="stx-results-panel__pagination-list">
        ${paginationButtonList}
      </ul>
    </nav>
  `;
};
var createItems = (data, renderers) => {
	return data.hits.hits?.map((item) => {
		const { type } = item._source;
		let itemContent;
		if (renderers[`item-${type}`]) try {
			itemContent = renderers[`item-${type}`](item);
		} catch (error) {
			console.error(error);
			return noItemRenderer(item);
		}
		else itemContent = html`
        <span>
          <span>${item._id}</span>
          <span>${item._source?.type}</span>
        </span>
      `;
		return html`
      <li class="stx-results-panel__results-item">${itemContent}</li>
    `;
	});
};
var createFacets = () => {
	return html`
    <aside class="stx-results-panel__facets-container">
      FACETS

      <fieldset>
        <legend>Facet name</legend>
      </fieldset>
    </aside>
  `;
};
var createResults = (resultsPanel, data, results, currentPage) => {
	const items = createItems(data, results.renderers);
	const resultsNumber = createResultsNumber(data, results, currentPage);
	const pagination = createPagination(data, results, currentPage);
	resultsPanel.innerHTML = "";
	const newResults = html`
    ${createFacets()}
    <div class="stx-results-panel__container">
      ${resultsNumber}
      <ul>
        ${items}
      </ul>
      ${pagination}
    </div>
  `;
	if (pagination) pagination.querySelectorAll("button[data-page-number]").forEach((btn) => {
		const pageNumber = parseInt(btn.getAttribute("data-page-number") || "0");
		btn.addEventListener("click", () => {
			buildResultsForPage(resultsPanel, results, pageNumber);
		});
	});
	resultsPanel.append(...newResults);
	announceResults(results.labels.totalResults(data.hits.total.value));
};
var addOnSearchParamChangeAction = (resultsPanel, results) => {
	let prevSearchParam = new URL(window.location.href).searchParams.get("stx-search") || "";
	const onUrlChagne = () => {
		const searchQuery = new URLSearchParams(window.location.search).get("stx-search") || "";
		if (prevSearchParam !== searchQuery) {
			buildResultsForPage(resultsPanel, results, 1);
			prevSearchParam = searchQuery;
		}
	};
	window.addEventListener("popstate", () => {
		onUrlChagne();
	});
	addUrlChangeListener(() => {
		onUrlChagne();
	});
};
var createResultsPanel = (resultsConfig) => {
	const results = resolveConfig(resultsConfig);
	const resultsPanel = html`
    <div class="stx-results-panel">${results.renderers.loader()}</div>
  `;
	try {
		buildResultsForPage(resultsPanel, results, 1);
		addOnSearchParamChangeAction(resultsPanel, results);
		return resultsPanel;
	} catch (error) {
		console.error(error);
		return results.renderers.error(results.labels);
	}
};
//#endregion
export { config as n, createResultsPanel as t };

//# sourceMappingURL=results-panel-C-8PM_EN.js.map