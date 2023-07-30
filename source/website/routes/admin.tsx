import { ErrorResponse, Link, RenderArgs } from "htmx-router";
import * as elements from 'typed-html';

export async function Auth({shared}: RenderArgs) {
	if (!shared.auth?.isAdmin) throw new ErrorResponse(401, 'Unauthorised', "Unauthorised Access");
	return;
}


export async function Render(rn: string, {setTitle, Outlet}: RenderArgs) {

	setTitle("Admin Panel");

	return <div id={rn}>
		<h1><Link to="/admin" style="color: inherit">
			Admin Panel
		</Link></h1>
		{await Outlet()}
	</div>;
}