import * as dotenv from "dotenv";
import http from "node:http";
dotenv.config();


import { Router } from "./router";
import { client } from "./client";



const app = http.createServer(async (req, res) => {
	const url = new URL(req.url || "/", "http://localhost");

	if (url.pathname.length != 1 && url.pathname.endsWith("/")) {
		const newPath = url.pathname.slice(0, -1) + url.search;
		res.statusCode = 302;
		res.setHeader('Location', newPath);
		return res.end();
	}

	const out = await Router.render(req, res, url);
	res.setHeader('Content-Type', 'html');
	res.end(out);
	return;
});


app.listen(process.env.HTTP_PORT, ()=> {
	console.log(`Listening on ${process.env.HTTP_PORT}`)
});

process.on('SIGTERM', () => {
	app.close();
})