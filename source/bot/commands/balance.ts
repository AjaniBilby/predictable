import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";
import { GetAccount } from "../account";


export const name = "balance";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription('Check your account balance')
		.addBooleanOption(builder =>
			builder.setName("public")
				.setDescription("Show this publicly, or else only you will see it")
		);
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	const isPublic = scope.options.getBoolean("public") || false;
	await scope.deferReply({ephemeral: !isPublic});

	// Check guild exists
	const userID = scope.user.id;
	if (!userID) {
		await scope.editReply({ content: `Error getting user ID` });
		return;
	}

	// Check guild exists
	const guildID = scope.guildId;
	if (!guildID) {
		await scope.editReply({ content: `Error getting guild ID` });
		return;
	}

	const account = await GetAccount(userID, guildID);
	await scope.editReply({ content: `Your balance is ${account.balance}` });
}