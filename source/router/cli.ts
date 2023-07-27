import { readdirSync, writeFileSync } from "node:fs";
import { extname } from "node:path";

import { IsAllowedExt } from "./router";

const files = readdirSync('./routes')
	.filter(x => IsAllowedExt(extname(x).slice(1)))
	.map(x => `./routes/${x}`);


let script = `import { RouteTree } ../cli/router;\n` +
	`const Router = new RouteTree;\n`;

writeFileSync('./router.js', script);
console.log(files);