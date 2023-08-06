import type { CacheType, ContextMenuCommandInteraction } from "discord.js";
import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
} from "discord.js";
import { prisma } from "../../db";
import { HasPredictionPermission } from "../../permission";
import { isPayable } from "../../prediction-state";
import { UpdatePrediction } from "../prediction";
import { bot } from "../../logging";

export const name = "Payout";

export function bind() {
	return new ContextMenuCommandBuilder()
		.setName(name)
		.setType(ApplicationCommandType.Message)
}

export async function execute(scope: ContextMenuCommandInteraction<CacheType>) {
	const pollID = scope.targetId || "";

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
	const [ _p, wagers, guild, _g ] = await prisma.$transaction([
		// Mark prediction as processing
		//  Get all wagers
		prisma.prediction.update({
			where: {
				id: prediction.id,
				status: prediction.status // check it hasn't changed
			},
			data: { status: "PAYING" }
		}),
		prisma.wager.findMany({
			where: { predictionID: prediction.id }
		}),

		// Withdraw kitty
		prisma.guild.findFirstOrThrow({
			where: { id: guildID }
		}),
		prisma.guild.update({
			where: { id: guildID },
			data: { kitty: 0 }
		})
	]);

	// Total amount put in by winners
	const winners = wagers
		.filter(x => x.choice == prediction.answer);
	const winnerPool = winners
		.reduce((s, x) => x.amount + s, 0);

	// Add all wagers to the kitty
	const totalKitty = wagers.reduce((s, x) => x.amount + s, guild.kitty);

	// Pay out all broke accounts $1
	const accountIDs = wagers.map(x => x.userID);
	const brokeSelector = {
		userID: { in: accountIDs },
		guildID,
		balance: 0
	}
	const [brokeAccounts, _u] = await prisma.$transaction([
		prisma.account.findMany({
			select: { userID: true },
			where: brokeSelector
		}),
		prisma.account.updateMany({
			where: brokeSelector,
			data: {
				balance: 1
			}
		})
	]);
	let kitty = totalKitty - brokeAccounts.length;

	bot("INFO", `Prediction ${pollID}: Paying out ${totalKitty} to ${winners.length} less ${brokeAccounts.length} over ${winnerPool}`);
	const tasks = [];
	const pool  = kitty;
	for (const wager of winners) {
		// Update account balance according to weighted payout
		const weight = wager.amount/winnerPool;
		const amount = Math.floor(pool*weight);
		tasks.push(prisma.account.update({
			where: { guildID_userID: { guildID, userID: wager.userID } },
			data: { balance: { increment: amount } }
		}));

		// Log amount paid
		tasks.push(prisma.wager.update({
			where: { predictionID_userID: {
				predictionID: prediction.id,
				userID: wager.userID
			}},
			data: { payout: amount }
		}));

		// Deduct amount from kitty
		kitty -= amount;
		bot("INFO", `Prediction ${pollID}: Paid out ${amount} to ${wager.userID} for ${wager.amount} bet - ${kitty} remaining`);
	}

	tasks.push(prisma.prediction.update({
		where: {
			id: prediction.id
		},
		data: { status: "CLOSED" }
	}));


	// All actions fail or pass as a group
	await prisma.$transaction(tasks);

	await scope.editReply({
		content: `Paid out \$${totalKitty} to ${winners.length} people`,
	});



	// Give any left over kitty to a random poor person
	if (kitty > 0) {
		const winAcc = await prisma.account.findMany({
			where: {
				userID: { in: winners.map(x => x.userID) },
				guildID
			}
		});

		const minBalance = Math.min(...winAcc.map(x => x.balance));
		const poor = winAcc.filter(x => x.balance === minBalance);

		// Only attempt payout if there is someone to pay to
		if (poor.length > 0) {
			const chosen = poor[Math.floor(Math.random() * poor.length)];
			const lucky = await prisma.account.update({
				where: { guildID_userID: {
					userID: chosen.userID,
					guildID
				}},
				data: {
					balance: { increment: kitty }
				}
			});

			if (lucky) {
				await prisma.wager.update({
					where: { predictionID_userID: {
						predictionID: prediction.id,
						userID: lucky.userID
					}},
					data: { payout: { increment: kitty } }
				});

				const user = await scope.client.users.fetch(lucky.userID);
				await scope.followUp(`@${user.username} is the lucky person who got the kitty \$${kitty}`);

				bot("INFO", `Prediction ${pollID}: Paid out extra ${kitty} to ${lucky.userID} remaining kitty`);
				kitty = 0;
			}
		}
	}

	// The kitty has not been paid out
	// So give it to the server
	await prisma.guild.update({
		where: { id: guildID },
		data: {
			kitty: { increment : kitty }
		}
	});
	await UpdatePrediction(scope.client, pollID);
}