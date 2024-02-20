import { type ChatInputCommandInteraction, type CacheType, type SlashCommandSubcommandBuilder } from "discord.js";

export const name = "help";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription('Get a list of commands and guides for this bot');
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	await scope.reply(`[Commands](${process.env.WEBSITE_URL}/command)\n[Guides](${process.env.WEBSITE_URL}/guide)`);
}