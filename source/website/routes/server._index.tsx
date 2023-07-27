import * as elements from 'typed-html';

import { Outlet } from "../../router/index";

export function Render(_: any, outlet: Outlet) {
	return <div>
		<h1>Server List</h1>
		{outlet()}
	</div>;
}