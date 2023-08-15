import { RenderArgs } from "htmx-router";
import html from '@kitajs/html';

export async function Render(rn: string, {res, Outlet}: RenderArgs) {
	res.setHeader('Cache-Control', "public, max-age=7200");

	return <div id={rn}>{await Outlet()}</div>;
}