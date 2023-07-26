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

	if (!HasPredictionPermission(pollID, scope.user.id, []))
		return await scope.editReply("You don't have permissions to resolve this prediction");

	const options = await prisma.predictionOption.findMany({
		where: {
			predictionID: pollID
		},
		orderBy: [
			{ index: "asc" }
		]
	});

	if (options.length < 1)
		return await scope.editReply("Cannot find prediction associated with this message");

	const choice = new StringSelectMenuBuilder()
		.setCustomId(`resolve-${pollID}`)
		.setPlaceholder('Make a selection!');

	for (const [i, opt] of options.entries()) {
		choice.addOptions(new StringSelectMenuOptionBuilder()
			.setLabel(opt.text)
			.setValue(`opt-${i}`)
		)
	}

	await scope.editReply({
		content: "Set the final answer",
		components: [
			new ActionRowBuilder().addComponents(choice)
		] as any,
	});
}