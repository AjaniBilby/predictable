import type { CacheType, StringSelectMenuInteraction } from "discord.js";
import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { prisma } from "../../db";

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
			options: true
		}
	});

	if (!prediction)
		return await scope.editReply({ content: 'Error loading prediction details' })

	if (prediction.status !== "OPEN")
		return await scope.editReply({ content: 'This prediction has been closed, so your wager cannot be taken' })

	if (prediction.authorID !== userID)
		return await scope.editReply({ content: "You don't have permission to resolve this prediction" });

	const choiceInt = Number(choice.slice(3));
	if (isNaN(choiceInt) || !prediction.options.some(x => x.index == choiceInt))
		return await scope.editReply({ content: `Error selecting option ${choice}` });

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