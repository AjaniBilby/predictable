import type { CacheType, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

import * as Log from "~/logging";

import * as PermissionCmd from "~/bot/commands/permission";
import * as LockCmd       from "~/bot/commands/lock";

// Manual ingest for esbuild
import * as AutoRefundCmd  from "~/bot/commands/auto-refund";
import * as BalanceCmd     from "~/bot/commands/balance";
import * as BankruptCmd    from "~/bot/commands/bankrupt";
import * as DonateCmd      from "~/bot/commands/donate";
import * as HelpCmd        from "~/bot/commands/help";
import * as InfoCmd        from "~/bot/commands/info";
import * as InviteCmd      from "~/bot/commands/invite";
import * as LeaderboardCmd from "~/bot/commands/leaderboard";
import * as ListCmd        from "~/bot/commands/list";
import * as LoginCmd       from "~/bot/commands/login";
import * as MintCmd        from "~/bot/commands/mint";
import * as PermissionList from "~/bot/commands/list-permissions";
import * as PredictCmd     from "~/bot/commands/create";
import * as TransferCmd    from "~/bot/commands/transfer";
import * as VersionCmd     from "~/bot/commands/version";

export interface CommandBinding {
	name: string,
	bind: (subcommand: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder;
	execute: (i: ChatInputCommandInteraction<CacheType>) => Promise<any>;
}

const ingest: CommandBinding[] = [
	AutoRefundCmd,
	BalanceCmd, BankruptCmd,
	DonateCmd,
	HelpCmd,
	InfoCmd, InviteCmd,
	LeaderboardCmd, ListCmd, LoginCmd,
	PermissionList, PredictCmd,
	TransferCmd, VersionCmd,
];


export const commands: Map<string, CommandBinding> = new Map();
const root = new SlashCommandBuilder()
	.setName("prediction")
	.setDescription("All commands for the prediction bot are sub-commands of this one")

for (const mod of ingest) {
	commands.set(mod.name, mod);
	root.addSubcommand(mod.bind);
}

export async function execute(scope: ChatInputCommandInteraction<CacheType>) {
	if (scope.commandName === "permission") return PermissionCmd.execute(scope);

	switch (scope.commandName) {
		case PermissionCmd.name: return PermissionCmd.execute(scope);
		case LockCmd.name: return LockCmd.execute(scope);
		case MintCmd.name: return MintCmd.execute(scope);
	}

	if (scope.commandName !== "prediction") return await scope.reply({content: "Unknown top level command", ephemeral: true})

	const cmdName = scope.options.getSubcommand();
	const command = commands.get(cmdName);
	if (!command) {
		Log.bot("ERR", `No command matching ${cmdName} was found.`);
		return;
	}

	await command.execute(scope);
}



export function ExportBindings() {
	return [
		root.toJSON(),
		...[ PermissionCmd, MintCmd, LockCmd ].map(x => x.bind().toJSON())
	]
}