import type { CacheType, ContextMenuCommandInteraction } from "discord.js";
import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
} from "discord.js";
import { prisma } from "../../db";
import { HasPredictionPermission } from "../../permission";
import { isPayable } from "../../prediction-state";
import { UpdatePrediction } from "../prediction";

export const name = "Lock Prediction";

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

	await prisma.prediction.update({
		where: {
			id: pollID,
			status: prediction.status // ensure it hasn't changed
		},
		data: {
			status: "LOCKED"
		}
	});

	await scope.editReply({
		content: "The prediction has been **locked** and wagers **cannot** be placed or changed"
	});

	await UpdatePrediction(scope.client, prediction.id);
}