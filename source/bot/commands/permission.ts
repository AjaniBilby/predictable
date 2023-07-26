import { type ChatInputCommandInteraction, type CacheType, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { prisma } from "../../db";


export const name = "permission";

export function bind() {
	return new SlashCommandBuilder()
		.setName(name)
		.setDescription('Check your account balance')
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

	scope.member?.flags


	await scope.editReply({ content: `Updated permissions` });
}