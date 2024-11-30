import * as dotenv from "dotenv";
import serveStatic from 'serve-static';
import http from "node:http";
import path from 'node:path';

dotenv.config();

import { Router } from "~/website/router";
import { web } from "~/logging";

const staticDir = path.join(__dirname,
	process.argv[0].includes("ts-node") ? '../../public' : "../public"
);

const staticServer = serveStatic(staticDir, {
	maxAge: '1h',
});

const app = http.createServer((req, res) => {
	staticServer(req, res, async (err) => {
		if (err) {
			res.writeHead(err.status || 500);
			res.end(err.message);
			return;
		}

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