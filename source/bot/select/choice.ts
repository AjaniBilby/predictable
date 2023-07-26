import type { CacheType, StringSelectMenuInteraction } from "discord.js";
import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { prisma } from "../../db";
import { UpdatePrediction } from "../prediction";

export const name = "^choice$";

export async function execute(scope: StringSelectMenuInteraction<CacheType>) {
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
	await scope.followUp({ content: `Your waging on \`${prediction.options[choiceInt].text}\``, ephemeral: true });
	await UpdatePrediction(scope.client, pollID);
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