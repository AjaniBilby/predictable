/*-------------------------------------------
	Generated by htmx-router
	Warn: Any changes will be overwritten
-------------------------------------------*/

import { RouteModule, RouteContext } from "htmx-router";
import { RegisterDynamic } from "htmx-router/bin/util/dynamic";
import { RouteTree } from "htmx-router/bin/router";

const modules = import.meta.glob('./routes/**/*.{ts,tsx}', { eager: true });

export const tree = new RouteTree();
for (const path in modules) {
	const tail = path.lastIndexOf(".");
	const url = path.slice(9, tail);
	tree.ingest(url, modules[path] as RouteModule);
}

type Loader<T> = (params: T, ctx: RouteContext) => Promise<JSX.Element>;
export function Dynamic<T extends Record<string, string>>(props: {
	params: T,
	load: Loader<T>
	children?: JSX.Element
}): JSX.Element {
	const path = RegisterDynamic(props.load);

	const query = new URLSearchParams();
	for (const key in props.params) query.set(key, props.params[key]);
	const url = path + query.toString();

	return <div
		hx-get={url}
		hx-trigger="load"
		hx-swap="outerHTML transition:true"
		style={{ display: "contents" }}
	>{props.children ? props.children : ""}</div>
}