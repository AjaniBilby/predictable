import type { CacheType, StringSelectMenuInteraction } from "discord.js";
import {
	ActionRowBuilder,
	ModalBuilder,
	ModalSubmitInteraction,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";



export async function PlaceWager(pollID: string, choice: string, scope: StringSelectMenuInteraction<CacheType>) {
	if (choice === "nil") {
		await scope.reply({ content: 'Removed your prediction', ephemeral: true });
		return;
	}

	return await GetWagerAmount(pollID, scope);
}


export async function SetWagerAmount(pollID: string, scope: ModalSubmitInteraction<CacheType>) {
	const amount = Number(scope.fields.getTextInputValue('amount') || "");

	if (isNaN(amount) || amount < 1)
		return await scope.reply({ content: `Invalid wager ${amount}`, ephemeral: true });

	await scope.reply({ content: `Wagered ${amount} on ${pollID}`, ephemeral: true });
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