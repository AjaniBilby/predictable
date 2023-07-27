import * as elements from 'typed-html';

import { Outlet, RenderArgs } from "../../router/index";

export function Render({params}: RenderArgs, outlet: Outlet) {
	return <div>
		Index
	</div>;
}