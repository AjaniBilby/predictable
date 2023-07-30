import { RenderArgs, Link } from "htmx-router";
import * as elements from 'typed-html';


export async function Render(rn: string, {}: RenderArgs) {
	return <div id={rn}>
		<Link to="/admin/logs">View Logs</Link>
	</div>;
}