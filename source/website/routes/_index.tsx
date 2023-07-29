import { RenderArgs, Link } from "htmx-router";
import * as elements from 'typed-html';


export async function Render(rn: string, {res, setTitle}: RenderArgs) {
	setTitle("Home - Predictable");
	res.setHeader('Cache-Control', "public, max-age=7200");

	return <div id={rn}>
		<Link to="/server">Server List</Link>
	</div>;
}