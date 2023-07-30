import { ErrorResponse, Link, RenderArgs } from "htmx-router";
import * as elements from 'typed-html';


export async function Render(rn: string, {setTitle, Outlet}: RenderArgs) {
	setTitle("Logs - Admin Panel");

	return <div id={rn}>
		<h2><Link to="/admin/logs" style="color: inherit">
			Logs
		</Link></h2>
		{await Outlet()}
	</div>;
}