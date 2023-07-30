import { type ChatInputCommandInteraction, type CacheType, type SlashCommandSubcommandBuilder, EmbedBuilder } from "discord.js";
import { prisma } from "../../db";
import { GetAccount } from "../account";
import { fetchWrapper } from "../client";


export const name = "info";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription(`Check user info`)
		.addBooleanOption(builder =>
			builder.setName("public")
				.setDescription("Show this publicly, or else only you will see it")
		)
		.addUserOption(builder => builder
			.setName('user')
			.setDescription("Who's profile do you want to look at")
			.setRequired(false)
		);
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	const isPublic = scope.options.getBoolean("public") || false;
	await scope.deferReply({ephemeral: !isPublic});

	const userID = scope.options.getUser("user")?.id || scope.user.id;

	// Check guild exists
	const guildID = scope.guildId;
	if (!guildID) return await scope.editReply({ content: `Error getting guild ID` });

	// Check account exists
	const account = await GetAccount(userID, guildID);
	if (!account) return await scope.editReply({ content: `Error loading your account` });

	const guild = await fetchWrapper(scope.client.guilds.fetch(guildID));
	if (!guild) return await scope.editReply({ content: `Error loading the guild from discord` });
	const member = await fetchWrapper(guild.members.fetch(userID));
	if (!member) return await scope.editReply({ content: `Error loading your account from discord` });

	const wagers = await prisma.wager.findMany({
		where: { userID: userID, prediction: { guildID, status: "OPEN" } },
	});
	const assets = wagers.reduce((s, x) => x.amount + s, 0)

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(member.nickname || member.displayName)
		.setURL(`https://predictable.ajanibilby.com/server/${guildID}/${userID}`)
		.setDescription(
			`Balance \`\$${account.balance}\`\n` +
			`Betting \`\$${assets}\`\n` +
			`Net     \`\$${assets+account.balance}\``
		)
		.setTimestamp();

	await scope.editReply({ content: "", embeds: [ embed ] });
}