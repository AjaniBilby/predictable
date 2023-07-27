import * as elements from 'typed-html';

import { ErrorResponse, RenderArgs, Outlet } from "../../router/index";
import { client } from '../client';

export async function Render({params}: RenderArgs, outlet: Outlet) {
	const guild = await client.guilds.fetch(params.serv);
	if (!guild) throw new ErrorResponse(404, "Resource not found", `Unable to load server details from discord`);

	return <div>
		<h2>{guild.name}</h2>
		<div style={`background-image('${guild.bannerURL()}'); width: 100%; min-height: 50px;`}>

		</div>
		{await outlet()}
	</div>;
}