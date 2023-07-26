import type { CacheType, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import * as dotenv from "dotenv"
dotenv.config();


// Manual ingest for esbuild
import * as AutoRefundCmd from "./auto-refund";
import * as BalanceCmd from "./balance";
import * as BankruptCmd from "./bankrupt";
import * as ListCmd from "./list";
import * as Predict from "./create";
import * as VersionCmd from "./version";

export interface CommandBinding {
	name: string,
	bind: (subcommand: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder;
	execute: (i: ChatInputCommandInteraction<CacheType>) => Promise<void>;
}

const ingest: CommandBinding[] = [ AutoRefundCmd, BalanceCmd, BankruptCmd, ListCmd, Predict, VersionCmd ];


export const commands: Map<string, CommandBinding> = new Map();
const root = new SlashCommandBuilder()
	.setName("prediction")
	.setDescription("All commands for the prediction bot are sub-commands of this one")

for (const mod of ingest) {
	commands.set(mod.name, mod);
	root.addSubcommand(mod.bind);
}

export async function execute(scope: ChatInputCommandInteraction<CacheType>) {
	if (scope.commandName !== "prediction") {
		scope.reply({content: "Unknown command", ephemeral: true});
		return;
	}

	const cmdName = scope.options.getSubcommand();
	const command = commands.get(cmdName);
	if (!command) {
		console.error(`No command matching ${cmdName} was found.`);
		return;
	}

	await command.execute(scope);
}



export function ExportBindings() {
	return [ root.toJSON() ]
}