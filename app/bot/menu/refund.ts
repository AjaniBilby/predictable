import type { CacheType, ContextMenuCommandInteraction } from "discord.js";
import {
	ActionRowBuilder,
	ApplicationCommandType,
	ButtonBuilder,
	ButtonStyle,
	ContextMenuCommandBuilder,
} from "discord.js";
import { prisma } from "../../db";
import { HasPredictionPermission } from "../../permission";
import { isPayable } from "../../prediction-state";
import { bot } from "../../logging";

export const name = "Refund Prediction";

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

	bot("INFO", `Refunding prediction[${pollID}] by user[${scope.user.id}]`);

	const confirmBtn = new ButtonBuilder()
		.setCustomId(`refund-prediction-${prediction.id}`)
		.setLabel("Refund")
		.setStyle(ButtonStyle.Danger);

	await scope.editReply({
		content: "Are you sure that you want to refund and delete this prediction?\n" +
			`\`${prediction.title}\``,
		components: [
			new ActionRowBuilder().addComponents(confirmBtn)
		] as any
	});
}