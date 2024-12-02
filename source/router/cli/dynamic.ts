#!/usr/bin/env node
"use strict";

import { writeFileSync } from "fs";

const script = `import { RouteContext } from '~/router/router';
import { RouteModule } from '~/router/shared';
import { RouteTree } from '~/router';

const modules = import.meta.glob('./routes/**/*.{ts,tsx}', { eager: true });

const tree = new RouteTree();
for (const path in modules) {
	const tail = path.lastIndexOf(".");
	const url = path.slice("./routes/".length, tail);
	tree.ingest(url, modules[path] as RouteModule);
}

export async function Resolve(request: Request, url: URL, renderer: RouteContext["render"]): Promise<Response> {
	const x = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
	const fragments = x.split("/").slice(1);

	const ctx = new RouteContext(request, url, renderer);

	const res = await tree.resolve(fragments, ctx);
	if (res === null) return new Response("Not Found", { status: 404, statusText: "Not Found" });

	return res;
}`;

export function BuildDynamic(cwd: string) {
	writeFileSync(`${cwd}/router.ts`, script);
	console.log( `Finished Building`);
}