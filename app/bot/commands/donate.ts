import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";

export const name = "donate";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription(`Get a ko-fi link to donate to the bot's creator`)
		.addBooleanOption(builder =>
			builder.setName("public")
				.setDescription("Show this message publicly, or else only you will see it")
		);
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	const isPublic = scope.options.getBoolean("public") || false;
	await scope.deferReply({ephemeral: !isPublic});

	await scope.editReply({ content: "Support my creator here!\nhttps://ko-fi.com/ajanibilby", embeds: [ ] });
}