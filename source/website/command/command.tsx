import { RenderArgs, Link } from "htmx-router";
import * as html from '@kitajs/html';


export async function Render(rn: string, {Outlet, setTitle}: RenderArgs) {
	setTitle("Commands - Predictable Bot")

	return <div id={rn}>
		<h1><Link to="/command" style="color: inherit">Commands</Link></h1>
		{await Outlet()}
	</div>;
}