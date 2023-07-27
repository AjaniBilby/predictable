import * as elements from 'typed-html';

import { ErrorResponse, RenderArgs, Outlet, StyleCSS } from "htmx-router";
import { client } from '../client';

export async function Render({params}: RenderArgs, outlet: Outlet) {
	const guild = await client.guilds.fetch(params.serv);
	if (!guild) throw new ErrorResponse(404, "Resource not found", `Unable to load server details from discord`);

	return <div>
		<h1><a style="color: inherit" href={`/server/${guild.id}`}>
		{guild.name}
		</a></h1>

		<div style={StyleCSS({
			backgroundImage: `url('${guild.bannerURL() || ""}')`,
			width: "100%",
			height: "50px"
		})}>

		</div>
		{await outlet()}
	</div>;
}