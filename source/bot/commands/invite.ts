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


	return await scope.editReply({
		content: "[Invite Link](https://discord.com/api/oauth2/authorize?client_id=1133196823914369035&permissions=412316978240&scope=bot)"
	});
}