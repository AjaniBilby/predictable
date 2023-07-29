import * as cookie from "cookie";

import { Override, RenderArgs} from "htmx-router";

export async function Render(rn: string, {req, res}: RenderArgs) {
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