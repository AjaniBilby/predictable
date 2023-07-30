import { type ChatInputCommandInteraction, type CacheType, type SlashCommandSubcommandBuilder, EmbedBuilder } from "discord.js";

import { version, commit } from "../../version";

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
		.setURL(`https://github.com/AjaniBilby/predictable/commit/${commit}`)
		.setDescription(`Version ${version}\nCommit: ${commit}`)
		.setTimestamp();

	await scope.reply({ content: "", embeds: [ embed ], ephemeral: true });
}