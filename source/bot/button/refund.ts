import type { ButtonInteraction, CacheType, ContextMenuCommandInteraction } from "discord.js";
import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
} from "discord.js";
import { prisma } from "../../db";
import { HasPredictionPermission } from "../../permission";
import { isPayable } from "../../prediction-state";
import { ShowPredictionClosed } from "../prediction";

export const name = "^refund-prediction-[0-9]+$";

export function bind() {
	return new ContextMenuCommandBuilder()
		.setName(name)
		.setType(ApplicationCommandType.Message)
}

export async function execute(scope: ButtonInteraction<CacheType>) {
	const pollID = scope.customId.slice(18);

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
		return await scope.reply("You don't have permissions to resolve this prediction");


	await scope.deferReply({ephemeral: false});


	const guildID = prediction.guildID;
	const [ _p, wagers ] = await prisma.$transaction([
		prisma.prediction.update({
			where: {
				id: prediction.id,
				status: prediction.status // check it hasn't changed
			},
			data: { status: "PAYING" }
		}),
		prisma.wager.findMany({
			where: { predictionID: prediction.id }
		})
	]);

	const tasks = [];
	for (const wager of wagers) {
		// Refund wager
		tasks.push(prisma.account.update({
			where: { guildID_userID: { guildID, userID: wager.userID } },
			data: { balance: { increment: wager.amount } }
		}));

		// Delete wager
		tasks.push(prisma.wager.delete({
			where: { predictionID_userID: {
				predictionID: prediction.id,
				userID: wager.userID
			}}
		}));
	}

	tasks.push(prisma.prediction.delete({
		where: {
			id: prediction.id
		}
	}));

	// All actions fail or pass as a group
	await prisma.$transaction(tasks);

	await scope.editReply({
		content: `Refunded \`${prediction.title}\` and deleted prediction`,
	});

	await ShowPredictionClosed(scope.client, prediction);
}