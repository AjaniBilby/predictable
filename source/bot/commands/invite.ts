import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";
import { prisma } from "../../db";


export const name = "invite";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription('Invite this bot to another server');
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	await scope.deferReply({ephemeral: true});

	return await scope.editReply({content: "This bot is currently in beta, so no inviting to random servers :pout:"});


	const link = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=412316978240&scope=bot`;
	return await scope.editReply({
		content: "[Invite Link](${link})"
	});
}