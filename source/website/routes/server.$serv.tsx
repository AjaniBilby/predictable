import * as elements from 'typed-html';
import { RenderArgs, Link, StyleCSS } from "htmx-router";

import { GetGuildOrThrow } from '../shared/discord';

export async function Render(rn: string, {params, shared, setTitle, addMeta, Outlet}: RenderArgs) {
	const guild = await GetGuildOrThrow(params.serv, shared);

	setTitle(guild.name);
	const banner = guild.bannerURL() || "";

	addMeta([
		{ property: "og:title", content: `${guild.name} - Predictions` },
		{ property: "og:image", content: banner }
	], true);

	return <div id={rn}>

		<Link style="color: inherit" to={`/server/${guild.id}`}>
			{ banner &&
				<div style={StyleCSS({
					backgroundImage: `url('${banner}')`,
					backgroundPosition: "center",
					backgroundSize: "cover",
					margin: "0px -50px",
					height: "100px"
				})}></div>
			}
			<h1>{guild.name}</h1>
		</Link>
		{await Outlet()}
	</div>;
}