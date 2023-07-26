import type { CacheType, ContextMenuCommandInteraction } from "discord.js";
import {
	ActionRowBuilder,
	ApplicationCommandType,
	ContextMenuCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { prisma } from "../../db";
import { HasPredictionPermission } from "../../permission";

export const name = "Mark Answer";

export function bind() {
	return new ContextMenuCommandBuilder()
		.setName(name)
		.setType(ApplicationCommandType.Message)
}

export async function execute(scope: ContextMenuCommandInteraction<CacheType>) {
	const pollID = scope.targetId || "";

	await scope.deferReply({ephemeral: true});

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
		return await scope.editReply("Cannot find prediction associated with message");

	if (prediction.status !== "OPEN")
		return await scope.editReply("Cannot mark a non-open prediction");

	if (!HasPredictionPermission(prediction, scope.user.id, []))
		return await scope.editReply("You don't have permissions to resolve this prediction");

	const choice = new StringSelectMenuBuilder()
		.setCustomId(`resolve-${pollID}`)
		.setPlaceholder('Make a selection!');

	for (const [i, opt] of prediction.options.entries()) {
		choice.addOptions(new StringSelectMenuOptionBuilder()
			.setLabel(opt.text)
			.setValue(`opt${i}`)
		)
	}

	await scope.editReply({
		content: "Set the final answer",
		components: [
			new ActionRowBuilder().addComponents(choice)
		] as any,
	});
}