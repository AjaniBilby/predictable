import * as elements from 'typed-html';

import { RenderArgs } from "htmx-router";
import { version } from '../../version';

export async function Render({}: RenderArgs) {
	return <p>Version {version}</p>;
}