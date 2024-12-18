import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";

import { GetAccount } from "~/bot/account";
import { prisma } from "~/db";
import { bot } from "~/logging";


export const name = "transfer";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription('Transfer money to a friend')
		.addIntegerOption(builder => builder
			.setName('amount')
			.setDescription("How much do you want to transfer?")
			.setRequired(true)
		)
		.addUserOption(builder => builder
			.setName('user')
			.setDescription("Who are you sending it to?")
			.setRequired(true)
		)
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	await scope.deferReply({ephemeral: true});

	const amount = scope.options.getInteger("amount");
	const toUser = scope.options.getUser("user");
	if (!toUser) return await scope.editReply({ content: `Error getting target user` });
	if (!amount || amount < 1) return await scope.editReply({ content: `Invalid amount` });

	const guildID = scope.guildId;
	const userID  = scope.user.id;
	if (!userID)
		return await scope.editReply({ content: `Error getting your user ID` });
	if (!guildID)
		return await scope.editReply({ content: `Error getting guild ID` });


	// Check account exists
	const fromAcc = await GetAccount(userID, guildID);
	if (!fromAcc) return await scope.editReply({ content: `Error loading your account` });
	const toAcc = await GetAccount(toUser.id, guildID);
	if (!toAcc) return await scope.editReply({ content: `Error loading the account you're sending to` });

	if (fromAcc.balance - amount < 1) {
		await scope.editReply({ content: `You don't have enough money for this transfer` });
		return;
	}

	bot("INFO", `Transferring ${amount} from User[${userID}] to User[${toUser}] in guild[${guildID}]`);

	const [updatedFrom, updatedTo] = await prisma.$transaction([
		prisma.account.update({
			where: { guildID_userID: { userID, guildID } },
			data: { balance: { decrement: amount } }
		}),
		prisma.account.update({
			where: { guildID_userID: { userID: toUser.id, guildID } },
			data: { balance: { increment: amount } }
		})
	]);

	await scope.editReply({ content: `Your balance is ${updatedFrom.balance}` });

	await scope.followUp({ content: `<@${fromAcc.userID}> sent \$${amount} to <@${toAcc.userID}>` })
}