import * as elements from 'typed-html';

import { ErrorResponse, RenderArgs, Outlet, StyleCSS } from "htmx-router";
import { client } from '../client';

export async function Render({params}: RenderArgs, outlet: Outlet) {
	const guild = await client.guilds.fetch(params.serv);
	if (!guild) throw new ErrorResponse(404, "Resource not found", `Unable to load server details from discord`);

	const banner = guild.bannerURL() || "";

	return <div>

		<a style="color: inherit" href={`/server/${guild.id}`}>
			{ banner &&
				<div style={StyleCSS({
					backgroundImage: `url('${banner}')`,
					width: "100%",
					height: "50px"
				})}></div>
			}
			<h1>{guild.name}</h1>
		</a>
		{await outlet()}
	</div>;
}