import {
	ActivityType,
	Events,
	REST,
	Routes
} from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

import * as Button from "./button/index";
import * as Command from "./commands/index";
import * as Select from "./select/index";
import * as Modal from "./modal/index";
import * as Menu from "./menu/index";

import * as Log from "../logging";

import { client } from "./client";

client.on("ready", () =>{
	if (!client.user) return;

	client.user.setPresence({
		activities: [{ name: "winning it back next round!", type: ActivityType.Competing }],
		status: 'online'
	});
});

client.on(Events.InteractionCreate, async (scope) => {
	if (
		!scope.isContextMenuCommand() &&
		!scope.isChatInputCommand() &&
		!scope.isStringSelectMenu() &&
		!scope.isModalSubmit() &&
		!scope.isButton()
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
		} else if (scope.isButton()) {
			await Button.execute(scope);
			return;
		} else {
			return;
		}
	} catch (e: any) {
		Log.bot("CRIT", e.stack || e.toString());
		if (scope.replied || scope.deferred) {
			await scope.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			return;
		} else {
			await scope.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			return;
		}
	}
});


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
	} catch (e: any) {
		Log.bot("ERR", e.stack || e.toString());
	}
})();