// import * as mimetype from "mimetype";
import * as dotenv from "dotenv";
import http from "node:http";
import path from 'node:path';
import fs from 'node:fs';

dotenv.config();

import { Router } from "~/website/router";
import { web } from "~/logging";

const staticDir = path.join(__dirname,
	process.argv[0].includes("ts-node") ? '../../public' : "../public"
);

const app = http.createServer(async (req, res) => {
	const ctrl = new AbortController()
	const headers = new Headers(req.headers as any);
	const url = new URL(`http://${headers.get('host')}${req.url}`);

	req.once('aborted', () => ctrl.abort())

	const bodied = req.method !== "GET" && req.method !== "HEAD";
	const request = new Request(url, {
		headers,
		method: req.method,
		body: bodied ? req as any : undefined,
		signal: ctrl.signal,
		referrer: headers.get("referrer") || undefined,
		// @ts-expect-error
		duplex: bodied ? 'half' : undefined,
	});

	const x = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
	const fragments = x.split("/").slice(1);

	try {
		const file = path.join(staticDir, url.pathname);
		if (fs.existsSync(file) && file.startsWith(staticDir)) {
			const stats = fs.statSync(file);
			if (stats.isFile()) {
				// res.setHeader('Content-Type', mimetype.lookup(path.extname(file)) || "");
				res.setHeader('Content-Length', stats.size);
				res.setHeader('Cache-Control', "public, max-age=3600");
				const stream = fs.createReadStream(file);
				stream.pipe(res);
				return;
			}
		}

		let response = await Router.resolve(fragments, request, url, {});
		if (response) {
			res.writeHead(response.status, Object.fromEntries(response.headers));
			res.end(await response.text());
			return;
		}

		res.writeHead(404);
		res.end('Not Found');
		return;
	} catch (e) {
		if (e instanceof Error) web("CRIT", e.stack || e.toString());
		else web("CRIT", String(e));

		res.writeHead(500);
		res.end(String(e));
		return;
	}
});

app.listen(process.env.HTTP_PORT, ()=> {
	console.info(`Listening on ${process.env.HTTP_PORT}`)
});

process.on('SIGTERM', () => {
	app.close();
});
process.on('SIGHUP', () => {
	app.close();
});