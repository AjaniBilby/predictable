import { RenderArgs, Link } from "htmx-router";
import * as html from '@kitajs/html';

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
			accounts: true
		}
	});
	guilds.sort((a, b) => b.accounts.length - a.accounts.length );

	setTitle("Server List");

	const data = [];
	for (const guild of guilds) {
		const discord = await fetchWrapper(client.guilds.fetch(guild.id));
		if (!discord) continue;

		data.push({guild, discord});
	}

	return <div id={rn}>
		<h1>Servers using Predictable</h1>

		<div style={{
			display: 'flex',
			flexDirection: "row",
			alignItems: "center",
			flexWrap: "wrap",
			gap: "10px"
		}}>
			{data.map(x =>
				<Link to={`/server/${x.guild.id}`}>
					<GuildCard guild={x.guild} discord_guild={x.discord} />
				</Link>
			)}
		</div>

		<p style={{
			textAlign: "center",
			marginTop: "40px",
			fontSize: "0.6em",
			color: "grey",
		}}>
			If your server wishes to be taken off this list you can
		</p>
	</div>;
}