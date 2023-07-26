import type { CacheType, ContextMenuCommandInteraction } from "discord.js";
import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
} from "discord.js";
import { prisma } from "../../db";
import { HasPredictionPermission } from "../../permission";

export const name = "Payout";

export function bind() {
	return new ContextMenuCommandBuilder()
		.setName(name)
		.setType(ApplicationCommandType.Message)
}

export async function execute(scope: ContextMenuCommandInteraction<CacheType>) {
	const pollID = scope.targetId || "";

	await scope.deferReply({ephemeral: true});

	if (!HasPredictionPermission(pollID, scope.user.id, []))
		return await scope.editReply("You don't have permissions to resolve this prediction");

	const prediction = await prisma.prediction.findFirst({
		where: {
			id: pollID
		},
		include: {
			options: true
		}
	});

	if (!prediction)
		return await scope.editReply("Cannot find prediction associated with this message");

	if (prediction.status !== "OPEN")
		return await scope.editReply("Cannot payout non open prediction");

	if (!prediction.options[prediction.answer])
		return await scope.editReply("Cannot payout as no answer is set");

	const guildID = prediction.guildID;
	const [ _p, wagers, guild, _g ] = await prisma.$transaction([
		// Mark prediction as processing
		//  Get all wagers
		prisma.prediction.update({
			where: {
				id: pollID,
				status: "OPEN"
			},
			data: { status: "PAYING" }
		}),
		prisma.wager.findMany({
			where: { predictionID: pollID }
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

	const tasks = [];
	const pool  = kitty;
	for (const wager of winners) {
		const weight = winnerPool / wager.amount;
		const amount = Math.floor(pool*weight);
		tasks.push(prisma.account.update({
			where: { guildID_userID: { guildID, userID: wager.userID } },
			data: { balance: { increment: amount } }
		}));
		kitty -= amount;
	}

	// Add rounding leftovers back into the kitty
	tasks.push(prisma.guild.update({
		where: { id: guildID },
		data:  { kitty: { increment: kitty } }
	}));


	// All actions fail or pass as a group
	await prisma.$transaction(tasks);



	await scope.followUp({
		content: `Paid out \$${totalKitty} to ${winners.length} people`,
	});
}