#!/usr/bin/env node
"use strict";

import { readdirSync, writeFileSync } from "fs";

export function BuildDynamic(cwd: string) {
	const rootMatcher = new RegExp(/^root\.(j|t)sx?$/);
	const root = readdirSync(cwd)
		.filter(x => rootMatcher.test(x))[0];

	if (!root) {
		console.log(`Missing root.jsx/tsx`);
		process.exit(1);
	}

	let script = `import { extname, join, relative, resolve } from "path";
import { readdirSync } from "fs";

import { RouteTree, IsAllowedExt } from "~/router";

function readDirRecursively(dir: string) {
	const files = readdirSync(dir, { withFileTypes: true });

	let filePaths: string[] = [];
	for (const file of files) {
		if (file.isDirectory()) {
			filePaths = [...filePaths, ...readDirRecursively(join(dir, file.name))];
		} else {
			filePaths.push(join(dir, file.name));
		}
	}

	return filePaths;
}
export const Router = new RouteTree();

const ctx = resolve(\`${__dirname}/routes\`);
const files = readDirRecursively(ctx);
for (const file of files){
	const ext = extname(file);
	if (!IsAllowedExt(ext)) continue;
	const url = relative(ctx, file.slice(0, file.lastIndexOf(\".\")).replace(/\\\\/g, \"/\"));
	import(file).then((mod) => Router.ingest(url, mod, [false]));
}`;

	writeFileSync(`${cwd}/router.ts`, script);
	console.log( `Finished Building`);
}