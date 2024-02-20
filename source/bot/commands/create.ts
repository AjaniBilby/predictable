import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";

import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";

export const name = "create";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription('Create a Prediction (opens modal)');
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	// Create the modal
	const modal = new ModalBuilder()
		.setCustomId(`create-prediction`)
		.setTitle('Create Prediction');

	// Create the text input components
	const titleInput = new TextInputBuilder()
		.setCustomId('title')
		.setLabel("Enter title")
		.setStyle(TextInputStyle.Short);
	const descInput = new TextInputBuilder()
		.setCustomId('desc')
		.setLabel("Enter description")
		.setStyle(TextInputStyle.Short)
		.setRequired(false);
	const imageInput = new TextInputBuilder()
		.setCustomId('image')
		.setLabel("Enter an image url (optional)")
		.setStyle(TextInputStyle.Short)
		.setRequired(false);
	const bodyInput = new TextInputBuilder()
		.setCustomId('body')
		.setLabel("Enter Options (one line per option)")
		.setStyle(TextInputStyle.Paragraph);


	// Add inputs to the modal
	modal.addComponents([
		new ActionRowBuilder().addComponents(titleInput),
		new ActionRowBuilder().addComponents(imageInput),
		new ActionRowBuilder().addComponents(descInput),
		new ActionRowBuilder().addComponents(bodyInput)
	] as any);

	// Show the modal to the user
	await scope.showModal(modal);
}