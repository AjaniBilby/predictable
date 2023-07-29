import { ErrorResponse, RenderArgs, StyleCSS, Link } from "htmx-router";
import * as elements from 'typed-html';

import { client, fetchWrapper } from '../../bot/client';
import { prisma } from '../../db';

import { GuildCard } from '../component/guild-card';

export async function Render(rn: string, {params, res}: RenderArgs) {
	res.setHeader('HX-Redirect', `/user/${params.user}`);

	const accounts = await prisma.account.findMany({
		where: { userID: params.user },
	});

	if (accounts.length < 1)
		throw new ErrorResponse(404, "Resource not found", `Unable to find account ${params.user}`);


	const user = await fetchWrapper(client.users.fetch(params.user));
	if (!user) throw new ErrorResponse(404, "Resource not found", `Unable to load user details from discord`);

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
				<div>
					Total Balance: {"$"+accounts.reduce((x, s) => s.balance + x, 0)}
				</div>
			</div>
		</div>

		<h3>Member of</h3>
		{await Promise.all(accounts.map(async a => {
			const guild = await fetchWrapper(client.guilds.fetch(a.guildID));
			return <Link to={`/server/${a.guildID}`}>
				<GuildCard guild={guild} />
			</Link>;
		}))}
	</div>;
}