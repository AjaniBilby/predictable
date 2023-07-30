import { RenderArgs, Link } from "htmx-router";
import * as elements from 'typed-html';


export async function Render(rn: string, {}: RenderArgs) {
	return <ul id={rn}>
		<li><Link to="/admin/logs/website">Website</Link></li>
		<li><Link to="/admin/logs/bot">Bot</Link></li>
	</ul>;
}