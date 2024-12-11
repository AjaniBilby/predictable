import { client, fetchWrapper } from "~/bot/client";
import { prisma } from "~/db";


import { GuildCard } from "~/website/component/guild-card";

import { shell } from "~/website/routes/$";

export async function loader() {
	const guilds = await prisma.guild.findMany({
		where: {
			hide: false
		},
		include: {
			accounts: true
		}
	});
	guilds.sort((a, b) => b.accounts.length - a.accounts.length );

	const data = [];
	for (const guild of guilds) {
		const discord = await fetchWrapper(client.guilds.fetch(guild.id));
		if (!discord) continue;

		data.push({guild, discord});
	}

	return shell(<div>
		<h1>Servers using Predictable</h1>

		<div style={{
			display: 'flex',
			flexDirection: "row",
			alignItems: "center",
			flexWrap: "wrap",
			gap: "10px"
		}}>
			{data.map(x =>
				<a href={`/server/${x.guild.id}`} style={{ textDecoration: "none" }}>
					<GuildCard guild={x.guild} discord_guild={x.discord} />
				</a>
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
	</div>, { title: "Server List" });
}