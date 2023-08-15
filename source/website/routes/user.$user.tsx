import { ErrorResponse, RenderArgs, Link } from "htmx-router";
import html from '@kitajs/html';
import { Guild } from "discord.js";

import { GetGuild, GetUser } from "../shared/discord";
import { GuildCard } from '../component/guild-card';
import { prisma } from '../../db';
import { isPayable } from "../../prediction-state";

export async function Render(rn: string, {params, res, shared, addMeta}: RenderArgs) {
	res.setHeader('HX-Redirect', `/user/${params.user}`);

	const user = await prisma.user.findFirst({
		where: { id: params.user },
		include: {
			accounts: true
		}
	})
	if (!user) throw new ErrorResponse(404, "Resource not found", `Unable to find account ${params.user}`);


	const dUser = await GetUser(params.user, shared);
	if (!dUser) throw new ErrorResponse(404, "Resource not found", `Unable to load user details from discord`);

	const servers = (
		await Promise.all(user.accounts.map(async account => await GetGuild(account.guildID, shared) || account.guildID))
	).sort((a, b) => {
		if (typeof(a) === "string") return 1;
		if (typeof(b) === "string") return 1;

		return a.name.localeCompare(b.name);
	});


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

	const liquid = user.accounts.reduce((s, x) => x.balance+s, 0);
	const bets = wagers
		.reduce((s, x) => x.amount+s, 0);
	const assets = wagers
		.filter(x => isPayable(x.prediction.status))
		.reduce((s, x) => x.amount+s, 0);
	const net = liquid + assets;


	addMeta([
		{ property: "og:title", content: dUser.username },
		{ property: "og:image", content: dUser.displayAvatarURL() },
		{
			property: "og:description",
			content: "Profile"
		}
	], true);

	return <div id={rn}>
		<div style={{
			marginTop: "20px",

			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			gap: "20px"
		}}>
			<div class="image" style={{
				backgroundImage: `url('${dUser.displayAvatarURL()}')`,
				backgroundPosition: "center",
				backgroundSize: "cover",
				backgroundColor: "#eee",

				borderRadius: "5px",
				aspectRatio: "1",
				width: "130px",
			}}></div>
			<div class="body">
				<div style={{
					fontWeight: "bold",
					textTransform: "capitalize",
					marginBottom: "5px"
				}}>
					{dUser.username}
				</div>
				<div style={{
					display: "grid",
					gridTemplateColumns: "auto auto auto",
					gap: "5px 10px",
					margin: "0px 0px 0px 10px"
				}}>
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

		{ shared.auth && user.isAdmin ?
			<Link to="/admin" style="display: block; margin: 10px 0px;">
				Admin Panel
			</Link>
		: ""}

		<h3>Member of</h3>
		<div style={{
			display: "flex",
			flexWrap: "wrap",
			flexDirection: "row",
			alignItems: "center",
			gap: "5px"
		}}>
			{servers.map(s =>
				<Link to={`/server/${s instanceof Guild ? s.id : s}/u/${params.user}`}>
					<GuildCard discord_guild={s instanceof Guild ? s : null} />
				</Link>
			)}
		</div>
	</div>;
}