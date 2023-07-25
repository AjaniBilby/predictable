import type { ChatInputCommandInteraction, CacheType } from "discord.js";
import type { CommandBinding } from "./index";

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { prisma } from "../../db";


export const bind: CommandBinding = {
	data: new SlashCommandBuilder()
		.setName('predict-list')
		.setDescription("Refund any predictions which are still open, but their message has been deleted"),
	execute: async (scope: ChatInputCommandInteraction<CacheType>) => {
		await scope.deferReply({ephemeral: true});

		const guildID = scope.guildId;
		const userID  = scope.user.id;

		if (!userID) {
			await scope.editReply({ content: `Error getting guild ID` });
			return;
		}
		if (!guildID) {
			await scope.editReply({ content: `Error getting guild ID` });
			return;
		}

		// Check account exists
		const predictions = await prisma.prediction.findMany({
			where: { guildID, status: "OPEN" },
		});

		console.log(predictions);

		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle("Open Predictions")
			.setDescription(
				predictions
					.map(pred => `[${pred.title}](https://discord.com/channels/${pred.guildID}/${pred.channelID}/${pred.id})`)
					.join("\n")
			)
			.setTimestamp();

		await scope.editReply({ content: "", embeds: [ embed ] });
	}
}