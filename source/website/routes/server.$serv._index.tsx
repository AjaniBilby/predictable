import * as elements from 'typed-html';

import { ErrorResponse, RenderArgs, StyleCSS } from "htmx-router";
import { client } from '../client';
import { prisma } from '../../db';

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

		<h3>Predictions</h3>
		{data.predictions.map(pred => <a href={`/server/${pred.guildID}/p/${pred.id}`} style={StyleCSS({display: "block"})}>
			{pred.title}
			{pred.status}
		</a>)}

		<h3>Members</h3>
		{await Promise.all(data.accounts.map(async a => {
			const member = await guild.members.fetch(a.userID);
			const avatar = member.displayAvatarURL();

			return <a href={`/server/${data.id}/u/${a.userID}`} style={StyleCSS({display: "block"})}>
				<div style={StyleCSS({
					backgroundImage: `url('${avatar}')`,
					backgroundPosition: "center",
					backgroundSize: "contain",
					borderRadius: "100%",
					aspectRatio: "1/1",
					width: "40px",
				})}></div>
				{member.displayName}
				{a.balance}
			</a>
		}))}
	</div>;
}