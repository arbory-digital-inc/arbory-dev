//#region src/helper.ts
/**
* A tagged template function that parses an HTML string into DOM elements.
*
* It supports embedding strings, numbers, single DOM elements (`HTMLElement`),
* as well as collections of elements (`Array` or `NodeList`).
*
* @example
* // 1. Single element
* const element = html`<div class="box">Hello World</div>`;
*
* @example
* // 2. Nested elements and arrays
* const listItems = [html`<li>Item 1</li>`, html`<li>Item 2</li>`];
* const list = html`<ul>${listItems}</ul>`;
*
* @param {TemplateStringsArray} strings - The array of literal string segments.
* @param {...unknown[]} values - The dynamic expressions interpolated into the template.
* @returns {Element | HTMLCollection} A single `Element` if the template contains exactly
* one top-level root element, otherwise an `HTMLCollection` of all root-level elements.
*/
function html(strings, ...values) {
	const template = document.createElement("template");
	template.innerHTML = strings.reduce((acc, str, i) => {
		const val = values[i];
		if (val instanceof HTMLElement || val instanceof Array || val instanceof NodeList) return `${acc}${str}<template data-html-id="value-${i}"></template>`;
		return acc + str + (val ?? "");
	}, "");
	template.content.querySelectorAll("[data-html-id]").forEach((el) => {
		const htmlId = el.dataset.htmlId;
		if (!htmlId) return;
		const idString = htmlId.split("-")[1];
		if (!idString) return;
		const targetValue = values[parseInt(idString, 10)];
		if (targetValue instanceof Array) {
			el.replaceWith(...targetValue);
			return;
		}
		if (targetValue instanceof NodeList) {
			el.replaceWith(...Array.from(targetValue));
			return;
		}
		if (targetValue instanceof HTMLElement) {
			el.replaceWith(targetValue);
			return;
		}
		console.error("Case not handled for", el);
	});
	const { children } = template.content;
	return children.length === 1 ? children[0] : children;
}
/**
* Captures the currently focused element and returns a function to restore focus to it.
*/
function trapFocus() {
	const lastFocused = document.activeElement;
	return () => {
		if (lastFocused instanceof HTMLElement && document.body.contains(lastFocused)) lastFocused.focus();
		else document.body.focus();
	};
}
/**
* Decodes HTML entities into their corresponding characters
* using a temporary <textarea> element.
*
* This approach leverages the browser's built-in HTML parser
* to convert entities like &amp;, &lt;, &#169;, etc. into
* their decoded character equivalents.
*
* ⚠️ Security note:
* This is safe in this context because the textarea element
* is never attached to the DOM. It is used only as an internal
* parsing utility. However, it still relies on innerHTML
* parsing behavior.
*
* @param {string} text - String containing HTML entities.
* @returns {string} Decoded string with HTML entities resolved.
*
* @example
* decodeEntities("Tom &amp; Jerry") // "Tom & Jerry"
* decodeEntities("&#169; &lt;test&gt;") // "© <test>"
*/
function decodeEntities(text) {
	const textarea = document.createElement("textarea");
	textarea.innerHTML = text;
	return textarea.value;
}
/**
* Parses OpenSearch/Elasticsearch highlight strings containing <em> tags
* and returns an array of text and DOM nodes.
*
* Only <em> and </em> tags are supported. All other HTML is treated as text.
*
* Workflow:
* - Splits input by <em> and </em>
* - Decodes HTML entities in all text parts
* - Wraps content inside <em> elements as DOM nodes
*
* @param {string} text - Highlight string (e.g. from OpenSearch highlight field)
* @returns {(string|HTMLElement)[]} Array of strings and <em> DOM elements
*
* @example
* parseHighlight("Test &amp; <em>Lorem</em> ipsum")
* // [
* //   "Test & ",
* //   <em>Lorem</em>,
* //   " ipsum"
* // ]
*
* @example
* parseHighlight("A <em>B &amp; C</em> D")
* // [
* //   "A ",
* //   <em>B & C</em>,
* //   " D"
* // ]
*/
function parseHighlight(text) {
	const parts = text.split(/(<\/?em>)/);
	const result = [];
	let insideEm = false;
	for (const part of parts) {
		if (!part) continue;
		if (part === "<em>") {
			insideEm = true;
			continue;
		}
		if (part === "</em>") {
			insideEm = false;
			continue;
		}
		const decoded = decodeEntities(part);
		if (insideEm) {
			const em = document.createElement("em");
			em.textContent = decoded;
			result.push(em);
		} else result.push(decoded);
	}
	return result;
}
function debounce(fn, delay) {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			fn(...args);
		}, delay);
	};
}

