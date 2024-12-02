import express from 'express';

// Constants
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;

// Create http server
const app = express();

function Render(res) {
	const headers = new Headers();
	headers.set("Content-Type", "text/html; charset=UTF-8");
	return new Response("<!DOCTYPE html>"+String(res), { headers });
}

// Add Vite or respective production middlewares
let vite
if (!isProduction) {
	const { createServer } = await import('vite')
	vite = await createServer({
		server: { middlewareMode: true },
		appType: 'custom'
	})
	app.use(vite.middlewares);

	// Listen for file changes
  vite.watcher.on('change', (file) => {
		console.log(`File changed: ${file}`);

		console.log('Triggering full page reload');
		vite.ws.send({ type: 'full-reload' });
  });
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

		let build = isProduction
			? (await import('/source/website/router.ts'))
			: (await vite.ssrLoadModule('/source/website/router.ts'));

		let response = await build.Resolve(request, url, Render);

		res.writeHead(response.status, Object.fromEntries(response.headers));
		let rendered = await response.text();

		if (!isProduction && response.headers.get("Content-Type")?.startsWith("text/html")) {
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
