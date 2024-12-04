
function quickHash(input: string) {
	let hash = 0;
	for (let i = 0; i < input.length; i++) {
		hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
	}
	return hash.toString(36).slice(0, 5);
}

const classNamePattern = /^[a-zA-Z_][a-zA-Z0-9_-]*$/;

const registry = new Array<StyleClass>();
let cache: { sheet: string, hash: string } | null = null;

export class StyleClass {
	name:  string;
	style: string;
	hash:  string;

	constructor (name: string, style: string) {
		if (!name.match(classNamePattern)) throw new Error("Cannot use given name for CSS class");

		this.hash = quickHash(style);
		this.name = `${name}-${this.hash}`;

		style = style.replaceAll(".this", "."+this.name);
		this.style = style;

		registry.push(this);
		cache = null;
	}

	toString() {
		return this.name;
	}
}


function GetSheet() {
	return cache || BuildSheet();
}

export function GetSheetUrl() {
	const sheet = GetSheet();
	return `/_/style/${sheet.hash}.css`;
}

export function _resolve(fragments: string[]): Response | null {
	if (!fragments[2]) return null;

	const build = GetSheet();
	if (!fragments[2].startsWith(build.hash)) return null;

	const headers = new Headers();
	headers.set("Content-Type", "text/css");
	headers.set("Cache-Control", "public, max-age=604800");

	return new Response(build.sheet, { headers });
}


function BuildSheet() {
	const key  = registry.map(x => x.hash).join("");
	const hash = quickHash(key);

	const sheet = registry.map(x => x.style).join("");
	cache = { hash, sheet };

	return cache;
}