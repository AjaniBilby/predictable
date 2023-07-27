import * as elements from 'typed-html';

import { ErrorResponse, RenderArgs, StyleCSS } from "htmx-router";
import { client } from '../client';
import { prisma } from '../../db';
import { GuildCard } from '../component/guild-card';

export async function Render({params}: RenderArgs) {
	const accounts = await prisma.account.findMany({
		where: { userID: params.user },
	});
	const account = accounts.find(x => x.guildID === params.serv);

	if (!account) throw new ErrorResponse(404, "Resource not found", `Unable to find account ${params.user}`);

	const guild = await client.guilds.fetch(account.guildID);
	if (!guild) throw new ErrorResponse(404, "Resource not found", `Unable to load server details from discord`);
	const member = await guild.members.fetch(account.userID);
	if (!member) throw new ErrorResponse(404, "Resource not found", `Unable to load user details from discord`);

	const wagers = await prisma.wager.findMany({
		where: { userID: params.user },
		include: {
			prediction: true,
			option: true
		},
		orderBy: [
			{ amount: "desc" }
		]
	});

	return <div>
		<div style={StyleCSS({
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			gap: "20px"
		})}>
			<div class="image" style={StyleCSS({
				backgroundImage: `url('${member.displayAvatarURL()}')`,
				backgroundPosition: "center",
				backgroundSize: "cover",
				backgroundColor: "#eee",

				borderRadius: "5px",
				aspectRatio: "1",
				width: "130px",
			})}></div>
			<div class="body">
				<div style={StyleCSS({
					fontWeight: "bold",
					textTransform: "capitalize",
					marginBottom: "5px"
				})}>
					{member.nickname || member.displayName}
				</div>
				<div>
					Balance{"$"+account.balance}
				</div>
			</div>
		</div>

		<h3>Active Wagers</h3>
		<div style={StyleCSS({
			display: "flex",
			flexDirection: "column",
			alignItems: "flex-start",
			gap: "5px"
		})}>
			{wagers.filter(x => x.prediction.status === "OPEN").map(wager =>
				<a href={`/server/${params.serv}/p/${wager.predictionID}`} style={StyleCSS({
					display: "flex",
					color: "white",
					fontWeight: "bold",
					borderRadius: "5px",
					overflow: "hidden"
				})}>
					<div style={StyleCSS({backgroundColor: "#ab9df2", padding: "3px 10px"})}>
						{wager.prediction.title}
					</div>
					<div style={StyleCSS({backgroundColor: "#78dce8", padding: "3px 10px"})}>
						{"$"+wager.amount}
					</div>
				</a>
			)}
		</div>

		<h3>Past Wagers</h3>
		<div style={StyleCSS({
			display: "flex",
			flexDirection: "column",
			alignItems: "flex-start",
			gap: "5px"
		})}>
			{wagers.filter(x => x.prediction.status !== "OPEN").map(wager =>
				<a href={`/server/${params.serv}/p/${wager.predictionID}`} style={StyleCSS({
					display: "flex",
					color: "white",
					fontWeight: "bold",
					borderRadius: "5px",
					overflow: "hidden"
				})}>
					<div style={StyleCSS({backgroundColor: "#ab9df2", padding: "3px 10px"})}>
						{wager.prediction.title}
					</div>
					<div style={StyleCSS({
						backgroundColor: wager.choice === wager.prediction.answer ? "#a9dc76" : "#ff6188",
						padding: "3px 10px"
					})}>
						{(wager.choice === wager.prediction.answer ? "+$" : "-$")+wager.amount}
					</div>
				</a>
			)}
		</div>

		<h3>Member of</h3>
		{await Promise.all(accounts.map(async a => {
			const guild = await client.guilds.fetch(a.guildID);
			return <a href={`/server/${a.guildID}`}>
				<GuildCard guild={guild} />
			</a>;
		}))}
	</div>;
}