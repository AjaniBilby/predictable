import type { ButtonInteraction, CacheType } from "discord.js";
import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
} from "discord.js";
import { prisma } from "../../db";

import { HasPredictionPermission } from "../../permission";
import { RenderMarking } from "../menu/mark";
import { isPayable } from "../../prediction-state";
import { bot } from "../../logging";

export const name = "^mark-[0-9]+-[0-9]+$";

export function bind() {
	return new ContextMenuCommandBuilder()
		.setName(name)
		.setType(ApplicationCommandType.Message)
}

export async function execute(scope: ButtonInteraction<CacheType>) {
	const [_, pollID, optIdxTxt] = scope.customId.split('-');
	const optIdx = Number(optIdxTxt);

	// Check the target exists and is in the correct state
	const prediction = await prisma.prediction.findFirst({
		where: {
			id: pollID
		},
		include: {
			options: true
		}
	});

	if (!prediction)
		return await scope.reply("Cannot find prediction associated with this message");

	if (!isPayable(prediction.status))
		return await scope.reply("This prediction is no longer payable");

	if (!HasPredictionPermission(prediction, scope.user.id, []))
		return await scope.reply("You don't have permissions to mark this prediction");


	bot("INFO", `User[${scope.user.id}] refunding prediction[${prediction.id}]`);

	const target = prediction.options.find( o => o.index == optIdx );
	if (!target)
		return await scope.reply(`Internal Error: Unknown option idx ${optIdx}`);

	target.correct = !target.correct;

	await prisma.predictionOption.update({
		where: {
			index_predictionID: {
				predictionID: pollID,
				index: optIdx
			}
		},
		data: { correct: target.correct }
	});

	await RenderMarking(scope, prediction);
}