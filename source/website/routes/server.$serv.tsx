import * as elements from 'typed-html';
import { RenderArgs, Link, StyleCSS } from "htmx-router";

import { GetGuildOrThrow } from '../shared/discord';

export async function Render(rn: string, {params, shared, setTitle, Outlet}: RenderArgs) {
	const guild = await GetGuildOrThrow(params.serv, shared);

	setTitle(guild.name);
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
		{await Outlet()}
	</div>;
}