import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { prisma } from "../../db";
import { bot } from "../../logging";


export const name = "permissions";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription('Show a list of all permissions for this bot for the server');
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	await scope.deferReply({ephemeral: true});

	const guildID = scope.guildId;
	if (!guildID)
		return await scope.editReply({ content: `Error getting guild ID` });

	bot("INFO", `User[${scope.user.id}] is displaying permissions in guild[${guildID}]`);

	// Check account exists
	const guild = await prisma.guild.findFirst({
		where: { id: guildID },
		include: { adminRoles: true, adminUsers: true }
	});
	if (!guild)
		return await scope.editReply({ content: `Error loading guild` });

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle("Open Predictions")
		.setDescription(`Creating a prediction ${guild.restricted ? "is" : "is not"} restricted to these users and roles`)
		.addFields({
			name: "Roles",
			value: guild.adminRoles.length < 1 ? "None" :
				guild.adminRoles.map(x => `- <@&${x.roleID}>`).join("\n")
		},{
			name: "Users",
			value: guild.adminUsers.length < 1 ? "None" :
				guild.adminUsers.map(x => `- <@${x.userID}>`).join("\n")
		})
		.setFooter({
			text: "Update permissions with /permission"
		})
		.setTimestamp();

	await scope.editReply({ content: "", embeds: [ embed ] });
}