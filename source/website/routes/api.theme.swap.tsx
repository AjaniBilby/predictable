import * as elements from 'typed-html';
import * as cookie from "cookie";

import { ErrorResponse, Override, RenderArgs, StyleCSS } from "htmx-router";
import { client, fetchWrapper } from '../../bot/client';
import { prisma } from '../../db';
import { GuildCard } from '../component/guild-card';

export async function Render({params, req, res}: RenderArgs) {
	const cookies = cookie.parse(req.headers.cookie || "");
	res.setHeader('Cache-Control', "no-cache");
	res.setHeader('HX-Refresh', "true");

	const settings = {
		maxAge: 60 * 60 * 24 * 7, // 1 week
		sameSite: true,
		path: "/",
	};
	res.setHeader('Set-Cookie', [
		cookie.serialize('dark', (cookies.dark !== "true").toString(), settings)
	]);

	throw new Override("refresh");
}