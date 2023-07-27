import * as elements from 'typed-html';

import { Outlet } from "htmx-router";

export async function Render(_: any, outlet: Outlet) {
	return <p>Child {await outlet()}</p>;
}