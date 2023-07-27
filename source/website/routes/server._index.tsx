import * as elements from 'typed-html';

import { RenderArgs, StyleCSS } from "htmx-router";
import { prisma } from '../../db';
import { client } from '../client';
import { GuildCard } from '../component/guild-card';

export async function Render({}: RenderArgs) {
	const guilds = await prisma.guild.findMany({
		where: {},
		include: {
			accounts: {}
		}
	});

	return <div>
		<h1>Server List</h1>

		<div style={StyleCSS({
			display: 'flex',
			flexDirection: "row",
			flexWrap: "wrap"
		})}>
			{await Promise.all(guilds.map(async g => {
				const guild = await client.guilds.fetch(g.id);
				return <a href={`/server/${g.id}`}>
					<GuildCard guild={guild} g={g} />
				</a>;
			}))}
		</div>
	</div>;
}