const exampleOfQUeryRequestBody = {
    "id": "eds-pages",
    "params": {
        "from": 0,
        "size": 20,
        "facets": {
            "fields": [
                {
                    "name": "category_level0",
                    "size": 20,
                    "children": [
                        {
                            "name": "category_level1",
                            "size": 20,
                            "children": [
                                {
                                    "name": "category_level2",
                                    "size": 20,
                                    "last": true
                                }
                            ],
                            "last": true
                        }
                    ],
                    "last": true
                }
            ]
        }
    }
}

// Every selected facet value is filtered against this single field, using the
// value's full hierarchical path (e.g. "Electronics>Tablet").
var FILTER_QUERY_FIELD = "category_hierarchy";
/**
* Builds the POST request body for the OpenSearch-backed search endpoint.
* The facets field configuration is taken from `exampleOfQUeryRequestBody` so
* the request/response shapes stay in sync while the API is being built.
* Selected filters become `params.filter_query.fields`: one entry per facet group
* (values within a group are OR-ed; groups are AND-ed), with `last: true` on the
* final entry.
*/
var buildSearchRequestBody = ({ from = 0, size = 20, query = "", filters } = {}) => {
	const params = {
		from,
		size,
		facets: exampleOfQUeryRequestBody.params.facets
	};
	if (query) params.query = query;
	const filterValueGroups = filters ? Object.values(filters).filter((values) => values.length > 0) : [];
	if (filterValueGroups.length > 0) params.filter_query = { fields: filterValueGroups.map((values, index) => {
		const entry = {
			name: FILTER_QUERY_FIELD,
			values
		};
		if (index === filterValueGroups.length - 1) entry.last = true;
		return entry;
	}) };
	return {
		id: exampleOfQUeryRequestBody.id,
		params
	};
};

var fetchSearchResults = async (url, query, signal, requestOptions = {}) => {
	const searchURL = new URL(url, window.location.origin);
	searchURL.searchParams.set("query", query);

	let response;
	if (requestOptions.method === "POST") {
		// POST results/facets request — everything travels in the body, so send a
		// clean URL with no query params.
		const postURL = new URL(url, window.location.origin);
		postURL.search = "";
		response = await fetch(postURL.toString(), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestOptions.body),
			signal
		});
	} else {
		// GET typeahead/highlights request.
		response = await fetch(searchURL.toString(), { signal });
	}

	if (!response.ok) throw new Error(`Fetch data error: ${response.status}`);
	return response.json();
};

