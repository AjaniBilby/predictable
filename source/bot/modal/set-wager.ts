import type { CacheType } from "discord.js";
import {
	ModalSubmitInteraction,
} from "discord.js";
import { prisma } from "../../db";
import { UpdatePrediction } from "../prediction";
import { PredictionOption, Wager } from "@prisma/client";
import { GetAccount } from "../account";
import { isVotable } from "../../prediction-state";

export const name = "^set-wager-[0-9]+-[0-9]+$";


export async function execute(scope: ModalSubmitInteraction<CacheType>) {
	let amount = Number(scope.fields.getTextInputValue('amount') || "");
	const components = scope.customId.slice("set-wager-".length).split("-");
	const predictionID = components[0];
	const choice  = Number(components[1]);
	const guildID = scope.guildId;
	const userID  = scope.user.id;

	await scope.deferReply({ephemeral: true});

	if (!guildID)
		return await scope.editReply({ content: `Cannot determine guild ID` });
	if (isNaN(amount) || amount < 1)
		return await scope.editReply({ content: `Invalid wager ${amount}` });

	amount = Math.round(amount);



	const prediction = await prisma.prediction.findFirst({
		where: { id: predictionID, guildID }
	});
	if (!prediction) return await scope.editReply({
		content: `Cannot find prediction you're waging on`
	});

	if (!isVotable(prediction.status)) return await scope.editReply({
		content: `This predictions are no longer open, so you cannot change your wager`
	});


	const account = await GetAccount(userID, guildID);
	if (!account) return await scope.editReply({
		content: `Error while getting/initializing account while setting wager amount`
	});

	const wager = await prisma.wager.upsert({
		where: {
			predictionID_userID: {
				predictionID,
				userID
			},
		},
		create: {
			predictionID, userID,
			choice, amount: 0
		},
		update: {
			choice
		},
		include: {
			option: true
		}
	});

	const delta = wager.amount - amount;
	if (delta+account.balance < 0) return await scope.editReply({
		content: `You don't have enough money for this wager (balance: ${account.balance})`
	});

	const [ updatedAccount, updatedWager ] = await prisma.$transaction([
		prisma.account.update({
			where: { guildID_userID: { guildID, userID } },
			data: { balance: { increment: delta } }
		}),
		prisma.wager.update({
			where: { predictionID_userID: { predictionID, userID } },
			data: { amount: { decrement: delta } }
		})
	]);

	wager.amount = updatedWager.amount;

	await scope.editReply({
		content: `Wagered \$${wager.amount} on \`${wager.option.text}\`\n`+
			`> Balance: \$${updatedAccount.balance}`
	});
	await ShowPotential(predictionID, wager, updatedAccount.balance, scope);
	await UpdatePrediction(scope.client, predictionID);
}

type CompleteWager = Wager & {
	option: PredictionOption
}

async function ShowPotential(pollID: string, wager: CompleteWager, balance: number, scope: ModalSubmitInteraction<CacheType>) {
	const prediction = await prisma.prediction.findFirst({
		where: {
			id: pollID
		},
		include: {
			wagers: true
		}
	});

	if (!prediction)
		return await scope.followUp("Error calculating potential payout");

	// Calculate stats
	let totalAmount = 0;
	let leverage    = 0;
	for (const otherWager of prediction.wagers) {
		if (otherWager.choice == wager.choice) leverage += otherWager.amount;
		totalAmount += otherWager.amount;
	}

	const potential = Math.floor((wager.amount/leverage)*totalAmount);
	await scope.editReply({
		content: `Wagered \$${wager.amount} on \`${wager.option.text}\`\n`+
			`> Estimated potential earning \$${potential}\n` +
			`> Balance: \$${balance}`
	})
}