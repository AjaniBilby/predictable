import type { CacheType, ContextMenuCommandInteraction, ContextMenuCommandType } from "discord.js";
import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";

import { GetAccount } from "~/bot/account";

export const name = "See Balance";

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

	const account = await GetAccount(userID, guildID);
	await scope.editReply({ content: `<@${userID}>'s balance is ${account.balance}` });
}