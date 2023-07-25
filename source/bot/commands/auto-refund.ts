import type { ChatInputCommandInteraction, CacheType, Client } from "discord.js";
import type { CommandBinding } from "./index";

import { SlashCommandBuilder } from "discord.js";
import { prisma } from "../../db";
import { Prediction } from "@prisma/client";


export const bind: CommandBinding = {
	data: new SlashCommandBuilder()
		.setName('predict-auto-refund')
		.setDescription("Refund any predictions which are still open, but their message has been deleted"),
	execute: async (scope: ChatInputCommandInteraction<CacheType>) => {
		await scope.deferReply({ephemeral: true});

		const guildID = scope.guildId;
		const userID  = scope.user.id;

		if (!userID) {
			await scope.editReply({ content: `Error getting guild ID` });
			return;
		}
		if (!guildID) {
			await scope.editReply({ content: `Error getting guild ID` });
			return;
		}

		// Check account exists
		const predictions = await prisma.prediction.findMany({
			where: { guildID, status: "OPEN" },
		});


		// Check which messages have been deleted
		const res = await Promise.all( predictions.map(p => CheckAlive(scope.client, p)) );

		// Mark all of the invalid predictions
		//  Perform this as a transaction incase multiple copies of the command are running
		let badIDs = { in: predictions.filter((_, i) => res[i] === false).map(x => x.id) };
		const [invalidPredictions, _] = await prisma.$transaction([
			prisma.prediction.findMany({
				where: {
					id: badIDs,
					status: "OPEN"
				}
			}),
			prisma.prediction.updateMany({
				where: {
					id: badIDs,
					status: "OPEN"
				},
				data: {
					status: "INVALID"
				}
			})
		]);

		badIDs = { in: invalidPredictions.filter((_, i) => res[i] === false).map(x => x.id) };
		const invalidWagers = await prisma.wager.findMany({
			where: {
				predictionID: badIDs
			}
		});
		const worth = invalidWagers.reduce((s, x) => x.amount + s, 0);

		// Queue wager refunds
		const tasks = [];
		for (const wager of invalidWagers) {
			const predictionID = wager.predictionID;
			const userID = wager.userID;

			tasks.push(prisma.account.update({
				where: {
					guildID_userID: { userID, guildID }
				},
				data: {
					balance: { increment: wager.amount }
				}
			}));
			tasks.push(prisma.wager.delete({
				where: { predictionID_userID: { userID, predictionID } }
			}));
		}

		// Queue prediction deletions
		tasks.push(prisma.prediction.deleteMany({
			where: { id: badIDs }
		}));

		// Run all queued tasks in batch
		await prisma.$transaction(tasks);

		await scope.editReply({
			content:
				`Found ${invalidPredictions.length} unpaid predictions, `+
				`${invalidWagers.length} wagers, ` +
				`worth $${worth}`
		});
	}
}


async function CheckAlive(client: Client<true>, prediction: Prediction): Promise<boolean> {
	try {
		// Check valid guild
		const guild = await client.guilds.fetch(prediction.guildID);
		if (!guild) return false;

		// Check valid text channel
		const channel = guild.channels.cache.get(prediction.channelID);
		if (!channel) return false;
		if (!channel.isTextBased()) return false;

		// Check valid message
		const message = await channel.messages.fetch(prediction.id);
		if (!message) return false;

	} catch (_) {
		return false;
	}

	return true;
}