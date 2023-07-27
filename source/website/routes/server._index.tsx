import * as elements from 'typed-html';

import { RenderArgs } from "htmx-router";
import { prisma } from '../../db';
import { client } from '../client';

export async function Render({}: RenderArgs) {
	const guilds = await prisma.guild.findMany({
		where: {},
		include: {
			accounts: {}
		}
	});

	return <div>
		<h1>Server List</h1>

		{await Promise.all(guilds.map(async g => {
			const guild = await client.guilds.fetch(g.id);

			return <div>
				<a href={`/server/${g.id}`}>{guild.name}</a>
				{g.accounts.length}
				{g.accounts.reduce((x, s) => s.balance + x, 0)}
			</div>
		}))}
	</div>;
}