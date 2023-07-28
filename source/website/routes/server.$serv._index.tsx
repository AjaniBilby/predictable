import * as elements from 'typed-html';

import { ErrorResponse, RenderArgs, StyleCSS } from "htmx-router";
import { client } from '../client';
import { prisma } from '../../db';
import { AccountCard } from '../component/account-card';

export async function Render({params}: RenderArgs) {
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

	const guild = await client.guilds.fetch(params.serv);
	if (!guild) throw new ErrorResponse(404, "Resource not found", `Unable to load server details from discord`);

	const liquid = data.accounts.reduce((s, x) => x.balance+s, 0);
	const assets = data.predictions.reduce((s, x) => x.wagers.reduce((s, x) => x.amount+s, s), 0);
	const worth = liquid + assets;

	return <div>
		<div style={StyleCSS({display: 'flex', flexDirection: "column", alignItems: "flex-start"})}>
			<h3>Statistics</h3>
			<div style={StyleCSS({display: "grid", gridTemplateColumns: "auto auto", gap: "5px 10px"})}>
				<div>Liquid</div>
				<div style='text-align: right;'>{"$"+liquid}</div>
				<div>Assets</div>
				<div style='text-align: right;'>{"$"+assets}</div>
				<div>Net</div>
				<div style='text-align: right;'>{"$"+worth}</div>
			</div>
		</div>

		<h3>Open Predictions</h3>
		<div style={StyleCSS({
			display: "flex",
			flexDirection: "column",
			alignItems: "flex-start",
			gap: "5px"
		})}>
			{data.predictions.filter(x => x.status === "OPEN").map(pred =>
				<a href={`/server/${params.serv}/p/${pred.id}`} style={StyleCSS({
					display: "flex",
					borderRadius: "5px",
					fontWeight: "bold",
					overflow: "hidden",
					fontSize: "0.8em"
				})}>
					<div style={StyleCSS({padding: "5px 10px", boxShadow: "inset 0px 0px 5px 0px #0003", color: "var(--text-color)"})}>
						{pred.title}
						<hr style={StyleCSS({height: "1px", margin: "3px 0px", borderWidth: "0px", backgroundColor: "var(--text-color)", opacity: "20%"})} />
						<div style={StyleCSS({marginLeft: "10px", fontWeight: "200", fontStyle: "italic", fontSize: "0.8em"})}>
							Bets: {pred.wagers.length}
						</div>
					</div>
					<div style={StyleCSS({
						display: "flex",
						alignItems: "center",
						padding: "3px 10px",
						color: "white",
						fontSize: "1.2em",
						backgroundColor: "#78dce8",
					})}>
						${pred.wagers.reduce((x, s) => s.amount + x, 0)}
					</div>
				</a>
			)}
		</div>


		<h3>Past Predictions</h3>
		<div style={StyleCSS({
			display: "flex",
			flexDirection: "row",
			alignItems: "flex-start",
			gap: "5px"
		})}>
			{data.predictions.filter(x => ["CLOSED", "PAYING"].includes(x.status)).map(pred =>
				<a href={`/server/${params.serv}/p/${pred.id}`} style={StyleCSS({
					display: "flex",
					borderRadius: "5px",
					fontWeight: "bold",
					overflow: "hidden",
					fontSize: "0.8em"
				})}>
					<div style={StyleCSS({padding: "5px 10px", boxShadow: "inset 0px 0px 5px 0px #0003", color: "var(--text-color)"})}>
						{pred.title}
						<hr style={StyleCSS({height: "1px", margin: "3px 0px", borderWidth: "0px", backgroundColor: "var(--text-color)", opacity: "20%"})} />
						<div style={StyleCSS({marginLeft: "10px", fontWeight: "200", fontStyle: "italic", fontSize: "0.8em"})}>
							{pred.options.find(x => x.index == pred.answer)?.text}
						</div>
					</div>
					<div style={StyleCSS({
						display: "flex",
						alignItems: "center",
						padding: "3px 10px",
						color: "white",
						fontSize: "1.2em",
						backgroundColor: "#78dce8",
					})}>
						${pred.wagers.reduce((x, s) => s.amount + x, 0)}
					</div>
				</a>
			)}
		</div>

		<h3>{data.accounts.length} Members</h3>
		<div style={StyleCSS({ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "10px" })}>
			{await Promise.all(data.accounts.map(async a => {
				const member = await guild.members.fetch(a.userID);
				return <a href={`/server/${member.guild.id}/u/${a.userID}`}>
					<AccountCard member={member} account={a} />
				</a>;
			}))}
		</div>
	</div>;
}