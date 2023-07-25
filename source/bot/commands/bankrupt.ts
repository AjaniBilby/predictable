import type { ChatInputCommandInteraction, CacheType } from "discord.js";
import type { CommandBinding } from "./index";

import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { prisma } from "../../db";


export const bind: CommandBinding = {
	data: new SlashCommandBuilder()
		.setName('bankrupt')
		.setDescription("Reset your account balance if you're in debt"),
	execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
		await interaction.reply({ content: "Checking balance", ephemeral: true });

		const guildID = interaction.guildId;
		const userID = interaction.user.id;

		if (!userID) {
			await interaction.editReply({ content: `Error getting guild ID` });
			return;
		}
		if (!guildID) {
			await interaction.editReply({ content: `Error getting guild ID` });
			return;
		}

		// Check account exists
		const account = await prisma.account.findFirst({
			where: { userID, guildID },
		});
		if (!account) {
			await interaction.editReply({ content: `You don't have an account yet in this guild\nStart betting for your opening balance` });
			return;
		}

		if (account.balance > 1) {
			await interaction.editReply({ content: `You can only declare bankrupt if your balance is less than 1\nYou've got to work your way up` });
			return;
		}

		const [updatedGuild, updatedAccount] = await prisma.$transaction([
			prisma.guild.update({
				where: { id: guildID },
				data: { kitty: { decrement: 2 } }
			}),
			prisma.account.update({
				where: { guildID_userID: { userID, guildID } },
				data: { balance: 2 }
			})
		]);

		await interaction.editReply({ content: `Your balance is ${updatedAccount.balance}` });
	}
}