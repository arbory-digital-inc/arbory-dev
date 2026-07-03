import { OpenSearchResponse } from './types/open-search';
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
export declare function html(strings: TemplateStringsArray, ...values: unknown[]): Element | HTMLCollection;
/**
 * Captures the currently focused element and returns a function to restore focus to it.
 */
export declare function trapFocus(): () => void;
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
export declare function parseHighlight(text: string): (string | HTMLElement)[];
export declare function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void;
export declare const fetchSearchResults: (url: string, query: string, signal?: AbortSignal) => Promise<OpenSearchResponse>;
/**
 * Creates a placeholder that is replaced with the built element on the first `build()` call.
 *
 * @param buildFunction Function creating the element.
 */
export declare const createLazyComponent: (buildFunction: () => HTMLElement) => {
    element: HTMLDivElement;
    build: () => void;
};
export declare const dispatchUrlChangeEvent: () => void;
export declare const onUrlChange: (handler: () => void) => void;
type NormalizeLabels<T> = {
    [K in keyof T]-?: NonNullable<T[K]> extends (...args: infer A) => string ? (...args: A) => string : () => string;
};
export declare const normalizeLabels: <T extends Record<string, any>>(labels: T) => NormalizeLabels<T>;
export {};
