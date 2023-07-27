import * as elements from 'typed-html';

import { Outlet, RenderArgs } from "../../router/index";

export async function Render({}: RenderArgs, outlet: Outlet) {
	return <p>Base {await outlet()}</p>;
}