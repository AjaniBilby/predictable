import { RenderArgs, Outlet } from "htmx-router";
import * as elements from 'typed-html';

export async function Render(rn: string, {res}: RenderArgs, outlet: Outlet) {
	res.setHeader('Cache-Control', "public, max-age=7200");

	return <div id={rn}>
		Server Route
		{await outlet()}
	</div>;
}