import * as elements from 'typed-html';

import { RenderArgs } from "htmx-router";
import { Link } from "../component/link";

export async function Render(rn: string, {res}: RenderArgs) {
	res.setHeader('Cache-Control', "public, max-age=7200");

	return <div id={rn}>
		<Link to="/server">Server List</Link>
	</div>;
}