import type { ChatInputCommandInteraction, CacheType } from "discord.js";
import type { CommandBinding } from "./index";

import { SlashCommandBuilder } from "discord.js";
import { prisma } from "../../db";


export const bind: CommandBinding = {
	data: new SlashCommandBuilder()
		.setName('version')
		.setDescription('Check what version number of the bot is responding'),
	execute: async (scope: ChatInputCommandInteraction<CacheType>) => {
		await scope.reply({ content: "Version 0.0.2" });
	}
}