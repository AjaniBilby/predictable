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

	const prediction = await prisma.prediction.findFirst({
		where: {
			id: pollID
		},
		include: {
			options: true
		}
	});

	const all = await prisma.prediction.findMany();

	if (!prediction) {
		await scope.reply({ content: 'Error loading prediction details', ephemeral: true });
		return;
	}

	if (prediction.status !== "OPEN") {
		await scope.reply({ content: 'This prediction has been closed, so your wager cannot be taken', ephemeral: true });
		return;
	}

	if (choice === "nil") {
		await scope.reply({ content: 'Removed your prediction', ephemeral: true });
		return;
	}

	const choiceInt = Number(choice.slice(3));
	if (isNaN(choiceInt) || !prediction.options.some(x => x.index == choiceInt)) {
		await scope.reply({ content: `Error selecting option ${choice}`, ephemeral: true });
		return;
	}

	const data = {
		predictionID: pollID,
		userID,
		choice: choiceInt,
		amount: 0
	};

	await prisma.wager.upsert({
		where: {
			predictionID_userID: {
				predictionID: pollID,
				userID
			},
		},
		create: data,
		update: data,
	});

	await GetWagerAmount(pollID, scope);

	await scope.followUp({content: `Your waging on ${prediction.options[choiceInt].text}`, ephemeral: true});
}


export async function SetWagerAmount(scope: ModalSubmitInteraction<CacheType>) {
	const amount = Number(scope.fields.getTextInputValue('amount') || "");
	const predictionID = scope.customId.slice("set-wager-".length);
	const guildID = scope.guildId;
	const userID = scope.user.id;

	if (!guildID)
		return await scope.reply({ content: `Cannot determine guild ID`, ephemeral: true });
	if (isNaN(amount) || amount < 1)
		return await scope.reply({ content: `Invalid wager ${amount}`, ephemeral: true });



	const prediction = await prisma.prediction.findFirst({
		where: {
			id: predictionID,
			guildID
		}
	});
	if (!prediction) return await scope.reply({
		content: `Cannot find prediction you're waging on`,
		ephemeral: true
	});

	if (prediction.status !== "OPEN") return await scope.reply({
		content: `This prediction is no longer open, so you cannot change your wager`,
		ephemeral: true
	});


	const account = await prisma.account.findFirst({
		where: {
			guildID,
			userID
		}
	});
	if (!account) return await scope.reply({
		content: `Cannot find your account on this server.\nTry choosing a wager first`,
		ephemeral: true
	});


	const wager = await prisma.wager.findFirst({
		where: { predictionID, userID },
		include: { option: true }
	});

	if (!wager) return await scope.reply({
		content: `Cannot find your wager, please choose an option before setting your wager`,
		ephemeral: true
	});

	const delta = wager.amount - amount;
	if (delta+account.balance < 0) return await scope.reply({
		content: `You don't have enough money for this wager (balance: ${account.balance})`,
		ephemeral: true
	});

	const [ updatedAccount, updatedWager ] = await prisma.$transaction([
		prisma.account.update({
			where: {
				guildID_userID: { guildID, userID }
			},
			data: {
				balance: account.balance + delta
			}
		}),
		prisma.wager.update({
			where: {
				predictionID_userID: { predictionID, userID }
			},
			data: {
				amount: amount
			}
		})
	]);

	console.log(account.balance,        wager.amount,        delta);
	console.log(updatedAccount.balance, updatedWager.amount, delta);


	await scope.reply({ content: `Wagered ${amount} on ${wager.option.text} (balance: ${updatedAccount.balance})`, ephemeral: true });
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