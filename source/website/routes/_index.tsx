import * as elements from 'typed-html';

import { RenderArgs } from "htmx-router";

export async function Render({res}: RenderArgs) {
	res.setHeader('Cache-Control', "public, 7200");

	return <div>
		<a href="/server">Server List</a>
	</div>;
}