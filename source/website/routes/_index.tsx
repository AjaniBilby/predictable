import * as elements from 'typed-html';

import { Outlet } from "htmx-router";

export async function Render(_: any) {
	return <div>
		<a href="/server">Server List</a>
	</div>;
}