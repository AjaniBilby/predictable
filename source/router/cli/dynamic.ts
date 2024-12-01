#!/usr/bin/env node
"use strict";

import { writeFileSync } from "fs";

const script = `import { RouteModule } from '~/router/shared';
import { RouteTree } from '~/router';

const modules = import.meta.glob('./routes/**/*.{ts,tsx}', { eager: true });

export const Router = new RouteTree();
for (const path in modules) {
const tail = path.lastIndexOf(".");
const url = path.slice("./routes/".length, tail);
Router.ingest(url, modules[path] as RouteModule);
}`;

export function BuildDynamic(cwd: string) {
	writeFileSync(`${cwd}/router.ts`, script);
	console.log( `Finished Building`);
}