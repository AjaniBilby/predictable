import * as elements from 'typed-html';

import { Outlet } from "../../router/index";

export async function Render(_: any, outlet: Outlet) {
	return <p>Child {await outlet()}</p>;
}