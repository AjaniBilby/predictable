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
				],
				take: 10
			}
		}
	});

	if (!guild)
		return await scope.editReply({ content: `Error loading guild` });

	const dGuild = await scope.client.guilds.fetch(guildID);

	const serverLink = `https://predictable.ajanibilby.com/server/${guildID}`;
	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(dGuild.name)
		// .setAuthor({ name: dGuild.name, iconURL: dGuild.iconURL() || undefined })
		.setURL(serverLink)
		.setDescription(`Server's kitty has $${guild.kitty}`)
		.setTimestamp();

	const banner = dGuild.bannerURL();
	if (banner) {
		embed.setImage(banner);
	}

	const leaderboard = [];
	for (const account of guild.accounts) {
		const member = await dGuild.members.fetch(account.userID);
		const name = member.nickname || member.displayName;
		leaderboard.push(`[${name}](${serverLink}/${account.userID}) \`\$${account.balance}\``)
	}

	embed.addFields({
		name: "Leader Board",
		value: leaderboard.map((x, i) => `\`#${(i+1).toString().padEnd(2, "")}\` ${x}`).join("\n") +
			`\n  [See More](${serverLink})`
	})

	await scope.editReply({ content: "", embeds: [ embed ] });
}