import * as elements from 'typed-html';

import { Outlet, RenderArgs } from "../../router/index";

export function Render({}: RenderArgs, outlet: Outlet) {
	return <div>
		<h1>Server List</h1>
		{outlet()}
	</div>;
}