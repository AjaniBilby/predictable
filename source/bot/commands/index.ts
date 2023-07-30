import type { CacheType, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import * as dotenv from "dotenv"
dotenv.config();

import * as Log from "../../logging";

import * as PermissionCmd from "./permission";
import * as LockCmd from "./lock";

// Manual ingest for esbuild
import * as AutoRefundCmd from "./auto-refund";
import * as BalanceCmd from "./balance";
import * as BankruptCmd from "./bankrupt";
import * as InfoCmd from "./info";
import * as ListCmd from "./list";
import * as LoginCmd from "./login";
import * as PermissionList from "./list-permissions";
import * as PredictCmd from "./create";
import * as TransferCmd from "./transfer";
import * as VersionCmd from "./version";

export interface CommandBinding {
	name: string,
	bind: (subcommand: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder;
	execute: (i: ChatInputCommandInteraction<CacheType>) => Promise<any>;
}

const ingest: CommandBinding[] = [
	AutoRefundCmd, BalanceCmd, BankruptCmd, InfoCmd, ListCmd, LoginCmd, PermissionList, PredictCmd, TransferCmd, VersionCmd
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
	if (scope.commandName === "permission")
		return PermissionCmd.execute(scope);

	if (scope.commandName === "lock")
		return LockCmd.execute(scope);

	if (scope.commandName !== "prediction")
		return await scope.reply({content: "Unknown top level command", ephemeral: true})

	const cmdName = scope.options.getSubcommand();
	const command = commands.get(cmdName);
	if (!command) {
		Log.bot("ERR", `No command matching ${cmdName} was found.`);
		return;
	}

	await command.execute(scope);
}



export function ExportBindings() {
	return [ root.toJSON(), PermissionCmd.bind().toJSON(), LockCmd.bind().toJSON() ]
}