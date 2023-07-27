import * as elements from 'typed-html';

import { Outlet, RenderArgs } from "htmx-router";

export async function Render({}: RenderArgs, outlet: Outlet) {
	return <p>Base {await outlet()}</p>;
}