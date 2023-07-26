import type { CacheType, ContextMenuCommandInteraction } from "discord.js";
import {
	ActionRowBuilder,
	ApplicationCommandType,
	ContextMenuCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { prisma } from "../../db";

export const name = "Mark Answer";

export function bind() {
	return new ContextMenuCommandBuilder()
		.setName(name)
		.setType(ApplicationCommandType.Message)
}

export async function execute(scope: ContextMenuCommandInteraction<CacheType>) {
	const pollID = scope.targetId || "";

	await scope.deferReply({ephemeral: true});

	const options = await prisma.predictionOption.findMany({
		where: {
			predictionID: pollID
		},
		orderBy: [
			{ index: "asc" }
		]
	});

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