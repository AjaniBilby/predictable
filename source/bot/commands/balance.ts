import type { ChatInputCommandInteraction, CacheType } from "discord.js";
import type { CommandBinding } from "./index";

import { SlashCommandBuilder } from "discord.js";
import { prisma } from "../../db";


export const bind: CommandBinding = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Check your account balance'),
	execute: async (scope: ChatInputCommandInteraction<CacheType>) => {
		await scope.deferReply({ephemeral: true});

		await scope.editReply({ content: "Checking balance" });

		// Check guild exists
		const userID = scope.user.id;
		if (!userID) {
			await scope.editReply({ content: `Error getting guild ID` });
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
		const guildID = scope.guildId;
		if (!guildID) {
			await scope.editReply({ content: `Error getting guild ID` });
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

		await scope.editReply({ content: `Your balance is ${account.balance}` });
	}
}