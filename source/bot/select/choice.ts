import type { CacheType, StringSelectMenuInteraction } from "discord.js";
import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { prisma } from "../../db";
import { UpdatePrediction } from "../prediction";
import { GetAccount } from "../account";
import { isVotable } from "../../prediction-state";

export const name = "^choice$";

export async function execute(scope: StringSelectMenuInteraction<CacheType>) {
	const choice = scope.values[0].slice(3);

	const predictionID = scope.message.id || "";
	const guildID = scope.guildId;
	const userID  = scope.user.id;

	if (!guildID)
		return await scope.reply({
			content: 'Cannot get guild ID',
			ephemeral: true
		});

	const prediction = await prisma.prediction.findFirst({
		where: {
			id: predictionID
		},
		include: {
			options: true
		}
	});

	if (!prediction)
		return await scope.reply({
			content: 'Error loading prediction details',
			ephemeral: true
		});

	const account = await GetAccount(userID, guildID);
	if (!account)
		return await scope.reply({
			content: 'Error while getting/initializing account while setting wager choice',
			ephemeral: true
		});

	if (!isVotable(prediction.status)) return await scope.reply({
		content: 'This prediction has been closed, so your wager cannot be taken',
		ephemeral: true
	});

	if (choice === "") {
		const wager = await prisma.wager.delete({
			where: { predictionID_userID: { predictionID, userID } }
		});

		await prisma.account.update({
			where: { guildID_userID: { guildID, userID } },
			data: {
				balance: {increment: wager.amount}
			}
		});

		await scope.reply({ content: 'Removed your wager', ephemeral: true });
		await UpdatePrediction(scope.client, predictionID);
		return;
	}

	const choiceInt = Number(choice);
	if (isNaN(choiceInt) || !prediction.options.some(x => x.index == choiceInt)) {
		await scope.reply({ content: `Error selecting option ${choice}`, ephemeral: true });
		return;
	}

	// meta: { field_name: 'foreign key' }
	await prisma.wager.upsert({
		where: {
			predictionID_userID: {
				predictionID, userID
			},
		},
		create: {
			predictionID, userID,
			choice: choiceInt, amount: 0
		},
		update: {
			choice: choiceInt
		},
	});

	await GetWagerAmount(predictionID, choiceInt, scope);
}


async function GetWagerAmount(pollID: string, choice: number, interaction: StringSelectMenuInteraction<CacheType>) {
	// Create the modal
	const modal = new ModalBuilder()
		.setCustomId(`set-wager-${pollID}-${choice}`)
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