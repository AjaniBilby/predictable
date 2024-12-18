import {
	ActionRowBuilder,
	ApplicationCommandType,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CacheType,
	CommandInteraction,
	ContextMenuCommandBuilder,
	ContextMenuCommandInteraction
} from "discord.js";
import { Prediction, PredictionOption } from "@prisma/client";

import * as Log from "~/logging";
import { HasPredictionPermission } from "~/permission";
import { ChunkArray } from "~/helper";
import { isPayable } from "~/prediction-state";
import { prisma } from "~/db";

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

	Log.bot("INFO", `Rendering Marking For prediction[${prediction.id}]:\n`
		+ prediction.options.map(o => `  ${o.index}: ${o.text}`).join("\n")
	);

	const rows: ActionRowBuilder[] = [];
	const grouping = ChunkArray(prediction.options, 4);
	for (const optRow of grouping) {
		const row = new ActionRowBuilder();
		for (const opt of optRow) {
			text += `${opt.index+1}: ${opt.text}\n`;

			row.addComponents(
				new ButtonBuilder()
					.setCustomId(`mark-${prediction.id}-${opt.index}`)
					.setLabel(`${opt.index+1}`)
					.setStyle(opt.correct ? ButtonStyle.Success : ButtonStyle.Danger)
			);
		}
		rows.push(row);
	}

	if (context instanceof ButtonInteraction) {
		await context.update({
			content: text,
			components: rows as any,
		});
	} else {
		await context.editReply({
			content: text,
			components: rows as any,
		});
	}
}