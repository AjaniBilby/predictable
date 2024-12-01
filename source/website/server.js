import fs from 'node:fs/promises'
import express from 'express'

// Constants
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;

// Cached production assets
const templateHtml = isProduction
	? await fs.readFile('./dist/client/index.html', 'utf-8')
	: ''

// Create http server
const app = express()

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite
if (!isProduction) {
	const { createServer } = await import('vite')
	vite = await createServer({
		server: { middlewareMode: true },
		appType: 'custom'
	})
	app.use(vite.middlewares)
} else {
	const sirv = (await import('sirv')).default
	app.use(base, sirv('./dist/client', { extensions: [] }))
}

// Serve HTML
app.use('*', async (req, res) => {
	try {
		const ctrl = new AbortController();
		const headers = new Headers(req.headers);
		const url = new URL(`http://${headers.get('host')}${req.originalUrl}`);

		req.once('aborted', () => ctrl.abort())

		const bodied = req.method !== "GET" && req.method !== "HEAD";
		const request = new Request(url, {
			headers,
			method: req.method,
			body: bodied ? req : undefined,
			signal: ctrl.signal,
			referrer: headers.get("referrer") || undefined,
			// @ts-expect-error
			duplex: bodied ? 'half' : undefined,
		});

		const x = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
		const fragments = x.split("/").slice(1);

		let router = isProduction
			? (await import('./dist/server/entry-server.js')).render
			: (await vite.ssrLoadModule('/source/website/router.ts')).Router;

		let response = await router.resolve(fragments, request, url, {});
		if (!response) {
			res.writeHead(404);
			res.end('Not Found');
			return;
		}

		res.writeHead(response.status, Object.fromEntries(response.headers));
		let rendered = await response.text();

		if (!isProduction && response.headers.get("Content-Type") === "text/html") {
			rendered = await vite.transformIndexHtml(req.url, rendered);
		}

		res.end(rendered);
	} catch (e) {
		vite?.ssrFixStacktrace(e)
		console.log(e.stack)
		res.status(500).end(e.stack)
	}
})

// Start http server
app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`)
})
