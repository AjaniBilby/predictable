import { type ChatInputCommandInteraction, type CacheType, type SlashCommandSubcommandBuilder, EmbedBuilder } from "discord.js";
import { prisma } from "../../db";
import { GetAccount, GetAuthorDetails } from "../account";


export const name = "donate";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription(`Get a ko-fi link to donate to the bot's creator`)
		.addBooleanOption(builder =>
			builder.setName("public")
				.setDescription("Show this publicly, or else only you will see it")
		);
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	const isPublic = scope.options.getBoolean("public") || false;
	await scope.deferReply({ephemeral: !isPublic});

	// const embed = new EmbedBuilder()
	// 	.setColor(0x0099FF)
	// 	.setTitle("Info")
	// 	.setAuthor(await GetAuthorDetails(userID, guildID))
	// 	.setURL(`${process.env.WEBSITE_URL}/server/${guildID}/u/${userID}`)
	// 	.setDescription(
	// 		`Balance \`\$${account.balance}\`\n` +
	// 		`Betting \`\$${assets}\`\n` +
	// 		`Net     \`\$${assets+account.balance}\``
	// 	)
	// 	.setTimestamp();

	await scope.editReply({ content: "https://ko-fi.com/ajanibilby", embeds: [ ] });
}