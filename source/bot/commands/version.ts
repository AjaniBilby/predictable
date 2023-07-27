import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";

import { version } from "../../version";

export const name = "version";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription('Check what version number of the bot is responding');
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	await scope.reply({ content: `Version ${version}`, ephemeral: true });
}