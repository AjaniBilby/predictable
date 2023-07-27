import * as elements from 'typed-html';

import { RenderArgs } from "htmx-router";
import { version } from '../../version';

export async function Render({res}: RenderArgs) {
	res.setHeader('Cache-Control', "no-cache");

	return <p>Version {version}</p>;
}