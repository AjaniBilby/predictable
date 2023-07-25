import type { ChatInputCommandInteraction, CacheType } from "discord.js";
import type { CommandBinding } from "./index";

import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";


export const bind: CommandBinding = {
	data: new SlashCommandBuilder()
		.setName('predict')
		.setDescription('Create a Prediction')
		.addStringOption(option =>
			option.setName('title')
				.setDescription('What are people prediction?')
				.setMaxLength(500)
				.setRequired(true)
			)
		.addStringOption(option => option.setName('opt0').setDescription('Option').setMaxLength(100) )
		.addStringOption(option => option.setName('opt1').setDescription('Option').setMaxLength(100) )
		.addStringOption(option => option.setName('opt2').setDescription('Option').setMaxLength(100) )
		.addStringOption(option => option.setName('opt3').setDescription('Option').setMaxLength(100) )
		.addStringOption(option => option.setName('opt4').setDescription('Option').setMaxLength(100) )
		.addStringOption(option => option.setName('opt5').setDescription('Option').setMaxLength(100) )
		.addStringOption(option => option.setName('opt6').setDescription('Option').setMaxLength(100) )
		.addStringOption(option => option.setName('opt7').setDescription('Option').setMaxLength(100) )
		.addStringOption(option => option.setName('opt8').setDescription('Option').setMaxLength(100) )
		.addStringOption(option => option.setName('opt9').setDescription('Option').setMaxLength(100) ),
	execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
		const title = interaction.options.getString("title")?.trim() || "Unknown Title";

		const choice = new StringSelectMenuBuilder()
			.setCustomId('choice')
			.setPlaceholder('Make a selection!')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel("No Vote")
					.setValue('nil')
			);

		for (let i=0; i<10; i++) {
			const opt = interaction.options.getString(`opt${i}`)?.trim();
			if (!opt) continue;

			choice.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(opt)
					.setValue(`opt${i}`)
			)
		}

		const msg = await interaction.reply({
			content: title,
			components: [
				new ActionRowBuilder().addComponents(choice)
			] as any,
		});
		console.log('New Predictor', msg.id);
	}
}