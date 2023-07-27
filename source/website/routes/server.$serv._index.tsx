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

	const guild = await client.guilds.fetch(data.id);
	if (!guild) throw new ErrorResponse(404, "Resource not found", `Unable to load server details from discord`);

	return <div>
		Balance: {data.kitty}

		<h3>Open Predictions</h3>
		{data.predictions.filter(p => p.status === "OPEN")
			.map(pred => <a href={`/server/${pred.guildID}/p/${pred.id}`} style={StyleCSS({display: "block"})}>
				{pred.title}
				{pred.status}
			</a>)
		}

		<h3>Past Predictions</h3>
		{data.predictions.filter(p => p.status !== "OPEN")
			.map(pred => <a href={`/server/${pred.guildID}/p/${pred.id}`} style={StyleCSS({display: "block"})}>
				{pred.title}
				{pred.status}
			</a>)
		}

		<h3>Members</h3>
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