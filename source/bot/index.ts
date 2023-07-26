import type { CacheType, ChatInputCommandInteraction, StringSelectMenuInteraction } from "discord.js";
import {
	Client,
	Events,
	GatewayIntentBits,
} from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

import * as Command from "./commands/index";
import * as Select from "./select/index";
import * as Modal from "./modal/index";

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMessages,
] });

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});


client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
		await Command.execute(interaction);
	} else if (interaction.isStringSelectMenu()) {
		await Select.execute(interaction);
	} else if (interaction.isModalSubmit()) {
		await Modal.execute(interaction);
	}
});

client.login(process.env.DISCORD_BOT_TOKEN);

process.on('SIGTERM', () => {
	client.destroy();
})