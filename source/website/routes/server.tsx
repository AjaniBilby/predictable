import { Link, RenderArgs } from "htmx-router";
import * as elements from 'typed-html';

export async function Render(rn: string, {res, Outlet}: RenderArgs) {
	res.setHeader('Cache-Control', "public, max-age=7200");

	const inner = await Outlet();

	return <div id={rn}>
		<Link to="/server">Server List</Link>
		{inner}
	</div>;
}