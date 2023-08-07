import { type ChatInputCommandInteraction, type CacheType, type SlashCommandSubcommandBuilder, EmbedBuilder } from "discord.js";
import { prisma } from "../../db";


export const name = "leaderboard";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription('Check the server\' leaderboard')
		.addBooleanOption(builder =>
			builder.setName("public")
				.setDescription("Show this publicly, or else only you will see it")
		);
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	const isPublic = scope.options.getBoolean("public") || false;
	await scope.deferReply({ephemeral: !isPublic});

	// Check guild exists
	const guildID = scope.guildId;
	if (!guildID)
		return await scope.editReply({ content: `Error getting guild ID` });

	const guild = await prisma.guild.findFirst({
		where: {
			id: guildID
		},
		include: {
			accounts: {
				orderBy: [
					{balance: "desc"}
				]
			}
		}
	});

	if (!guild) return await scope.editReply({ content: `Error loading guild` });

	const dGuild = await scope.client.guilds.fetch(guildID);

	const serverLink = `${process.env.WEBSITE_URL}/server/${guildID}`;
	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle("Leaderboard")
		.setAuthor({ name: dGuild.name, iconURL: dGuild.iconURL() || undefined })
		.setDescription(
			guild.accounts
				.slice(0, 10)
				.map((x, i) => `\`#${i+1}\` <@${x.userID}> \`\$${x.balance}\``)
				.join("\n")
			+ (guild.accounts.length > 10 ?
				`\n\n [See ${guild.accounts.length - 10} More](${serverLink})` :
				`\n\n [See More Details](${serverLink})` )
		)
		.setTimestamp();

	await scope.editReply({ content: "", embeds: [ embed ] });
}