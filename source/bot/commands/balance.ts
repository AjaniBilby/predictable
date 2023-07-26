import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";
import { prisma } from "../../db";


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
	await prisma.user.upsert({
		where: {
			id: userID
		},
		create: {
			id: userID
		},
		update: {}
	});

	// Check guild exists
	const guildID = scope.guildId;
	if (!guildID) {
		await scope.editReply({ content: `Error getting guild ID` });
		return;
	}
	await prisma.guild.upsert({
		where: {
			id: guildID
		},
		create: {
			id: guildID,
			kitty: 0
		},
		update: {}
	});

	// Check account exists
	const account = await prisma.account.upsert({
		where: {
			guildID_userID: {
				userID, guildID
			}
		},
		create: {
			userID, guildID,
			balance: 100
		},
		update: {}
	});

	await scope.editReply({ content: `Your balance is ${account.balance}` });
}