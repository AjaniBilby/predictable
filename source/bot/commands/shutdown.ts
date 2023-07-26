import type { ChatInputCommandInteraction, CacheType } from "discord.js";
import type { CommandBinding } from "./index";

import { SlashCommandBuilder } from "discord.js";


export const bind: CommandBinding = {
	data: new SlashCommandBuilder()
		.setName('shutdown')
		.setDescription('Check your account balance'),
	execute: async (scope: ChatInputCommandInteraction<CacheType>) => {
		await scope.deferReply({ephemeral: true});

		scope.client.destroy();

		setTimeout(async ()=>{
			await scope.editReply({ content: "Dead Jim" });
		}, 5000);
	}
}