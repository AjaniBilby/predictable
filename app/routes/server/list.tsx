import { client, fetchWrapper } from "~/bot/client";
import { prisma } from "~/db";

import { FullGuild, GuildCard } from "~/component/guild-card";

import { shell } from "~/routes/$";

export async function loader() {
	const guilds = await prisma.$queryRaw<FullGuild[]>`
		SELECT g.*, SUM(a."balance") as "balance", COUNT(a."userID") as "accounts"
		FROM "Guild" g
		INNER JOIN "Account" a ON g."id" = a."guildID"
		GROUP BY g."id"
		ORDER BY "accounts" desc;
	`;

	const data = (await Promise.all(guilds.map(async (guild) => {
		const discord = await fetchWrapper(client.guilds.fetch(guild.id));
		return { guild, discord }
	}))).filter(x => x.discord !== null);

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