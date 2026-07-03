import { a as html } from "./common-CzdFOaSu.js";
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
//#endregion
export { replaceElWithError as i, loadCssFile as n, renderEDSLableTemplate as r, getEDSConfig as t };

//# sourceMappingURL=eds-helper-CnTHYa0p.js.map