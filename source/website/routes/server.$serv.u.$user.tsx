import { ErrorResponse, RenderArgs, StyleCSS } from "htmx-router";
import * as elements from 'typed-html';

import { client, fetchWrapper } from '../../bot/client';
import { prisma } from '../../db';

import { GuildCard } from '../component/guild-card';
import { Link } from '../component/link';

export async function Render(rn: string, {params}: RenderArgs) {
	const accounts = await prisma.account.findMany({
		where: { userID: params.user },
	});
	const account = accounts.find(x => x.guildID === params.serv);

	if (!account) throw new ErrorResponse(404, "Resource not found", `Unable to find account ${params.user}`);

	const guild = await fetchWrapper(client.guilds.fetch(account.guildID));
	if (!guild) throw new ErrorResponse(404, "Resource not found", `Unable to load server details from discord`);
	const member = await fetchWrapper(guild.members.fetch(account.userID));
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

	return <div id={rn}>
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
			flexDirection: "row",
			alignItems: "flex-start",
			gap: "5px"
		})}>
			{wagers.filter(x => x.prediction.status === "OPEN").map(wager =>
				<Link to={`/server/${params.serv}/p/${wager.predictionID}`} style={StyleCSS({
					display: "flex",
					borderRadius: "5px",
					fontWeight: "bold",
					overflow: "hidden"
				})}>
					<div style={StyleCSS({padding: "5px 10px", boxShadow: "inset 0px 0px 5px 0px #0003", color: "var(--text-color)"})}>
						{wager.prediction.title}
					</div>
					<div style={StyleCSS({
						display: "flex",
						alignItems: "center",
						padding: "3px 10px",
						backgroundColor: "#78dce8",
						color: "white"
					})}>
						<div>{"$"+wager.amount}</div>
					</div>
				</Link>
			)}
		</div>

		<h3>Past Wagers</h3>
		<div style={StyleCSS({
			display: "flex",
			flexDirection: "row",
			alignItems: "flex-start",
			gap: "5px"
		})}>
			{wagers.filter(x => x.prediction.status !== "OPEN").map(wager =>
				<Link to={`/server/${params.serv}/p/${wager.predictionID}`} style={StyleCSS({
					display: "flex",
					borderRadius: "5px",
					fontWeight: "bold",
					overflow: "hidden",
					fontSize: "0.8em"
				})}>
					<div style={StyleCSS({padding: "5px 10px", boxShadow: "inset 0px 0px 5px 0px #0003", color: "var(--text-color)"})}>
						{wager.prediction.title}
						<hr style={StyleCSS({height: "1px", margin: "3px 0px", borderWidth: "0px", backgroundColor: "var(--text-color)", opacity: "20%"})} />
						<div style={StyleCSS({marginLeft: "10px", fontWeight: "200", fontStyle: "italic", fontSize: "0.8em"})}>
							{wager.option.text}
						</div>
					</div>
					<div style={StyleCSS({
						display: "flex",
						alignItems: "center",
						padding: "3px 10px",
						color: "white",
						fontSize: "1.2em",
						backgroundColor: wager.choice === wager.prediction.answer ? "#a9dc76" : "#ff6188",
					})}>
						{(wager.choice === wager.prediction.answer ? "+$" : "-$")+wager.amount}
					</div>
				</Link>
			)}
		</div>

		<h3>Member of</h3>
		{await Promise.all(accounts.map(async a => {
			const guild = await fetchWrapper(client.guilds.fetch(a.guildID));
			return <Link to={`/server/${a.guildID}`}>
				<GuildCard guild={guild} />
			</Link>;
		}))}
	</div>;
}