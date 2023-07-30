import { ErrorResponse, RenderArgs, StyleCSS, Link } from "htmx-router";
import * as elements from 'typed-html';

import { client, fetchWrapper } from '../../bot/client';
import { prisma } from '../../db';

import { GuildCard } from '../component/guild-card';
import { GetGuild } from "../shared/discord";

export async function Render(rn: string, {params, res, shared}: RenderArgs) {
	res.setHeader('HX-Redirect', `/user/${params.user}`);

	const accounts = await prisma.account.findMany({
		where: { userID: params.user }
	});

	if (accounts.length < 1)
		throw new ErrorResponse(404, "Resource not found", `Unable to find account ${params.user}`);


	const user = await fetchWrapper(client.users.fetch(params.user));
	if (!user) throw new ErrorResponse(404, "Resource not found", `Unable to load user details from discord`);

	const servers = [];
	for (const account of accounts) {
		const guild = await GetGuild(account.guildID, shared);
		if (!guild) continue;

		servers.push(guild)
	}


	const wagers = (await prisma.wager.findMany({
		where: { userID: params.user },
		include: {
			prediction: true,
			option: true
		},
		orderBy: [
			{ amount: "desc" }
		]
	}));

	const liquid = accounts.reduce((s, x) => x.balance+s, 0);
	const bets = wagers
		.reduce((s, x) => x.amount+s, 0);
	const assets = wagers
		.filter(x => x.prediction.status === "OPEN")
		.reduce((s, x) => x.amount+s, 0);
	const net = liquid + assets;


	return <div id={rn}>
		<div style={StyleCSS({
			marginTop: "20px",

			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			gap: "20px"
		})}>
			<div class="image" style={StyleCSS({
				backgroundImage: `url('${user.displayAvatarURL()}')`,
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
					{user.username}
				</div>
				<div style={StyleCSS({
					display: "grid",
					gridTemplateColumns: "auto auto auto",
					gap: "5px 10px",
					margin: "0px 0px 0px 10px"
				})}>
					<div>Liquid</div>
					<div>$</div>
					<div style='text-align: right;'>{liquid}</div>
					<div>Betting</div>
					<div>$</div>
					<div style='text-align: right;'>{assets}</div>
					<div>Net</div>
					<div>$</div>
					<div style='text-align: right;'>{net}</div>

					<div style='grid-column: span 3; height: 0.5em'></div>
					<div>All time bets</div>
					<div>$</div>
					<div style='text-align: right;'>{bets}</div>
				</div>
			</div>
		</div>

		<h3>Member of</h3>
		{servers.map(s => {
			return <Link to={`/server/${s.id}/u/${params.user}`}>
				<GuildCard discord_guild={s} />
			</Link>;
		})}
	</div>;
}