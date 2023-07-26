import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";
import { prisma } from "../../db";


export const name = "bankrupt";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription("Reset your account balance if you're in debt");
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	await scope.deferReply({ephemeral: true});

	const guildID = scope.guildId;
	const userID  = scope.user.id;

	if (!userID) {
		await scope.editReply({ content: `Error getting guild ID` });
		return;
	}
	if (!guildID) {
		await scope.editReply({ content: `Error getting guild ID` });
		return;
	}

	// Check account exists
	const account = await prisma.account.findFirst({
		where: { userID, guildID },
	});
	if (!account) {
		await scope.editReply({ content: `You don't have an account yet in this guild\nStart betting for your opening balance` });
		return;
	}

	if (account.balance > 1) {
		await scope.editReply({ content: `You can only declare bankrupt if your balance is less than 1\nYou've got to work your way up` });
		return;
	}

	const [updatedGuild, updatedAccount] = await prisma.$transaction([
		prisma.guild.update({
			where: { id: guildID },
			data: { kitty: { decrement: 2 } }
		}),
		prisma.account.update({
			where: { guildID_userID: { userID, guildID } },
			data: { balance: 2 }
		})
	]);

	await scope.editReply({ content: `Your balance is ${updatedAccount.balance}` });
}