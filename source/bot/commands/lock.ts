import { type ChatInputCommandInteraction, type CacheType, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { prisma } from "../../db";
import { bot } from "../../logging";


export const name = "lock";

export function bind() {
	return new SlashCommandBuilder()
		.setName(name)
		.setDescription('Only allow users with permission to create predictions')
		.addBooleanOption(builder =>
			builder.setName("restricted")
				.setDescription("If true only people specified by the permissions can create predictions")
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	await scope.deferReply({ephemeral: true});

	const restricted = scope.options.getBoolean("restricted") || false;

	const guildID = scope.guildId;
	if (!guildID)
		return await scope.editReply({ content: `Error getting guild ID` });

	bot("INFO", `User[${scope.user.id}] is setting restricted to ${restricted} in guild[${guildID}]`);
	await prisma.guild.upsert({
		where: {
			id: guildID
		},
		create: {
			id: guildID,
			restricted
		},
		update: {
			restricted
		}
	});


	await scope.editReply({ content: `Updated restriction to ${restricted}` });
}