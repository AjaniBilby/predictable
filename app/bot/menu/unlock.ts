import type { CacheType, ContextMenuCommandInteraction } from "discord.js";
import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
} from "discord.js";

import { HasPredictionPermission } from "~/permission";
import { UpdatePrediction } from "~/bot/prediction";
import { isPayable } from "~/prediction-state";
import { prisma } from "~/db";
import { bot } from "~/logging";

export const name = "Unlock Prediction";

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
		}
	});

	if (!prediction)
		return await scope.editReply("Cannot find prediction associated with message");

	if (!isPayable(prediction.status))
		return await scope.editReply("This prediction is no longer payable");

	if (!HasPredictionPermission(prediction, scope.user.id, []))
		return await scope.editReply("You don't have permissions to resolve this prediction");

	bot("INFO", `User[${scope.user.id}] is unlocking prediction[${pollID}]`);
	await prisma.prediction.update({
		where: {
			id: pollID,
			status: prediction.status // ensure it hasn't changed
		},
		data: {
			status: "OPEN"
		}
	});

	await scope.editReply({
		content: "The prediction has been **unlocked** and wagers **can** be placed or changed"
	});

	await UpdatePrediction(scope.client, prediction.id);
}