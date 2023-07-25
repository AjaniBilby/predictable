import type { ChatInputCommandInteraction, CacheType } from "discord.js";
import type { CommandBinding } from "./index";

import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { prisma } from "../../db";


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

		await interaction.reply({content: "Creating Prediction..."});

		// Check guild exists
		const userID = interaction.user.id;
		if (!userID) {
			await interaction.reply({ content: `Error getting guild ID`, ephemeral: true });
			return;
		}
		await prisma.user.upsert({
			where: {
				id: userID
			},
			create: {
				id: userID
			},
			update: {}
		});

		// Check guild exists
		const guildID = interaction.guildId;
		if (!guildID) {
			await interaction.reply({ content: `Error getting guild ID`, ephemeral: true });
			return;
		}
		await prisma.guild.upsert({
			where: {
				id: guildID
			},
			create: {
				id: guildID,
				kitty: 0
			},
			update: {}
		});

		// Check account exists
		await prisma.account.upsert({
			where: {
				guildID_userID: {
					userID, guildID
				}
			},
			create: {
				userID, guildID,
				balance: 100
			},
			update: {}
		});

		const choice = new StringSelectMenuBuilder()
			.setCustomId('choice')
			.setPlaceholder('Make a selection!')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel("No Vote")
					.setValue('nil')
			);

		const options: string[] = [];
		for (let i=0; i<10; i++) {
			const opt = interaction.options.getString(`opt${i}`)?.trim();
			if (!opt) continue;

			options.push(opt);

			choice.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(opt)
					.setValue(`opt${i}`)
			)
		}

		const msg = await interaction.editReply({
			content: title,
			components: [
				new ActionRowBuilder().addComponents(choice)
			] as any,
		});

		await prisma.prediction.create({
			data: {
				id: msg.id,
				authorID: userID,
				guildID: guildID,

				title,
				description: "",
				answer: -1,
				status: "OPEN",

				options: {
					create: options.map((x, index) => ({index, text: x}))
				}
			}
		});
	}
}