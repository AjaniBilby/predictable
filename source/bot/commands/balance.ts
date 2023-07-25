import type { ChatInputCommandInteraction, CacheType } from "discord.js";
import type { CommandBinding } from "./index";

import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { prisma } from "../../db";


export const bind: CommandBinding = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Check your account balance'),
	execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
		await interaction.reply({ content: "Checking balance", ephemeral: true });

		// Check guild exists
		const userID = interaction.user.id;
		if (!userID) {
			await interaction.editReply({ content: `Error getting guild ID` });
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
			await interaction.editReply({ content: `Error getting guild ID` });
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
		const account = await prisma.account.upsert({
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

		await interaction.editReply({ content: `Your balance is ${account.balance}` });
	}
}