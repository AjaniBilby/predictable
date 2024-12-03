import express from 'express';

const port = process.env.PORT || 5173;
const app = express();

const viteDevServer =
	process.env.NODE_ENV === "production"
		? null
		: await import("vite").then((vite) =>
				vite.createServer({
					server: { middlewareMode: true },
					appType: 'custom'
				})
			);

app.use(
	viteDevServer
		? viteDevServer.middlewares
		: express.static("./dist/client")
);


// Route Rendering
function Render(res) {
	const headers = new Headers();
	headers.set("Content-Type", "text/html; charset=UTF-8");
	return new Response("<!DOCTYPE html>"+String(res), { headers });
}

const build = viteDevServer
	? () => viteDevServer.ssrLoadModule('./source/entry-server.ts')
	: import('./dist/server/entry-server.js');

app.use('*', async (req, res) => {
	try {
		const mod = typeof build === "function" ? await build() : await build;

		let response = await mod.Resolve(req, Render);

		res.writeHead(response.status, Object.fromEntries(response.headers));
		let rendered = await response.text();

		if (viteDevServer && response.headers.get("Content-Type")?.startsWith("text/html")) {
			rendered = await viteDevServer.transformIndexHtml(req.url, rendered);
		}

		res.end(rendered);
	} catch (e) {
		viteDevServer?.ssrFixStacktrace(e)
		console.log(e.stack)
		res.status(500).end(e.stack)
	}
})





// Start http server
app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`)
})


 // Reload pages on file change
if (viteDevServer)
	viteDevServer.watcher.on('change', (file) => {
	console.log(`File changed: ${file}`);

	console.log('Triggering full page reload');
	viteDevServer.ws.send({ type: 'full-reload' });
});