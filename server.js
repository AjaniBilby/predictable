import 'dotenv/config';
import { createRequestHandler } from 'htmx-router';
import { readFile } from "fs/promises";
import express from 'express';
import morgan from "morgan";

export const version = JSON.parse(await readFile("./package.json", "utf8")).version;

console.log(`Starting v${version} in ${process.env.NODE_ENV || "dev"} mode`);

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

if (viteDevServer) {
	app.use(viteDevServer.middlewares)
} else {
	app.use(express.static("./dist/client"));
	app.use("/dist/asset", express.static("./dist/server/dist/asset",));
}

app.use(morgan("tiny"));

const build = viteDevServer
	? () => viteDevServer.ssrLoadModule('./app/entry.server.ts')
	: await import('./dist/server/entry.server.js');

app.use('*', createRequestHandler.http({
	build, viteDevServer,
	render: (res, headers) => {
		if (!headers.has("Cache-Control")) headers.set("Cache-Control", "public, max-age=3600");
		headers.set("Content-Type", "text/html; charset=UTF-8");

		return String(res);
	}
}));

// Start http server
app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`);
})

 // Reload pages on file change
if (viteDevServer)
	viteDevServer.watcher.on('change', (file) => {
	console.log(`File changed: ${file}`);

	console.log('Triggering full page reload');
	viteDevServer.ws.send({ type: 'full-reload' });
});

const shutdown = () => {
	console.log("Shutting down server...");

	// Close the server gracefully
	app.close((err) => {
		if (err) {
			console.error("Error during server shutdown:", err);
			process.exit(1);
		}
		console.log("Server shut down gracefully.");
		process.exit(0);
	});
};

process.on('SIGTERM', shutdown);
process.on('SIGHUP', shutdown);


process .on('unhandledRejection', (reason, p) => {
	console.error(reason, 'Unhandled Rejection at Promise', p);
})
.on('uncaughtException', err => {
	console.error(err, 'Uncaught Exception thrown');
	process.exit(1);
});