import { RenderArgs, StyleCSS, Link } from "htmx-router";
import * as elements from 'typed-html';

import { client, fetchWrapper } from '../../bot/client';
import { prisma } from '../../db';


import { GuildCard } from '../component/guild-card';

export async function Render(rn: string, {res, setTitle}: RenderArgs) {
	res.setHeader('Cache-Control', "public, max-age=7200");

	const guilds = await prisma.guild.findMany({
		where: {},
		include: {
			accounts: {}
		}
	});

	setTitle("Server List");

	return <div id={rn}>
		<h1>Server List</h1>

		<div style={StyleCSS({
			display: 'flex',
			flexDirection: "row",
			flexWrap: "wrap",
			gap: "10px"
		})}>
			{await Promise.all(guilds.map(async g => {
				const guild = await fetchWrapper(client.guilds.fetch(g.id));
				return <Link to={`/server/${g.id}`}>
					<GuildCard guild={guild} g={g} />
				</Link>;
			}))}
		</div>
	</div>;
}