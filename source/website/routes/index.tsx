import * as elements from 'typed-html';

import { Outlet, RenderArgs } from "../../router/index";

export function Render({}: RenderArgs, outlet: Outlet) {
	return <p>Base {outlet()}</p>;
}