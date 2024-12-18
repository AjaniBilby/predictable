import type { CacheType, StringSelectMenuInteraction } from "discord.js";

import { isPayable } from "~/prediction-state";
import { prisma } from "~/db";
import { bot } from "~/logging";

export const name = "^resolve-[0-9]+$";

export async function execute(scope: StringSelectMenuInteraction<CacheType>) {
	const choice = scope.values[0].slice(3);
	const pollID = scope.customId.slice(8);
	const userID = scope.user.id;

	await scope.deferReply({ ephemeral: true });

	const prediction = await prisma.prediction.findFirst({
		where: {
			id: pollID
		},
		include: {
			options: {
				orderBy: [
					{ index: "asc" }
				]
			}
		}
	});

	if (!prediction)
		return await scope.editReply({ content: 'Error loading prediction details' })

	if (!isPayable(prediction.status))
		return await scope.editReply({ content: 'This prediction is no longer payable' });

	const choiceInt = Number(choice);
	if (isNaN(choiceInt) || !prediction.options.some(x => x.index == choiceInt))
		return await scope.editReply({ content: `Error selecting option ${choice}` });

	bot("INFO", `User[${userID}] has set prediction[${pollID}]'s answer to ${choice}`);
	await prisma.prediction.update({
		where: {
			id: pollID
		},
		data: {
			answer: choiceInt
		}
	});

	await scope.editReply({
		content: `Updated answer "${prediction.options[choiceInt].text}", please confirm before payouts will be conducted`
	});
}