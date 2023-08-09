import type { ChatInputCommandInteraction, CacheType, Client, SlashCommandSubcommandBuilder } from "discord.js";
import { Prediction } from "@prisma/client";
import { prisma } from "../../db";
import { bot } from "../../logging";

export const name = "auto-refund";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription("Automatically refund any predictions still open who's message has been deleted")
		.addBooleanOption(builder =>
				builder.setName("dry")
					.setDescription("If true it will just act out the command without doing anything")
		);
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	await scope.deferReply({ephemeral: true});

	const isDry   = scope.options.getBoolean("dry") || false;
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

	bot("INFO", `User[${userID}] auto refunding in guild[${guildID}]`);

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
				status: isDry ? undefined : "INVALID"
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
	if (!isDry) {
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
	}

	// Run all queued tasks in batch
	await prisma.$transaction(tasks);

	await scope.editReply({
		content:
			`Found ${invalidPredictions.length} unpaid predictions, `+
			`${invalidWagers.length} wagers, ` +
			`worth $${worth}`
	});
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