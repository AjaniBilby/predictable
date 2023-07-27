import * as elements from 'typed-html';

import { Outlet } from "../../router/index";

export function Render(_: any, outlet: Outlet) {
	return <p>Base {outlet()}</p>;
}