import { ErrorResponse, RenderArgs, Link } from "htmx-router";
import * as html from '@kitajs/html';

import { prisma } from '../../db';

import { AccountCard } from '../component/account-card';
import { GetGuild, GetMember } from "../shared/discord";
import { isPayable } from "../../prediction-state";

export async function Render(rn: string, {params, shared, addMeta}: RenderArgs) {
	const data = await prisma.guild.findFirst({
		where: { id: params.serv },
		include: {
			predictions: {
				include: {
					options: true,
					wagers: true
				},
				orderBy: [
					{ updatedAt: "desc" }
				]
			},
			accounts: {
				orderBy: [
					{ balance: "desc" }
				],
				take: 6
			}
		}
	});

	if (!data) throw new ErrorResponse(404, "Resource not found", `Unable to load guild ${params.serv}`);

	const openWagers = data.predictions
		.filter(x => isPayable(x.status))
		.sort((a, b) => b.wagers.length - a.wagers.length);

	const liquid = data.accounts.reduce((s, x) => x.balance+s, 0);
	const bets   = data.predictions.reduce((s, x) => x.wagers.reduce((s, x) => x.amount+s, s), 0);
	const assets = openWagers.reduce((s, x) => x.wagers.reduce((s, x) => x.amount+s, s), 0);

	const guild = await GetGuild(params.serv, shared);
	const banner = guild?.bannerURL();
	const meta = [
		{ property: "og:title", content: guild?.name || "Unknown Guild" },
		{ property: "og:description", content:
			`Members : ${data.accounts.length}&nbsp;`+
			`Worth : \$${liquid + assets}&nbsp;`+
			`${openWagers.length} wagers currently taking place`
		}
	];
	if (banner) {
		meta.push({ property: "og:image", content: banner })
	}
	addMeta(meta, true);

	return <div id={rn}>
		<div style={{display: 'flex', flexDirection: "column", alignItems: "flex-start"}}>
			<h3>Statistics</h3>
			<div style={{display: "grid", gridTemplateColumns: "auto auto auto", gap: "5px 10px"}}>
				<div>Liquid</div>
				<div>$</div>
				<div style='text-align: right;'>{liquid}</div>
				<div>Betting</div>
				<div>$</div>
				<div style='text-align: right;'>{assets}</div>
				<div>Net</div>
				<div>$</div>
				<div style='text-align: right;'>{liquid + assets}</div>

				<div style='grid-column: span 3; height: 0.5em'></div>
				<div>All time bets</div>
				<div>$</div>
				<div style='text-align: right;'>{bets}</div>
			</div>
		</div>

		<h3>Open Predictions</h3>
		<div style={{
			display: "grid",
			gridTemplateColumns: "auto 1fr",
			gap: "5px 0px"
		}}>
			{openWagers.map(pred => <>
				<Link to={`/server/${params.serv}/p/${pred.id}`} style={{
					display: "flex",
					borderRadius: "5px 0 0 5px",
					fontWeight: "bold",
					overflow: "hidden",
					fontSize: "0.8em"
				}}>
					<div title="Total Bets" style={{
						display: "flex",
						alignItems: "center",
						padding: "3px 10px",
						color: "white",
						fontSize: "1.2em",
						backgroundColor: pred.status === "LOCKED" ? "var(--color-orange)" : "var(--color-blue)",
					}}>
						${pred.wagers.reduce((x, s) => s.amount + x, 0)}
					</div>
				</Link>
				<Link to={`/server/${params.serv}/p/${pred.id}`} style={{
					boxShadow: "inset 0px 0px 5px 0px #0003",
					borderRadius: "0 5px 5px 0",
					padding: "5px 10px",
					fontWeight: "bold",
					overflow: "hidden",
					color: "var(--text-color)",
					fontSize: "0.8em"
				}}>
					{pred.title}
					<hr style={{height: "1px", margin: "3px 0px", borderWidth: "0px", backgroundColor: "var(--text-color)", opacity: "20%"}} />
					<div style={{marginLeft: "10px", fontWeight: "200", fontStyle: "italic", fontSize: "0.8em"}}>
						Bets: {pred.wagers.length}
					</div>
				</Link>
			</>)}
		</div>


		<h3>Past Predictions</h3>
		<Link to={`/server/${params.serv}/polls`} class="expandable">
			<div class="content" style={{
				display: "grid",
				gridTemplateColumns: "auto 1fr",
				gap: "5px 0px"
			}}>
				{data.predictions.filter(x => !isPayable(x.status)).slice(5).map(pred => <>
					<div style={{
						display: "flex",
						backgroundColor: "var(--color-purple)",
						borderRadius: "5px 0 0 5px",
						justifyContent: "center",
						fontWeight: "bold",
						overflow: "hidden",
						fontSize: "0.8em",
					}}>
						<div title="Total Bets" style={{
							display: "flex",
							alignItems: "center",
							padding: "3px 10px",
							color: "white",
							fontSize: "1.2em",
						}}>
							${pred.wagers.reduce((x, s) => s.amount + x, 0)}
						</div>
					</div>
					<div style={{
						boxShadow: "inset 0px 0px 5px 0px #0003",
						borderRadius: "0 5px 5px 0",
						padding: "5px 10px",
						fontWeight: "bold",
						overflow: "hidden",
						color: "var(--text-color)",
						fontSize: "0.8em"
					}}>
						{pred.title}
						<hr style={{height: "1px", margin: "3px 0px", borderWidth: "0px", backgroundColor: "var(--text-color)", opacity: "20%"}} />
						<div style={{marginLeft: "10px", fontWeight: "200", fontStyle: "italic", fontSize: "0.8em"}}>
							{pred.options.find(x => x.index == pred.answer)?.text}
						</div>
					</div>
				</>)}
			</div>
			<div class="grey"></div>
		</Link>

		<h3>{data.accounts.length} Members</h3>
		<Link to={`/server/${params.serv}/leaderboard`} class="expandable">
			<div class="content" style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
				gap: "10px"
			}}>
				{await Promise.all(data.accounts.map(async x => {
					const member = await GetMember(x.guildID, x.userID, shared)

					return <div>
						<AccountCard member={member} account={x} />
					</div>
				}))}
			</div>
			<div class="grey"></div>
		</Link>
	</div>;
}