import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";
import { prisma } from "../../db";


export const name = "server";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription('Check the server balance')
		.addBooleanOption(builder =>
			builder.setName("public")
				.setDescription("Show this publicly, or else only you will see it")
		);
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	const isPublic = scope.options.getBoolean("public") || false;
	await scope.deferReply({ephemeral: isPublic});

	// Check guild exists\
	const guildID = scope.guildId;
	if (!guildID)
		return await scope.editReply({ content: `Error getting guild ID` });

	const guild =	await prisma.guild.findFirst({
		where: {
			id: guildID
		}
	});

	if (!guild)
		return await scope.editReply({ content: `Error loading guild` });

	await scope.editReply({ content: `Server's kitty ${guild.kitty}` });
}