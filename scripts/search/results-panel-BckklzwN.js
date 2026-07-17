import { a as html, b as buildSearchRequestBody, i as fetchSearchResults, o as normalizeLabels, p as SEARCH_QUERY_PARAM, s as onUrlChange } from "./common-CzdFOaSu.js";
//#region src/config.ts
var config = { debug: false };
//#endregion
//#region src/components/results-panel/pagination.ts
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
//#endregion
//#region src/components/results-panel/renderers.ts
var renderDefaultLoader = () => {
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
var renderResultsLoadingOverlay = () => {
	return html`
    <div
      class="stx-results-panel__loading-overlay"
      role="status"
      aria-live="polite"
      aria-label="Loading results"
    >
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
    </div>
  `;
};
var showResultsLoading = (resultsContainer) => {
	resultsContainer.classList.add("stx-results-panel__container--loading");
	resultsContainer.setAttribute("aria-busy", "true");
	if (!resultsContainer.querySelector(".stx-results-panel__loading-overlay")) resultsContainer.append(renderResultsLoadingOverlay());
};
var hideResultsLoading = (resultsContainer) => {
	resultsContainer.classList.remove("stx-results-panel__container--loading");
	resultsContainer.removeAttribute("aria-busy");
	resultsContainer.querySelector(".stx-results-panel__loading-overlay")?.remove();
};
var renderNoItem = (item) => {
	if (config.debug) return html`
      <div class="stx-results-panel__no-item-renderer">
        No custom renderer for type: ${item._source.type}
      </div>
    `;
	return "";
};
var renderResultsPanelError = () => {
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
var defaultConfig = {
	pageSize: 20,
	renderers: {
		loader: renderDefaultLoader,
		error: renderResultsPanelError
	},
	labels: {
		paginationInfo: (currentPage, pageNumber) => `Page ${currentPage} of ${pageNumber}`,
		totalResults: (totalCount) => `${totalCount} results found.`,
		ariaPaginationGoToPage: (pageNumber) => `Go to page ${pageNumber}`,
		ariaPaginationNavigation: () => "Pagination"
	}
};
var resolveConfig = (resultsConfig) => {
	const defaultLabels = normalizeLabels(defaultConfig.labels);
	const configLabels = resultsConfig.labels ? normalizeLabels(resultsConfig.labels) : {};
	return {
		...defaultConfig,
		...resultsConfig,
		renderers: {
			...defaultConfig.renderers,
			...resultsConfig.renderers
		},
		labels: {
			...defaultLabels,
			...Object.fromEntries(Object.entries(configLabels).filter(([, value]) => value !== void 0))
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
var panelStates = /* @__PURE__ */ new WeakMap();
var getSearchQuery = () => new URL(window.location.href).searchParams.get(SEARCH_QUERY_PARAM) || "";
var buildSearchUrl = (results, pageNumber, selectedFilters) => {
	const dataUrl = new URL(results.dataSources[0], window.location.href);
	dataUrl.searchParams.set("from", String((pageNumber - 1) * results.pageSize));
	dataUrl.searchParams.set("size", String(results.pageSize));
	if (selectedFilters.size > 0) {
		const filters = Object.fromEntries([...selectedFilters.entries()].map(([facetId, values]) => [facetId, [...values]]));
		dataUrl.searchParams.set("filters", JSON.stringify(filters));
	}
	return dataUrl.toString();
};
var buildResultsRequestOptions = (results, pageNumber, selectedFilters, query) => {
	if (results.method !== "POST") return {};
	const filters = Object.fromEntries([...selectedFilters.entries()].map(([facetId, values]) => [facetId, [...values]]));
	return {
		method: "POST",
		body: buildSearchRequestBody({
			from: (pageNumber - 1) * results.pageSize,
			size: results.pageSize,
			query,
			filters
		})
	};
};
var bindPagination = (pagination, resultsPanel, results) => {
	if (!pagination) return;
	pagination.querySelectorAll("button[data-page-number]").forEach((btn) => {
		const pageNumber = parseInt(btn.getAttribute("data-page-number") || "0");
		btn.addEventListener("click", () => {
			buildResultsForPage(resultsPanel, results, pageNumber, { preserveFacets: true });
		});
	});
};
var createResultsContainer = (data, results, currentPage) => {
	const items = createItems(data, results.renderers);
	const resultsNumber = createResultsNumber(data, results, currentPage);
	const pagination = createPagination(data, results, currentPage);
	return {
		element: html`
      <div class="stx-results-panel__container">
        ${resultsNumber}
        <ul class="stx-results-panel__results-list">
          ${items}
        </ul>
        ${pagination}
      </div>
    `,
		pagination
	};
};
var updateResultsMeta = (resultsContainer, data, results, currentPage, resultsPanel) => {
	const totalNumber = data.hits?.total.value || 0;
	const pagesNumber = Math.ceil(totalNumber / results.pageSize);
	const pageNumberEl = resultsContainer.querySelector(".stx-results-panel__page-number");
	const totalNumberEl = resultsContainer.querySelector(".stx-results-panel__total-number");
	if (pageNumberEl) pageNumberEl.textContent = results.labels.paginationInfo(currentPage, pagesNumber);
	if (totalNumberEl) totalNumberEl.textContent = results.labels.totalResults(totalNumber);
	const oldPagination = resultsContainer.querySelector(".stx-results-panel__pagination-container");
	const pagination = createPagination(data, results, currentPage);
	if (oldPagination) {
		if (pagination) oldPagination.replaceWith(pagination);
		else oldPagination.remove();
	} else if (pagination) resultsContainer.append(pagination);
	bindPagination(pagination, resultsPanel, results);
};
var updateResultsList = (resultsPanel, data, results, currentPage) => {
	const resultsContainer = resultsPanel.querySelector(".stx-results-panel__container");
	if (!(resultsContainer instanceof HTMLElement)) return;
	const listEl = resultsContainer.querySelector(".stx-results-panel__results-list");
	if (!(listEl instanceof HTMLElement)) return;
	const items = createItems(data, results.renderers) || [];
	listEl.replaceChildren(...items);
	updateResultsMeta(resultsContainer, data, results, currentPage, resultsPanel);
	hideResultsLoading(resultsContainer);
	announceResults(results.labels.totalResults(data.hits.total.value));
};
var buildResultsForPage = (resultsPanel, results, pageNumber, options = {}) => {
	const { preserveFacets = false, resetFilters = false } = options;
	const panelState = panelStates.get(resultsPanel);
	if (!panelState) return;
	const restorePageFocus = restoreFocusForPage();
	if (resetFilters) panelState.selectedFilters.clear();
	panelState.currentPage = pageNumber;
	const facetsContainer = resultsPanel.querySelector(".stx-results-panel__facets-container");
	const resultsContainer = resultsPanel.querySelector(".stx-results-panel__container");
	if (preserveFacets && facetsContainer && resultsContainer) showResultsLoading(resultsContainer);
	else {
		resultsPanel.innerHTML = "";
		resultsPanel.append(results.renderers.loader());
		panelState.facetsElement = null;
	}
	const searchUrl = buildSearchUrl(results, pageNumber, panelState.selectedFilters);
	const requestOptions = buildResultsRequestOptions(results, pageNumber, panelState.selectedFilters, getSearchQuery());
	fetchSearchResults(searchUrl, getSearchQuery(), void 0, requestOptions).then((responseData) => {
		if (preserveFacets && facetsContainer) updateResultsList(resultsPanel, responseData, results, pageNumber);
		else renderFullResults(resultsPanel, responseData, results, pageNumber, panelState);
		restorePageFocus();
	}).catch((error) => {
		if (preserveFacets && resultsContainer instanceof HTMLElement) hideResultsLoading(resultsContainer);
		console.error(error);
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
var createItems = (data, renderers) => {
	return data.hits.hits?.map((item) => {
		const { type } = item._source;
		let itemContent;
		if (renderers[`item-${type}`]) try {
			itemContent = renderers[`item-${type}`](item);
		} catch (error) {
			console.error(error);
			return renderNoItem(item);
		}
		else itemContent = html`
        <span class="stx-results-panel__missing-renderer">
          <span>Missing renderer for "item-${item?._source?.type}"</span>
          <span>${JSON.stringify(item)}</span>
        </span>
      `;
		return html`
      <li class="stx-results-panel__results-item">${itemContent}</li>
    `;
	});
};
var facetNodeIdSeq = 0;
var humanizeFacetName = (field) => field.replace(/_level\d+$/, "").replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) || field;
var getBucketChildAgg = (bucket) => {
	for (const key of Object.keys(bucket)) {
		if (key === "key" || key === "key_as_string" || key === "doc_count") continue;
		const value = bucket[key];
		if (value && Array.isArray(value.buckets)) return {
			field: key,
			buckets: value.buckets
		};
	}
	return null;
};
var createFacetNodeList = (buckets, field, panelState, parentPath = "") => {
	// Only reserve chevron space when at least one sibling actually nests, so a
	// fully flat facet renders as a clean checkbox list with no dangling indent.
	const siblingsHaveChildren = buckets.some((bucket) => getBucketChildAgg(bucket));
	return buckets.map((bucket) => createFacetNode(bucket, field, panelState, siblingsHaveChildren, parentPath));
};
var createFacetNode = (bucket, field, panelState, siblingsHaveChildren, parentPath) => {
	const key = String(bucket.key);
	// The filter value is the full ancestor path (e.g. "Electronics>Tablet"), which
	// is what the endpoint filters against; the label still shows just this key.
	const path = parentPath ? `${parentPath}>${key}` : key;
	const isSelected = panelState.selectedFilters.get(field)?.has(path) ? "checked" : "";
	const child = getBucketChildAgg(bucket);
	const childrenId = `stx-facet-children-${facetNodeIdSeq++}`;
	const childrenPanel = child ? html`
    <div id="${childrenId}" class="stx-results-panel__facet-children" hidden>
      ${createFacetNodeList(child.buckets, child.field, panelState, path)}
    </div>
  ` : "";
	let expander = "";
	if (child) expander = html`
    <button
      type="button"
      class="stx-results-panel__facet-subtoggle"
      aria-expanded="false"
      aria-controls="${childrenId}"
      aria-label="Toggle ${key} subcategories"
    >
      <span class="stx-results-panel__facet-chevron" aria-hidden="true"></span>
    </button>
  `;
	else if (siblingsHaveChildren) expander = html`<span class="stx-results-panel__facet-subtoggle-spacer" aria-hidden="true"></span>`;
	return html`
    <div class="stx-results-panel__facet-node">
      <div class="stx-results-panel__facet-row">
        ${expander}
        <label class="stx-results-panel__facet-option">
          <input
            type="checkbox"
            name="${field}"
            data-facet-id="${field}"
            value="${path}"
            ${isSelected}
          />
          <span class="stx-results-panel__facet-label">${key}</span>
          <span class="stx-results-panel__facet-count">${bucket.doc_count ?? 0}</span>
        </label>
      </div>
      ${childrenPanel}
    </div>
  `;
};
var createFacetGroup = (field, aggregation, panelState) => {
	const buckets = aggregation?.buckets || [];
	if (buckets.length === 0) return "";
	const valuesId = `stx-facet-${field}-values`;
	return html`
    <div class="stx-results-panel__facet">
      <button
        type="button"
        class="stx-results-panel__facet-toggle"
        aria-expanded="false"
        aria-controls="${valuesId}"
      >
        <span class="stx-results-panel__facet-name">${humanizeFacetName(field)}</span>
        <span class="stx-results-panel__facet-chevron" aria-hidden="true"></span>
      </button>
      <div id="${valuesId}" class="stx-results-panel__facet-values" hidden>
        ${createFacetNodeList(buckets, field, panelState)}
      </div>
    </div>
  `;
};
// Finds the checkbox of a node's direct parent in the facet tree, or null for a
// top-level node (whose container is `.facet-values`, not `.facet-children`).
var findParentFacetInput = (input) => {
	const node = input.closest(".stx-results-panel__facet-node");
	const container = node?.parentElement;
	if (!container || !container.classList.contains("stx-results-panel__facet-children")) return null;
	const parentNode = container.closest(".stx-results-panel__facet-node");
	return parentNode ? parentNode.querySelector(":scope > .stx-results-panel__facet-row .stx-results-panel__facet-option input") : null;
};
var selectFacetInput = (input, panelState) => {
	const facetId = input.getAttribute("data-facet-id");
	if (!facetId) return;
	input.checked = true;
	if (!panelState.selectedFilters.has(facetId)) panelState.selectedFilters.set(facetId, /* @__PURE__ */ new Set());
	panelState.selectedFilters.get(facetId).add(input.value);
};
var initFacets = (facetsContainer, panelState, resultsPanel, results) => {
	facetsContainer.querySelectorAll(".stx-results-panel__facet-toggle, .stx-results-panel__facet-subtoggle").forEach((toggle) => {
		const targetId = toggle.getAttribute("aria-controls");
		const valuesPanel = targetId ? facetsContainer.querySelector(`#${CSS.escape(targetId)}`) : toggle.nextElementSibling;
		if (!(valuesPanel instanceof HTMLElement)) return;
		toggle.addEventListener("click", () => {
			const isExpanded = toggle.getAttribute("aria-expanded") === "true";
			toggle.setAttribute("aria-expanded", String(!isExpanded));
			valuesPanel.hidden = isExpanded;
		});
	});
	facetsContainer.querySelectorAll(".stx-results-panel__facet-option input").forEach((input) => {
		input.addEventListener("change", (event) => {
			const checkbox = event.currentTarget;
			if (!(checkbox instanceof HTMLInputElement)) return;
			const facetId = checkbox.getAttribute("data-facet-id");
			const { value } = checkbox;
			if (!facetId) return;
			if (!panelState.selectedFilters.has(facetId)) panelState.selectedFilters.set(facetId, /* @__PURE__ */ new Set());
			const facetValues = panelState.selectedFilters.get(facetId);
			if (checkbox.checked) {
				facetValues.add(value);
				// Selecting a nested value must also select its ancestor chain so the
				// POST filter_query keeps the parent nesting OpenSearch expects.
				let parentInput = findParentFacetInput(checkbox);
				while (parentInput instanceof HTMLInputElement) {
					selectFacetInput(parentInput, panelState);
					parentInput = findParentFacetInput(parentInput);
				}
			} else {
				facetValues.delete(value);
				if (facetValues.size === 0) panelState.selectedFilters.delete(facetId);
			}
			buildResultsForPage(resultsPanel, results, 1, { preserveFacets: true });
		});
	});
};
var createFacets = (data, panelState, resultsPanel, results) => {
	const aggregations = data?.aggregations || {};
	const groups = Object.keys(aggregations).map((field) => createFacetGroup(field, aggregations[field], panelState)).filter((group) => group instanceof HTMLElement);
	const facetsContainer = html`
    <aside class="stx-results-panel__facets-container">
      ${groups}
    </aside>
  `;
	initFacets(facetsContainer, panelState, resultsPanel, results);
	panelState.facetsElement = facetsContainer;
	return facetsContainer;
};
var renderFullResults = (resultsPanel, data, results, currentPage, panelState) => {
	const { element: resultsContainer, pagination } = createResultsContainer(data, results, currentPage);
	const facetsContainer = createFacets(data, panelState, resultsPanel, results);
	resultsPanel.innerHTML = "";
	resultsPanel.append(facetsContainer, resultsContainer);
	panelState.resultsContainer = resultsContainer;
	bindPagination(pagination, resultsPanel, results);
	announceResults(results.labels.totalResults(data.hits.total.value));
};
var addOnSearchParamChangeAction = (resultsPanel, results) => {
	let prevSearchParam = new URL(window.location.href).searchParams.get(SEARCH_QUERY_PARAM) || "";
	const onUrlChagne = () => {
		const searchQuery = new URLSearchParams(window.location.search).get(SEARCH_QUERY_PARAM) || "";
		if (prevSearchParam !== searchQuery) {
			buildResultsForPage(resultsPanel, results, 1, { resetFilters: true });
			prevSearchParam = searchQuery;
		}
	};
	window.addEventListener("popstate", () => {
		onUrlChagne();
	});
	onUrlChange(() => {
		onUrlChagne();
	});
};
var createResultsPanel = (resultsConfig) => {
	const results = resolveConfig(resultsConfig);
	const resultsPanel = html`
    <div class="stx-results-panel">${results.renderers.loader()}</div>
  `;
	panelStates.set(resultsPanel, {
		currentPage: 1,
		selectedFilters: /* @__PURE__ */ new Map(),
		facetsElement: null,
		resultsContainer: null
	});
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

//# sourceMappingURL=results-panel-BckklzwN.js.map