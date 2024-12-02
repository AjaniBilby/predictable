import type * as http from "http";
import type * as CSS from 'csstype';
import { ViteDevServer } from "vite";

import { RouteContext } from '~/router/router';
import { RouteTree } from '~/router';

export function StyleCSS(props: CSS.Properties<string | number>) {
	let out = "";

	for (const key in props) {
		const value = props[key as keyof CSS.Properties<string | number>];
		if (typeof(value) !== "string" && typeof(value) !== "number" ) continue;

		const safeKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
		const safeVal = value.toString().replace(/"/g, "\\\"");
		out += `${safeKey}: ${safeVal};`
	}

	return out;
}

export async function HttpResolutionHelper(req: http.IncomingMessage & { originalUrl?: string }, tree: RouteTree, renderer: RouteContext["render"]): Promise<Response> {
	const ctrl = new AbortController();
	const headers = new Headers(req.headers as any);
	const url = new URL(`http://${headers.get('host')}${req.originalUrl || req.url}`);

	req.once('aborted', () => ctrl.abort())

	const bodied = req.method !== "GET" && req.method !== "HEAD";
	const request = new Request(url, {
		headers,
		method: req.method,
		body: bodied ? req : undefined,
		signal: ctrl.signal,
		referrer: headers.get("referrer") || undefined,
		duplex: bodied ? 'half' : undefined,
	});

	return await RenderRoute(request, url, tree, renderer);
}

export async function RenderRoute(request: Request, url: URL, tree: RouteTree, renderer: RouteContext["render"]): Promise<Response> {
	const x = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
	const fragments = x.split("/").slice(1);

	const ctx = new RouteContext(request, url, renderer);

	const res = await tree.resolve(fragments, ctx);
	if (res === null) return new Response("Not Found", { status: 404, statusText: "Not Found" });

	return res;
}