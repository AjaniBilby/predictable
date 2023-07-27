import { createWriteStream  } from "node:fs";
import {
	Client,
	Events,
	GatewayIntentBits,
	REST,
	Routes
} from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

import * as Command from "./commands/index";
import * as Select from "./select/index";
import * as Modal from "./modal/index";
import * as Menu  from "./menu/index";

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
] });

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});


client.on(Events.InteractionCreate, async (scope) => {
	if (
		!scope.isContextMenuCommand() &&
		!scope.isChatInputCommand() &&
		!scope.isStringSelectMenu() &&
		!scope.isModalSubmit()
	) return;

	try {
		if (scope.isContextMenuCommand()) {
			await Menu.execute(scope);
			return;
		} else if (scope.isChatInputCommand()) {
			await Command.execute(scope);
			return;
		} else if (scope.isStringSelectMenu()) {
			await Select.execute(scope);
			return;
		} else if (scope.isModalSubmit()) {
			await Modal.execute(scope);
			return;
		}
	} catch (e) {
		console.error(e);
		if (scope.replied || scope.deferred) {
			await scope.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			return;
		} else {
			await scope.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			return;
		}
	}
});

client.login(process.env.DISCORD_BOT_TOKEN);


// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN || "");
(async () => {
	try {
		console.log(`Binding commands`);

		// The put method is used to fully refresh all commands in the guild with the current set
		await rest.put(
			Routes.applicationCommands(process.env.DISCORD_CLIENT_ID || ""),
			{ body: Command.ExportBindings().concat(Menu.ExportBindings() as any) },
		);

		console.log(`Successfully bound commands and context menus.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();


process.on('SIGTERM', () => {
	client.destroy();
})
process.on('SIGHUP', () => {
	client.destroy();
})


// Pipe outputs to log file
// const out = createWriteStream('./out.log', {flags: 'a'});
// process.stdout.pipe(out);
// process.stderr.pipe(out);