import type { CacheType, StringSelectMenuInteraction } from "discord.js";
import {
	ActionRowBuilder,
	ModalBuilder,
	ModalSubmitInteraction,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { prisma } from "../db";



export async function PlaceWager(scope: StringSelectMenuInteraction<CacheType>) {
	const choice = scope.values[0].slice(3);
	const pollID = scope.message.id || "";
	const userID = scope.user.id;

	await scope.deferReply({ephemeral: true});

	const prediction = await prisma.prediction.findFirst({
		where: {
			id: pollID
		},
		include: {
			options: true
		}
	});

	if (!prediction) {
		await scope.editReply({ content: 'Error loading prediction details' });
		return;
	}

	if (prediction.status !== "OPEN") {
		await scope.editReply({ content: 'This prediction has been closed, so your wager cannot be taken' });
		return;
	}

	if (choice === "nil") {
		await scope.editReply({ content: 'Removed your prediction' });
		return;
	}

	const choiceInt = Number(choice.slice(3));
	if (isNaN(choiceInt) || !prediction.options.some(x => x.index == choiceInt)) {
		await scope.editReply({ content: `Error selecting option ${choice}` });
		return;
	}

	await prisma.wager.upsert({
		where: {
			predictionID_userID: {
				predictionID: pollID,
				userID
			},
		},
		create: {
			predictionID: pollID,
			userID,
			choice: choiceInt,
			amount: 0
		},
		update: {
			choice: choiceInt
		},
	});

	await GetWagerAmount(pollID, scope);
	await scope.followUp({ content: `Your waging on ${prediction.options[choiceInt].text}` });
}


export async function SetWagerAmount(scope: ModalSubmitInteraction<CacheType>) {
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
		content: `Wagered ${amount} on ${wager.option.text} (balance: ${updatedAccount.balance})`
	});
}


async function GetWagerAmount(pollID: string, interaction: StringSelectMenuInteraction<CacheType>) {
	// Create the modal
	const modal = new ModalBuilder()
		.setCustomId(`set-wager-${pollID}`)
		.setTitle('Wager Amount');

	// Create the text input components
	const favoriteColorInput = new TextInputBuilder()
		.setCustomId('amount')
			// The label is the prompt the user sees for this input
		.setLabel("Enter Amount to Wager")
			// Short means only a single line of text
		.setStyle(TextInputStyle.Short);


	// Add inputs to the modal
	modal.addComponents([
		new ActionRowBuilder().addComponents(favoriteColorInput)
	] as any);

	// Show the modal to the user
	await interaction.showModal(modal);
}