import html from '@kitajs/html';
import { RenderArgs, Link } from "htmx-router";

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
				<div style={{
					backgroundImage: `url('${banner}')`,
					backgroundPosition: "center",
					backgroundSize: "cover",
					margin: "-10px -50px 0px -50px",
					height: "150px"
				}}></div>
			}
			<h1>{guild.name}</h1>
		</Link>
		{await Outlet()}
	</div>;
}