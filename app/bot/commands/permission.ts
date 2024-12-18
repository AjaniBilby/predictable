import { type ChatInputCommandInteraction, type CacheType, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { prisma } from "../../db";


export const name = "permission";

export function bind() {
	return new SlashCommandBuilder()
		.setName(name)
		.setDescription('Update permissions for people to use the bot')
		.addStringOption(builder => builder
				.setName('type')
				.setDescription("Are you adding or removing this role/user?")
				.addChoices(
					{ name: "Add",    value: "add"    },
					{ name: "Remove", value: "remove" }
				)
				.setRequired(true)
		)
		.addRoleOption(builder => builder
			.setName('role')
			.setDescription("Add/remove a specific role as an admin for this bot")
			.setRequired(false)
		)
		.addUserOption(builder => builder
			.setName('user')
			.setDescription("Add/remove a specific user as an admin for this bot")
			.setRequired(false)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	await scope.deferReply({ephemeral: true});

	const guildID = scope.guildId;
	if (!guildID) return await scope.editReply({ content: `Error getting guild ID` });

	const type = scope.options.getString("type");
	const user = scope.options.getUser("user");
	const role = scope.options.getRole("role");

	if (type === "remove") {
		if (user) {
			await prisma.adminUsers.delete({
				where: {guildID_userID: {
					guildID, userID: user.id
				}}
			});
		}
		if (role) {
			await prisma.adminRoles.delete({
				where: {guildID_roleID: {
					guildID, roleID: role.id
				}}
			});
		}
	} else {
		if (user) {
			await prisma.adminUsers.upsert({
				where: {guildID_userID: {
					guildID, userID: user.id
				}},
				create: {
					guildID, userID: user.id
				},
				update: {}
			});
		}
		if (role) {
			await prisma.adminRoles.upsert({
				where: {guildID_roleID: {
					guildID, roleID: role.id
				}},
				create: {
					guildID, roleID: role.id
				},
				update: {}
			});
		}
	}


	await scope.editReply({ content: `Updated permissions` });
}