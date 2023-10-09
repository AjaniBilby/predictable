import { ErrorResponse, RenderArgs, Link } from "htmx-router";
import * as html from '@kitajs/html';

import { GetGuild, GetGuildOrThrow, GetMemberOrThrow } from "../shared/discord";
import { GuildCard } from '../component/guild-card';
import { prisma } from '../../db';
import { isPayable } from "../../prediction-state";


function isNotNull<T>(value: T | null): value is T {
	return value !== null;
}


export async function Render(rn: string, {params, shared, setTitle, addMeta}: RenderArgs) {
	const accounts = await prisma.account.findMany({
		where: { userID: params.user },
	});
	const account = accounts.find(x => x.guildID === params.serv);

	if (!account) throw new ErrorResponse(404, "Resource not found", `Unable to find account ${params.user}`);

	const member = await GetMemberOrThrow(params.serv, params.user, shared);
	const guild  = await GetGuildOrThrow(params.serv, shared);

	const wagers = (await prisma.wager.findMany({
		where: {
			userID: params.user,
			prediction: { guildID: params.serv }
		},
		include: {
			prediction: true,
			option: true
		},
		orderBy: [
			{ payout: "desc" },
			{ amount: "desc" },
			{ prediction: { updatedAt: "desc" } },
		]
	}));
	const openWagers = wagers.filter(x => isPayable(x.prediction.status));

	setTitle(`${member.nickname || member.displayName} - ${guild.name}`);

	const assets = openWagers.reduce((s, x) => x.amount+s, 0);
	const bets = wagers.reduce((s, x) => x.amount+s, 0);

	addMeta([
		{ property: "og:title", content: `${member.nickname || member.displayName} - ${guild.name}` },
		{ property: "og:image", content: member.displayAvatarURL() },
		{
			property: "og:description",
			content: `Balance: ${account.balance}`
		}
	], true);

	const servers = (await Promise.all(accounts.map(async account => await GetGuild(account.guildID, shared))))
		.filter(isNotNull)
		.sort((a, b) => {
			return a.name.localeCompare(b.name);
		});

	return <div id={rn}>
		<div style={{
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			gap: "20px"
		}}>
			<div class="image" style={{
				backgroundImage: `url('${member.displayAvatarURL()}')`,
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
					{member.nickname || member.displayName}
				</div>
				<div style={{
					display: "grid",
					gridTemplateColumns: "auto auto auto",
					gap: "5px 10px",
					margin: "0px 0px 0px 10px"
				}}>
					<div>Liquid</div>
					<div>$</div>
					<div style='text-align: right;'>{account.balance}</div>
					<div>Betting</div>
					<div>$</div>
					<div style='text-align: right;'>{assets}</div>
					<div>Net</div>
					<div>$</div>
					<div style='text-align: right;'>{account.balance + assets}</div>

					<div style='grid-column: span 3; height: 0.5em'></div>
					<div>All time bets</div>
					<div>$</div>
					<div style='text-align: right;'>{bets}</div>
				</div>
			</div>
		</div>

		<h3>Active Wagers</h3>
		<div style={{
			display: "flex",
			flexWrap: "wrap",
			flexDirection: "row",
			alignItems: "flex-start",
			gap: "5px"
		}}>
			{openWagers.map(wager =>
				<Link to={`/server/${params.serv}/p/${wager.predictionID}`} style={{
					display: "flex",
					borderRadius: "5px",
					fontWeight: "bold",
					overflow: "hidden"
				}}>
					<div style={{padding: "5px 10px", boxShadow: "inset 0px 0px 5px 0px #0003", color: "var(--text-color)"}}>
						{wager.prediction.title}
					</div>
					<div style={{
						display: "flex",
						alignItems: "center",
						padding: "3px 10px",
						backgroundColor: "#78dce8",
						color: "white"
					}}>
						<div>{"$"+wager.amount}</div>
					</div>
				</Link>
			)}
		</div>

		<h3>Past Wagers</h3>
		<div style={{
			display: "flex",
			flexWrap: "wrap",
			flexDirection: "row",
			alignItems: "flex-start",
			gap: "5px"
		}}>
			{wagers.filter(x => !isPayable(x.prediction.status)).map(wager => {
				const delta = wager.payout - wager.amount;

				return <Link to={`/server/${params.serv}/p/${wager.predictionID}`} style={{
					display: "flex",
					borderRadius: "5px",
					fontWeight: "bold",
					overflow: "hidden",
					fontSize: "0.8em"
				}}>
					<div style={{padding: "5px 10px", boxShadow: "inset 0px 0px 5px 0px #0003", color: "var(--text-color)"}}>
						{wager.prediction.title}
						<hr style={{height: "1px", margin: "3px 0px", borderWidth: "0px", backgroundColor: "var(--text-color)", opacity: "20%"}} />
						<div style={{marginLeft: "10px", fontWeight: "200", fontStyle: "italic", fontSize: "0.8em"}}>
							{wager.option.text}
						</div>
					</div>
					<div style={{
						display: "flex",
						alignItems: "center",
						padding: "3px 10px",
						color: "white",
						fontSize: "1.2em",
						backgroundColor: wager.choice === wager.prediction.answer ? "#a9dc76" : "#ff6188",
					}}>
						{(delta >= 0 ? "+$" : "-$")+Math.abs(delta).toString()}
					</div>
				</Link>
			})}
		</div>

		<h3>Member of</h3>
		<div style={{
			display: "flex",
			flexWrap: "wrap",
			flexDirection: "row",
			alignItems: "center",
			gap: "5px"
		}}>
			{servers.map(server => <Link to={`/server/${typeof(server) === "string" ? server : server.id}`}>
				<GuildCard discord_guild={typeof(server) === "string" ? null : server} />
			</Link>)}
		</div>

	</div>;
}