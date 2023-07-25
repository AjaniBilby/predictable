import type { ChatInputCommandInteraction, CacheType, Client } from "discord.js";
import type { CommandBinding } from "./index";

import { SlashCommandBuilder } from "discord.js";
import { prisma } from "../../db";
import { Prediction } from "@prisma/client";


export const bind: CommandBinding = {
	data: new SlashCommandBuilder()
		.setName('predict-auto-refund')
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



		const res = await Promise.all( predictions.map(p => CheckAlive(scope.client, p)) );

		const invalid = predictions.filter((x, i) => res[i] === false);

		// TODO: apply refund
		// await prisma.prediction.deleteMany({
		// 	where: {
		// 		id: {in: invalid.map(x => x.id)}
		// 	}
		// });

		await scope.editReply({ content: `Found ${invalid.length}` });
	}
}


async function CheckAlive(client: Client<true>, prediction: Prediction): Promise<boolean> {
	try {
		const guild = await client.guilds.fetch(prediction.guildID);
		if (!guild) return false;
		const channel : any = guild.channels.cache.get(prediction.channelID);
		if (!channel) return false;
		const message = channel.messages.fetch(prediction.id);
		if (!message) return false;

	} catch (_) {
		return false;
	}

	return true;
}