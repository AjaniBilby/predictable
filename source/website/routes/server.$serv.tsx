import * as elements from 'typed-html';
import { ErrorResponse, RenderArgs, Outlet, StyleCSS } from "htmx-router";

import { client, fetchWrapper } from '../../bot/client';
import { Link } from '../component/link';

export async function Render(rn: string, {params}: RenderArgs, outlet: Outlet) {
	const guild = await fetchWrapper(client.guilds.fetch(params.serv));
	if (!guild) throw new ErrorResponse(404, "Resource not found", `Unable to load server details from discord`);

	const banner = guild.bannerURL() || "";

	return <div id={rn}>

		<Link style="color: inherit" to={`/server/${guild.id}`}>
			{ banner &&
				<div style={StyleCSS({
					backgroundImage: `url('${banner}')`,
					width: "100%",
					height: "50px"
				})}></div>
			}
			<h1>{guild.name}</h1>
		</Link>
		{await outlet()}
	</div>;
}