import type { CacheType } from "discord.js";
import {
	ModalSubmitInteraction,
} from "discord.js";
import { prisma } from "../../db";

export const name = "^set-wager-[0-9]+$";


export async function execute(scope: ModalSubmitInteraction<CacheType>) {
	const amount = Number(scope.fields.getTextInputValue('amount') || "");
	const predictionID = scope.customId.slice("set-wager-".length);
	const guildID = scope.guildId;
	const userID = scope.user.id;

	await scope.deferReply({ephemeral: true});

	if (!guildID)
		return await scope.editReply({ content: `Cannot determine guild ID` });
	if (isNaN(amount) || amount < 1)
		return await scope.editReply({ content: `Invalid wager ${amount}` });



	const prediction = await prisma.prediction.findFirst({
		where: { id: predictionID, guildID }
	});
	if (!prediction) return await scope.editReply({
		content: `Cannot find prediction you're waging on`
	});

	if (prediction.status !== "OPEN") return await scope.editReply({
		content: `This prediction is no longer open, so you cannot change your wager`
	});


	const account = await prisma.account.findFirst({
		where: { guildID, userID }
	});
	if (!account) return await scope.editReply({
		content: `Cannot find your account on this server.\nTry choosing a wager first`
	});


	const wager = await prisma.wager.findFirst({
		where: { predictionID, userID },
		include: { option: true }
	});

	if (!wager) return await scope.editReply({
		content: `Cannot find your wager, please choose an option before setting your wager`
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


	await scope.editReply({
		content: `Wagered ${updatedWager.amount} on ${wager.option.text} (balance: ${updatedAccount.balance})`
	});
}