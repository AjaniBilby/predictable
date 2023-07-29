import type { IncomingMessage } from "node:http";
import * as cookie from "cookie";

export function GetCookies(req: IncomingMessage, shared: any): Record<string, string> {
	if (shared.cookie) return shared.cookie;

	shared.cookies = cookie.parse(req.headers.cookie || "");
	return shared.cookies;
}