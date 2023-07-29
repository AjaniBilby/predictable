import { Override, RenderArgs } from "htmx-router";
import * as cookie from "cookie";

import { GetCookies } from "../shared/cookie";

export async function Render(rn: string, {req, res, shared}: RenderArgs) {
	res.setHeader('Cache-Control', "no-cache");
	res.setHeader('HX-Refresh', "true");
	const cookies = GetCookies(req, shared);

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