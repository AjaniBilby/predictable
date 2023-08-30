/// <reference path="../../declarations.d.ts" />

import * as mimetype from "mimetype";
import * as dotenv from "dotenv";
import http from "node:http";
dotenv.config();

import * as fs from 'node:fs';
import * as path from 'node:path';

import { Router } from "./router";
import { Override, Redirect } from "htmx-router";
import { bot } from "../logging";

const staticDir = path.join(__dirname,
	process.argv[0].includes("ts-node") ? '../../public' : "../public"
);


const app = http.createServer(async (req, res) => {
	let url: URL | null = null;
	try {
		url = new URL(req.url || "/", "http://localhost");
	} catch (e) {}

	if (url === null) {
		res.statusCode = 418;
		res.end("I'm a teapot");
		console.log(`teapot-ted: ${req.url}`);
		return;
	}

	const file = path.join(staticDir, url.pathname);

	// Check file is valid and not escaped dir ../../
	if (fs.existsSync(file) && file.startsWith(staticDir)) {
		const stats = fs.statSync(file);
		if (stats.isFile()) {
			res.setHeader('Content-Type', mimetype.lookup(path.extname(file)) || "");
			res.setHeader('Content-Length', stats.size);
			res.setHeader('Cache-Control', "public, max-age=3600");
			const stream = fs.createReadStream(file);
			stream.pipe(res);
			return;
		}
	}

	try {
		const out = await Router.render(req, res, url);
		if (out instanceof Redirect) {
			res.statusCode = 302;
			res.setHeader('Location', out.location);
			return res.end();
		} else if (out instanceof Override) {
			res.end(out.data);
		} else {
			const target = res.getHeader('HX-Retarget')?.toString() || "";
			if (target && res.statusCode !== 200) {
				res.statusCode = 200;
			}

			res.setHeader('Content-Type', 'text/html; charset=UTF-8');
			res.end("<!DOCTYPE html>"+out);
		}
	} catch(e: any) {
		bot("CRIT", e.stack || e.toString());
		res.statusCode = 500;
		res.end(e.stack || e.toString());
	}
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