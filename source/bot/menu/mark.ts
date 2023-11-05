import { ButtonInteraction, CacheType, CommandInteraction, ContextMenuCommandInteraction} from "discord.js";
import {
	ActionRowBuilder,
	ApplicationCommandType,
	ButtonBuilder,
	ButtonStyle,
	ContextMenuCommandBuilder,
} from "discord.js";
import { Prediction, PredictionOption } from "@prisma/client";

import { HasPredictionPermission } from "../../permission";
import { isPayable } from "../../prediction-state";
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

	if (!isPayable(prediction.status))
		return await scope.editReply("This prediction is no longer payable");

	if (!HasPredictionPermission(prediction, scope.user.id, []))
		return await scope.editReply("You don't have permissions to resolve this prediction");


	await RenderMarking(scope, prediction);
}



export async function RenderMarking(context: CommandInteraction | ButtonInteraction, prediction: Prediction & { options: PredictionOption[] }) {
	let text = `**${prediction.title}**\n`;

	const row = new ActionRowBuilder();
	for (const [i, opt] of prediction.options.entries()) {
		text += `${i+1}: ${opt.text}\n`;

		row.addComponents(
			new ButtonBuilder()
				.setCustomId(`mark-${prediction.id}-${opt.index}`)
				.setLabel(`${opt.index+1}`)
				.setStyle(opt.correct ? ButtonStyle.Success : ButtonStyle.Danger)
		);
	}

	if (context instanceof ButtonInteraction) {
		await context.update({
			content: text,
			components: [ row ] as any,
		});
	} else {
		await context.editReply({
			content: text,
			components: [ row ] as any,
		});
	}
}