import type { CacheType, ContextMenuCommandInteraction, ContextMenuCommandType } from "discord.js";
import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
} from "discord.js";

export const name = "See Profile";

export function bind() {
	return new ContextMenuCommandBuilder()
		.setName(name)
		.setType(ApplicationCommandType.User as ContextMenuCommandType)
}

export async function execute(scope: ContextMenuCommandInteraction<CacheType>) {
	const userID = scope.targetId || "";
	await scope.deferReply({ephemeral: true});

	// Check guild exists
	const guildID = scope.guildId;
	if (!guildID) {
		await scope.editReply({ content: `Error getting guild ID` });
		return;
	}

	await scope.editReply({ content: `<@${userID}>'s profile\n${process.env.WEBSITE_URL}/server/${guildID}/u/${userID}` });
}