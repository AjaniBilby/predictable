import type { SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from "discord.js";
import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv"
import * as fs from "fs"
dotenv.config();



export interface CommandBinding {
	data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">,
	execute: (i: ChatInputCommandInteraction<CacheType>) => Promise<void>;
}



export const commands: Map<string, CommandBinding> = new Map();
const bindings = [];

const files = fs.readdirSync(__dirname)
	.filter(x => x.endsWith(".js") || x.endsWith(".ts"))
	.filter(x => !x.startsWith("index"));

for (const file of files) {
	const mod = require(`${__dirname}/${file}`).bind as CommandBinding;
	commands.set(mod.data.name, mod);
	bindings.push(mod.data.toJSON());
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

		console.log(data);

		console.log(`Successfully reloaded ${data?.length} application ${
			[...commands.keys()].map(x => "/"+x).join(" ")
		} commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();