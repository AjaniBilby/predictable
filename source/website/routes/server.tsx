import { RenderArgs } from "htmx-router";
import * as elements from 'typed-html';

export async function Render(rn: string, {res, Outlet}: RenderArgs) {
	res.setHeader('Cache-Control', "public, max-age=7200");

	return <div id={rn}>
		{await Outlet()}
	</div>;
}