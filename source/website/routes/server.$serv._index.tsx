import * as elements from 'typed-html';

import { Outlet, RenderArgs } from "../../router/index";
import { prisma } from '../../db';

export async function Render({params}: RenderArgs, outlet: Outlet) {
	return <div>
		Index
	</div>;
}