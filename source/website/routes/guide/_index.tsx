import * as html from '@kitajs/html';
import { RouteContext } from '~/router/router';

import { shell } from "~/website/routes/guide/$";

export async function loader({}: RouteContext) {

	return shell(<p>
		<i>Pick a guide from the above list</i>
	</p>);
}