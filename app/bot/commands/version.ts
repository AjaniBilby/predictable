import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";
import { EmbedBuilder } from "discord.js";

import { version } from "~/version";

export const name = "version";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription('Check what version number of the bot is responding');
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`Version ${version}`)
		.setURL(`https://github.com/AjaniBilby/predictable/`);

	await scope.reply({ content: "", embeds: [ embed ], ephemeral: true });
}