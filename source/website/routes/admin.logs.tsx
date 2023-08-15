import { ErrorResponse, Link, RenderArgs } from "htmx-router";
import html from '@kitajs/html';


export async function Render(rn: string, {setTitle, Outlet}: RenderArgs) {
	setTitle("Logs - Admin Panel");

	return <div id={rn}>
		<h2><Link to="/admin/logs" style="color: inherit">
			Logs
		</Link></h2>
		{await Outlet()}
	</div>;
}