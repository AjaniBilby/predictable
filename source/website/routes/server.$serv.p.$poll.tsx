import * as elements from 'typed-html';
import { ErrorResponse, RenderArgs, StyleCSS } from "htmx-router";


import { client } from '../client';
import { prisma } from '../../db';
import { AccountCard } from '../component/account-card';

export async function Render({params}: RenderArgs) {
	const prediction = await prisma.prediction.findFirst({
		where: { guildID: params.serv, id: params.poll },
		include: {
			options: {
				orderBy: [ {index: "asc"} ]
			},
			wagers: {
				orderBy: [ {amount: "desc"} ]
			},
		}
	});

	if (!prediction) throw new ErrorResponse(404, "Resource not found", `Unable to find prediction ${params.poll}`);

	const guild = await client.guilds.fetch(params.serv);
	if (!guild) throw new ErrorResponse(404, "Resource not found", `Unable to load server details from discord`);

	return <div>
		<h2>{prediction.title}</h2>

		<p>Status: {prediction.status}</p>

		{prediction.options.map(opt => <div>
			{opt.text}
		</div>)}

		<h3>Wagers</h3>
		<div style={StyleCSS({ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "10px" })}>
			{await Promise.all(prediction.wagers.map(async w => {
				const member = await guild.members.fetch(w.userID);
				return <a href={`/server/${params.serv}/u/${w.userID}`}>
					<AccountCard member={member} account={{
						balance: w.amount,
						guildID: params.serv,
						userID: w.userID
					}} />
				</a>
			}))}
		</div>
	</div>;
}