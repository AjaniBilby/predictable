import { ErrorResponse, RenderArgs, StyleCSS, Link } from "htmx-router";
import * as elements from 'typed-html';

import { prisma } from '../../db';

import { AccountCard } from '../component/account-card';
import { GetGuild, GetMember } from "../shared/discord";

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
				]
			}
		}
	});

	if (!data) throw new ErrorResponse(404, "Resource not found", `Unable to load guild ${params.serv}`);

	data.predictions.sort((a, b) => b.wagers.length - a.wagers.length);

	const openWagers = data.predictions
		.filter(x => x.status == "OPEN")
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
		<div style={StyleCSS({display: 'flex', flexDirection: "column", alignItems: "flex-start"})}>
			<h3>Statistics</h3>
			<div style={StyleCSS({display: "grid", gridTemplateColumns: "auto auto auto", gap: "5px 10px"})}>
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
		<div style={StyleCSS({
			display: "flex",
			flexWrap: "wrap",
			flexDirection: "column",
			alignItems: "flex-start",
			gap: "5px"
		})}>
			{data.predictions.filter(x => x.status === "OPEN").map(pred =>
				<Link to={`/server/${params.serv}/p/${pred.id}`} style={StyleCSS({
					display: "flex",
					borderRadius: "5px",
					fontWeight: "bold",
					overflow: "hidden",
					fontSize: "0.8em"
				})}>
					<div style={StyleCSS({
						display: "flex",
						alignItems: "center",
						padding: "3px 10px",
						color: "white",
						fontSize: "1.2em",
						backgroundColor: "var(--color-blue)",
					})}>
						${pred.wagers.reduce((x, s) => s.amount + x, 0)}
					</div>
					<div style={StyleCSS({padding: "5px 10px", boxShadow: "inset 0px 0px 5px 0px #0003", color: "var(--text-color)"})}>
						{pred.title}
						<hr style={StyleCSS({height: "1px", margin: "3px 0px", borderWidth: "0px", backgroundColor: "var(--text-color)", opacity: "20%"})} />
						<div style={StyleCSS({marginLeft: "10px", fontWeight: "200", fontStyle: "italic", fontSize: "0.8em"})}>
							Bets: {pred.wagers.length}
						</div>
					</div>
				</Link>
			)}
		</div>


		<h3>Past Predictions</h3>
		<div style={StyleCSS({
			display: "flex",
			flexWrap: "wrap",
			flexDirection: "row",
			alignItems: "flex-start",
			gap: "5px"
		})}>
			{data.predictions.filter(x => ["CLOSED", "PAYING"].includes(x.status)).map(pred =>
				<Link to={`/server/${params.serv}/p/${pred.id}`} style={StyleCSS({
					display: "flex",
					borderRadius: "5px",
					fontWeight: "bold",
					overflow: "hidden",
					fontSize: "0.8em"
				})}>
					<div style={StyleCSS({
						display: "flex",
						alignItems: "center",
						padding: "3px 10px",
						color: "white",
						fontSize: "1.2em",
						backgroundColor: "var(--color-purple)",
					})}>
						${pred.wagers.reduce((x, s) => s.amount + x, 0)}
					</div>
					<div style={StyleCSS({padding: "5px 10px", boxShadow: "inset 0px 0px 5px 0px #0003", color: "var(--text-color)"})}>
						{pred.title}
						<hr style={StyleCSS({height: "1px", margin: "3px 0px", borderWidth: "0px", backgroundColor: "var(--text-color)", opacity: "20%"})} />
						<div style={StyleCSS({marginLeft: "10px", fontWeight: "200", fontStyle: "italic", fontSize: "0.8em"})}>
							{pred.options.find(x => x.index == pred.answer)?.text}
						</div>
					</div>
				</Link>
			)}
		</div>

		<h3>{data.accounts.length} Members</h3>
		<div style={StyleCSS({
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
			gap: "10px"
		})}>
			{await Promise.all(data.accounts.map(async x => {
				const member = await GetMember(x.guildID, x.userID, shared)

				return <Link to={`/server/${x.guildID}/u/${x.userID}`}>
					<AccountCard member={member} account={x} />
				</Link>
			}))}
		</div>
	</div>;
}