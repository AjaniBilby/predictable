import type { SlashCommandSubcommandBuilder } from "discord.js";
import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from "discord.js";
import { REST, Routes } from "discord.js";
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
}





// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN || "");

(async () => {
	try {
		console.log(`Binding commands`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(
			Routes.applicationCommands(process.env.DISCORD_CLIENT_ID || ""),
			{ body: [root.toJSON()] },
		);

		const keys = [...commands.keys()];
		console.log(`Successfully reloaded ${data?.length} application binding ${
			keys.join(" ")
		} commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();