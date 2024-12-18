
import { GuildCard } from "~/component/guild-card";

import { GetGuild, GetGuildOrThrow, GetMemberOrThrow } from "~/helper/discord";
import { RouteContext } from "htmx-router";
import { isPayable } from "~/prediction-state";
import { prisma } from "~/db";

import { shell } from "~/routes/server/$serv/$";

export const parameters = {
	serv: String,
	user: String
}


function isNotNull<T>(value: T | null): value is T {
	return value !== null;
}


export async function loader({ params }: RouteContext<typeof parameters>) {
	const accounts = await prisma.account.findMany({
		where: { userID: params.user, guildID: params.serv },
	});
	const account = accounts.find(x => x.guildID === params.serv);
	if (!account) return null;

	const member = await GetMemberOrThrow(params.serv, params.user);
	const guild  = await GetGuildOrThrow(params.serv);

	const wagers = (await prisma.wager.findMany({
		where: {
			userID: params.user,
			prediction: { guildID: params.serv }
		},
		include: {
			prediction: {
				include: {
					options: { where: { correct: true} }
				}
			},
			option: true
		},
		orderBy: [
			{ payout: "desc" },
			{ amount: "desc" },
			{ prediction: { updatedAt: "desc" } },
		]
	}));
	const openWagers = wagers.filter(x => isPayable(x.prediction.status));

	const assets = openWagers.reduce((s, x) => x.amount+s, 0);
	const bets = wagers.reduce((s, x) => x.amount+s, 0);

	// TODO: Meta properties
	// addMeta([
	// 	{ property: "og:title", content: `${member.nickname || member.displayName} - ${guild.name}` },
	// 	{ property: "og:image", content: member.displayAvatarURL() },
	// 	{
	// 		property: "og:description",
	// 		content: `Balance: ${account.balance}`
	// 	}
	// ], true);

	const servers = (await Promise.all(accounts.map(async account => await GetGuild(account.guildID))))
		.filter(isNotNull)
		.sort((a, b) => {
			return a.name.localeCompare(b.name);
		});

	return shell(<div style="display: contents;">
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

				borderRadius: "var(--radius)",
				aspectRatio: "1",
				width: "130px",
			}}></div>
			<div class="body">
				<div style={{
					fontWeight: "bold",
					textTransform: "capitalize",
					marginBottom: "5px"
				}} safe>{member.nickname || member.displayName}</div>

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
				<a href={`/server/${params.serv}/p/${wager.predictionID}`} style={{
					display: "flex",
					borderRadius: "var(--radius)",
					fontWeight: "bold",
					overflow: "hidden",
					textDecoration: "none"
				}}>
					<div style={{padding: "5px 10px", boxShadow: "inset 0px 0px 5px 0px #0003", color: "hsl(var(--foreground))"}} safe>
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
				</a>
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

				return <a href={`/server/${params.serv}/p/${wager.predictionID}`} style={{
					display: "flex",
					borderRadius: "var(--radius)",
					fontWeight: "bold",
					overflow: "hidden",
					fontSize: "0.8em",
					textDecoration: "none"
				}}>
					<div style={{padding: "5px 10px", boxShadow: "inset 0px 0px 5px 0px #0003", color: "hsl(var(--foreground))"}}>
						<div safe>{wager.prediction.title}</div>
						<hr style={{height: "1px", margin: "3px 0px", borderWidth: "0px", backgroundColor: "hsl(var(--foreground))", opacity: "20%"}} />
						<div style={{marginLeft: "10px", fontWeight: "200", fontStyle: "italic", fontSize: "0.8em"}} safe>
							{wager.option.text}
						</div>
					</div>
					<div style={{
						display: "flex",
						alignItems: "center",
						padding: "3px 10px",
						color: "white",
						fontSize: "1.2em",
						backgroundColor: wager.prediction.options.some(x => x.index == wager.choice) ? "#a9dc76" : "#ff6188",
					}} safe>
						{(delta >= 0 ? "+$" : "-$")+Math.abs(delta).toString()}
					</div>
				</a>
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
			{servers.map(server => <a href={`/server/${typeof(server) === "string" ? server : server.id}`} style={{ textDecoration: "none" }}>
				<GuildCard discord_guild={typeof(server) === "string" ? null : server} />
			</a>)}
		</div>
	</div>, guild, { title: `${member.nickname || member.displayName} - ${guild.name}` });
}