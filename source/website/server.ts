// import * as mimetype from "mimetype";
import * as dotenv from "dotenv";
import http from "node:http";
dotenv.config();

import * as fs from 'node:fs';
import * as path from 'node:path';

import { Router } from "./router";


const staticDir = path.join(__dirname,
	process.argv[0].includes("ts-node") ? 'static' : "../source/website/static"
);


const app = http.createServer(async (req, res) => {
	const url = new URL(req.url || "/", "http://localhost");

	if (url.pathname.length != 1 && url.pathname.endsWith("/")) {
		const newPath = url.pathname.slice(0, -1) + url.search;
		res.statusCode = 302;
		res.setHeader('Location', newPath);
		return res.end();
	}

	const file = path.join(staticDir, url.pathname);

	// Check file is valid and not escaped dir ../../
	if (fs.existsSync(file) && file.startsWith(staticDir)) {
		const stats = fs.statSync(file);
		if (stats.isFile()) {
			// res.setHeader('Content-Type', mimetype.lookup(path.extname(file)) || "");
			res.setHeader('Content-Length', stats.size);
			const stream = fs.createReadStream(file);
			stream.pipe(res);
			return;
		}
	}

	const out = await Router.render(req, res, url);
	res.setHeader('Content-Type', 'text/html');
	res.end(out);
	return;
});


app.listen(process.env.HTTP_PORT, ()=> {
	console.log(`Listening on ${process.env.HTTP_PORT}`)
});



process.on('SIGTERM', () => {
	app.close();
});
process.on('SIGHUP', () => {
	app.close();
});