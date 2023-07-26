import type { SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from "discord.js";
import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv"
dotenv.config();


// Manual ingest for esbuild
import * as AutoRefundCmd from "./auto-refund";
import * as BalanceCmd from "./balance";
import * as BankruptCmd from "./bankrupt";
import * as ListCmd from "./list";
import * as Predict from "./predict";
import * as Version from "./version";
const ingest = [ AutoRefundCmd, BalanceCmd, BankruptCmd, ListCmd, Predict, Version ];


export interface CommandBinding {
	data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">,
	execute: (i: ChatInputCommandInteraction<CacheType>) => Promise<void>;
}


export const commands: Map<string, CommandBinding> = new Map();
const bindings = [];

for (const mod of ingest) {
	commands.set(mod.bind.data.name, mod.bind);
	bindings.push(mod.bind.data.toJSON());
}





// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN || "");

(async () => {
	try {
		console.log(`Started refreshing ${bindings.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(
			Routes.applicationCommands(process.env.DISCORD_CLIENT_ID || ""),
			{ body: bindings },
		);

		console.log(`Successfully reloaded ${data?.length} application ${
			[...commands.keys()].map(x => "/"+x).join(" ")
		} commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();