/**
* Creates a placeholder that is replaced with the built element on the first `build()` call.
*
* @param buildFunction Function creating the element.
*/
var createLazyComponent = (buildFunction) => {
	let isBuild = false;
	const placeholderEl = html`
    <div data-lazy-build="true"></div>
  `;
	const build = () => {
		if (isBuild) return;
		const newEl = buildFunction();
		placeholderEl.replaceWith(newEl);
		isBuild = true;
	};
	return {
		element: placeholderEl,
		build
	};
};
var dispatchUrlChangeEvent = () => {
	window.dispatchEvent(new Event("urlchange"));
};
var onUrlChange = (handler) => {
	window.addEventListener("urlchange", () => {
		handler();
	});
};
var normalizeLabels = (labels) => {
	return Object.fromEntries(Object.entries(labels).map(([key, value]) => {
		return [key, typeof value === "string" ? () => value : value];
	}));
};
//#endregion
//#region src/renderers/renderers.ts
/**
* Resolves the destination URL for a search hit from its `_id`.
* The index namespaces the `_id` with the hit's `namespace` (e.g.
* `en:/en/blog/post`), so strip that `${namespace}:` prefix to get a
* usable URL (`/en/blog/post`). Hits without a namespace are returned as-is.
*/
function getHitUrl(item) {
	const id = item?._id ?? "";
	const namespace = item?._source?.namespace;
	if (namespace && id.startsWith(`${namespace}:`)) return id.slice(namespace.length + 1);
	return id;
}
function suggestionItem(item) {
	const id = crypto.randomUUID();
	const data = [];
	if (item.highlight?.["payload.title"]) data.push(...item.highlight["payload.title"]);
	if (item.highlight?.["payload.content"]) data.push(...item.highlight["payload.content"]);
	const content = data.map((el) => parseHighlight(el))[0];
	return html`
    <a href="${getHitUrl(item)}" id="${id}" class="stx-suggestion__item">
      <span>${content}</span>
    </a>
  `;
}
function groupItem(item) {
	if (!item._source.type) return;
	return html`
    <span class="stx-suggestion__category"> ${item._source.type} </span>
  `;
}
function clearIcon() {
	return "✕";
}
function searchIcon() {
	return "🔍";
}
//#endregion
//#region src/inline-search/default-config.ts
var defaultConfig = {
	input: {
		minSearchLength: 3,
		groupByCategory: true,
		labels: {
			inputPlaceholder: "Search",
			inputLabel: "Search",
			clearButtonAria: "Clear search input",
			searchButtonAria: "Go to search page"
		},
		renderers: {
			suggestionItem,
			groupItem,
			clearIcon,
			searchIcon
		}
	},
	useNonModal: false,
	analytics: () => {}
};
//#endregion
//#region src/components/suggestions/suggestions.ts
var renderSuggestionListItem = (item, config) => {
	const elements = [];
	if (item.isFirstInGroup) {
		const groupItem = config.renderers.groupItem(item);
		if (groupItem) elements.push(html`<li>${groupItem}</li>`);
	}
	const suggestionItem = config.renderers.suggestionItem(item);
	if (suggestionItem) elements.push(html`<li role="option">${suggestionItem}</li>`);
	return elements;
};
function orderByTypeWithFlags(items) {
	const groups = /* @__PURE__ */ new Map();
	const order = [];
	for (const item of items) {
		const type = item._source.type ?? "__no_type__";
		if (!groups.has(type)) {
			groups.set(type, []);
			order.push(type);
		}
		groups.get(type).push(item);
	}
	const result = [];
	for (const type of order) groups.get(type).forEach((item, index) => {
		result.push({
			...item,
			isFirstInGroup: index === 0
		});
	});
	return result;
}
var createSuggestions = (response, config) => {
	let data = response.hits?.hits || [];
	if (config.groupByCategory) data = orderByTypeWithFlags(response.hits?.hits || []);
	return { element: html`
    <ul class="stx-suggestions-wrapper" role="listbox">
      ${data.map((el) => {
		return renderSuggestionListItem(el, config);
	}).flat()}
    </ul>
  ` };
};
//#endregion
//#region src/components/query-input/query-input.ts
var resolveConfig = (customConfig) => {
	return {
		...defaultConfig.input,
		...customConfig,
		renderers: {
			...defaultConfig.input.renderers,
			...customConfig.renderers
		},
		labels: {
			...defaultConfig.input.labels,
			...Object.fromEntries(Object.entries(customConfig.labels || {}).filter(([, value]) => value !== void 0))
		}
	};
};
var createDebouncedSearch = (url, callback, buildRequestOptions) => {
	let controller = null;
	return debounce(async (query) => {
		controller?.abort();
		controller = new AbortController();
		try {
			const requestOptions = buildRequestOptions ? buildRequestOptions(query) : {};
			callback(await fetchSearchResults(url, query, controller.signal, requestOptions));
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") return;
			console.error(error);
		}
	}, 300);
};
// URL param that carries the active search query across the search components.
var SEARCH_QUERY_PARAM = "stx-search";
var updateSearchQuery = (query) => {
	const url = new URL(window.location.href);
	url.searchParams.delete(SEARCH_QUERY_PARAM);
	url.searchParams.set(SEARCH_QUERY_PARAM, query);
	window.history.pushState({}, "", url);
	dispatchUrlChangeEvent();
};
function createQueryInput(customConfig) {
	const config = resolveConfig(customConfig);
	const inputTextId = crypto.randomUUID();
	const suggestionWrapperId = crypto.randomUUID();
	const { labels, renderers } = config;
	let onSearch;
	const queryInputEl = html`
    <div class="stx-query-input">
      <div class="stx-query-input__controls">
        <div class="stx-query-input__input-wrapper">
          <label for="${inputTextId}">${labels.inputLabel}</label>
          <input
            class="stx-query-input__input"
            type="text"
            placeholder="${labels.inputPlaceholder}"
            role="combobox"
            aria-expanded="false"
            aria-autocomplete="list"
            aria-controls="${suggestionWrapperId}"
            id="${inputTextId}"
          />
          <button
            class="stx-query-input__clear-button stx-hidden"
            type="button"
            aria-label="${labels.clearButtonAria}"
          >
            ${renderers.clearIcon()}
          </button>
        </div>
        <button
          class="stx-query-input__search-button"
          type="button"
          aria-label="${labels.searchButtonAria}"
        >
          ${renderers.searchIcon()}
        </button>
      </div>
      <div
        class="stx-query-input__suggestions-wrapper"
        id="${suggestionWrapperId}"
      ></div>
    </div>
  `;
	const inputEl = queryInputEl.querySelector(".stx-query-input__input");
	const suggestionContainer = queryInputEl.querySelector(".stx-query-input__suggestions-wrapper");
	const clearButton = queryInputEl.querySelector(".stx-query-input__clear-button");
	const searchButton = queryInputEl.querySelector(".stx-query-input__search-button");
	let activeIndex = -1;
	let suggestionListLenght = 0;
	const closeSuggestions = () => {
		activeIndex = -1;
		suggestionListLenght = 0;
		if (suggestionContainer) suggestionContainer.innerHTML = "";
	};
	// Submitting the query. The header variant navigates to the search page;
	// the results-page variant (submitInPlace) refreshes the adjacent panel by
	// writing the `stx-search` URL param, which triggers the POST results fetch.
	const submitQuery = (query) => {
		if (config.submitInPlace) {
			updateSearchQuery(query);
			closeSuggestions();
		} else if (config.searchPageUrl) window.location.href = config.searchPageUrl(query).toString();
		else updateSearchQuery(query);
	};
	if (config.submitInPlace && inputEl) {
		const initialQuery = new URLSearchParams(window.location.search).get(SEARCH_QUERY_PARAM) || "";
		if (initialQuery) {
			inputEl.value = initialQuery;
			if (clearButton) clearButton.classList.remove("stx-hidden");
		}
	}
	const updateActiveItem = () => {
		if (!suggestionContainer) return;
		suggestionContainer.querySelectorAll(".stx-suggestion__item").forEach((el, index) => {
			if (index === activeIndex) {
				el.classList.add("is-active");
				el.setAttribute("aria-selected", "true");
				el.scrollIntoView({ block: "nearest" });
				el.setAttribute("tabindex", "0");
				inputEl.setAttribute("aria-activedescendant", el.id);
			} else {
				el.classList.remove("is-active");
				el.setAttribute("aria-selected", "false");
				el.setAttribute("tabindex", "-1");
			}
		});
		if (activeIndex === -1) inputEl.removeAttribute("aria-activedescendant");
	};
	if (inputEl) {
		let url = "";
		if (typeof config.searchApiUrl === "string") url = config.searchApiUrl;
		else url = config.searchApiUrl();
		const buildRequestOptions = config.method === "POST" ? (query) => ({
			method: "POST",
			body: buildSearchRequestBody({
				size: config.suggestionsSize || 20,
				query
			})
		}) : void 0;
		onSearch = createDebouncedSearch(url, (results) => {
			const suggestionEl = createSuggestions(results, config);
			suggestionListLenght = results.hits.hits?.length || 0;
			activeIndex = -1;
			if (suggestionContainer) {
				suggestionContainer.innerHTML = "";
				suggestionContainer.append(suggestionEl.element);
			}
		}, buildRequestOptions);
		// Initial query: when `initialQuery` is configured, prefetch its highlights
		// (GET) so that — as long as the user hasn't typed anything and there's no
		// `stx-search` param in the URL — focusing the input shows a few
		// (`initialResultsSize`, default 5) proposed results instantly.
		const initialResultsSize = config.initialResultsSize || 5;
		const hasUrlQuery = () => Boolean(new URLSearchParams(window.location.search).get(SEARCH_QUERY_PARAM));
		let initialSuggestionsPromise = null;
		const prefetchInitialSuggestions = () => {
			if (!config.initialQuery) return null;
			if (!initialSuggestionsPromise) initialSuggestionsPromise = fetchSearchResults(url, config.initialQuery).then((response) => {
				const hits = (response.hits?.hits || []).slice(0, initialResultsSize);
				return {
					...response,
					hits: {
						...response.hits,
						hits
					}
				};
			}).catch((error) => {
				console.error(error);
				initialSuggestionsPromise = null;
				return null;
			});
			return initialSuggestionsPromise;
		};
		const showInitialSuggestions = async () => {
			if (!config.initialQuery || !suggestionContainer) return;
			if (inputEl.value || hasUrlQuery()) return;
			const response = await prefetchInitialSuggestions();
			if (!response || inputEl.value || hasUrlQuery()) return;
			const suggestionEl = createSuggestions(response, config);
			suggestionListLenght = response.hits?.hits?.length || 0;
			activeIndex = -1;
			suggestionContainer.innerHTML = "";
			suggestionContainer.append(suggestionEl.element);
		};
		if (config.initialQuery && !inputEl.value && !hasUrlQuery()) prefetchInitialSuggestions();
		inputEl.addEventListener("focus", () => {
			showInitialSuggestions();
		});
		inputEl.addEventListener("input", async (event) => {
			const { value } = event.target;
			clearButton.classList.toggle("stx-hidden", !value.length);
			if (value.length >= config.minSearchLength) onSearch(inputEl.value);
			if (!value.length && suggestionContainer) {
				suggestionContainer.innerHTML = "";
				suggestionListLenght = 0;
				showInitialSuggestions();
			}
		});
		inputEl.addEventListener("keydown", (e) => {
			const { key } = e;
			if (key === "Enter") {
				if (activeIndex > -1 && suggestionContainer) {
					e.preventDefault();
					suggestionContainer.querySelectorAll(".stx-suggestion__item")[activeIndex]?.click();
				} else submitQuery(inputEl.value);
			}
			if (!suggestionListLenght) return;
			const maxIndex = suggestionListLenght;
			if (key === "ArrowDown") {
				e.preventDefault();
				if (maxIndex === 0) return;
				activeIndex = activeIndex < maxIndex ? activeIndex + 1 : 0;
				updateActiveItem();
			} else if (key === "ArrowUp") {
				e.preventDefault();
				if (maxIndex === 0) return;
				activeIndex = activeIndex > 0 ? activeIndex - 1 : maxIndex;
				updateActiveItem();
			} else if (key === "Escape") {
				activeIndex = -1;
				if (suggestionContainer) suggestionContainer.innerHTML = "";
			}
		});
		// In the results-page variant, picking a suggestion submits it as the
		// query (loads results + facets) instead of navigating to the page.
		if (config.submitInPlace && suggestionContainer) suggestionContainer.addEventListener("click", (e) => {
			const item = e.target.closest(".stx-suggestion__item");
			if (!item) return;
			e.preventDefault();
			const query = item.textContent.trim();
			inputEl.value = query;
			if (clearButton) clearButton.classList.remove("stx-hidden");
			submitQuery(query);
		});
	}
	if (clearButton && inputEl && suggestionContainer) clearButton.addEventListener("click", () => {
		inputEl.value = "";
		suggestionContainer.innerHTML = "";
		suggestionListLenght = 0;
		inputEl.focus();
	});
	if (searchButton && config.submitInPlace) searchButton.addEventListener("click", () => submitQuery(inputEl.value));
	else if (searchButton && config.searchPageUrl) {
		const { searchPageUrl } = config;
		searchButton.addEventListener("click", () => {
			const link = searchPageUrl(inputEl.value);
			window.location.href = link.toString();
		});
	} else if (searchButton) searchButton.remove();
	window.addEventListener("click", (e) => {
		const target = e.target;
		if (target !== queryInputEl && !target.closest(".stx-query-input")) {
			activeIndex = -1;
			if (suggestionContainer) suggestionContainer.innerHTML = "";
		}
	});
	return {
		element: queryInputEl,
		inputEl
	};
}
//#endregion
export { html as a, buildSearchRequestBody as b, trapFocus as c, getHitUrl as g, fetchSearchResults as i, defaultConfig as n, normalizeLabels as o, SEARCH_QUERY_PARAM as p, createLazyComponent as r, onUrlChange as s, createQueryInput as t };

//# sourceMappingURL=common-CzdFOaSu.js.map