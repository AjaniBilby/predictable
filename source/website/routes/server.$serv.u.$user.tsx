import * as elements from 'typed-html';

import { ErrorResponse, RenderArgs } from "../../router/index";
import { prisma } from '../../db';
import { client } from '../client';

export async function Render({params}: RenderArgs) {
	const account = await prisma.account.findFirst({
		where: { guildID: params.serv, userID: params.user },
	});

	if (!account) throw new ErrorResponse(404, "Resource not found", `Unable to find account ${params.user}`);

	const guild = await client.guilds.fetch(account.guildID);
	if (!guild) throw new ErrorResponse(404, "Resource not found", `Unable to load server details from discord`);
	const member = await guild.members.fetch(account.userID);
	if (!member) throw new ErrorResponse(404, "Resource not found", `Unable to load user details from discord`);

	const wagers = await prisma.wager.findMany({
		where: { userID: params.serv },
		include: {
			prediction: true,
			option: true
		}
	});

	wagers.sort((a, b) => {
		return a.prediction.updatedAt.getTime() - b.prediction.updatedAt.getTime();
	})

	return <div>
		{member.displayName}
		Balance: {account.balance}

		{wagers.map(wager => <div>
			{wager.prediction.title}
			{wager.prediction.status}
			{wager.amount}
		</div>)}
	</div>;
}