import { type ChatInputCommandInteraction, type CacheType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { GetAccount } from "../account";
import { prisma } from "../../db";
import { bot } from "../../logging";


export const name = "mint";

export function bind() {
	return new SlashCommandBuilder()
		.setName(name)
		.setDescription('Mint money to a person')
		.addIntegerOption(builder => builder
			.setName('amount')
			.setDescription("How much do you want to create?")
			.setRequired(true)
		)
		.addUserOption(builder => builder
			.setName('user')
			.setDescription("Who are you sending it to?")
			.setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	await scope.deferReply({ephemeral: false});

	const amount = scope.options.getInteger("amount");
	const toUser = scope.options.getUser("user");
	if (!toUser) return await scope.editReply({ content: `Error getting target user` });
	if (!amount || !Number.isInteger(amount)) return await scope.editReply({ content: `Invalid amount` });

	const guildID = scope.guildId;
	const userID  = scope.user.id;
	if (!userID)  return await scope.editReply({ content: `Error getting your user ID` });
	if (!guildID) return await scope.editReply({ content: `Error getting guild ID` });


	// Check account exists
	const toAcc = await GetAccount(toUser.id, guildID);
	if (!toAcc) return await scope.editReply({ content: `Error loading the account you're sending to` });

	bot("INFO", `Minting ${amount} to User[${toUser}] in guild[${guildID}] by User[${userID}]`);

	await prisma.account.update({
		where: { guildID_userID: { userID: toUser.id, guildID } },
		data: { balance: { increment: amount } }
	});

	await scope.followUp({ content: `<@${userID}> minted \$${amount} to <@${toAcc.userID}>` })
}