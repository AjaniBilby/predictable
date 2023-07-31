import { RenderArgs, StyleCSS, Link } from "htmx-router";
import * as elements from 'typed-html';

import { client, fetchWrapper } from '../../bot/client';
import { prisma } from '../../db';


import { GuildCard } from '../component/guild-card';

export async function Render(rn: string, {res, setTitle}: RenderArgs) {
	res.setHeader('Cache-Control', "public, max-age=7200");

	const guilds = await prisma.guild.findMany({
		where: {
			hide: false
		},
		include: {
			accounts: {}
		}
	});

	setTitle("Server List");

	const data = [];
	for (const guild of guilds) {
		const discord = await fetchWrapper(client.guilds.fetch(guild.id));
		if (!discord) continue;

		data.push({guild, discord});
	}

	return <div id={rn}>
		<h1>Server List</h1>

		<div style={StyleCSS({
			display: 'flex',
			flexDirection: "row",
			flexWrap: "wrap",
			gap: "10px"
		})}>
			{data.map(x =>
				<Link to={`/server/${x.guild.id}`}>
					<GuildCard guild={x.guild} discord_guild={x.discord} />
				</Link>
			)}
		</div>
	</div>;
}