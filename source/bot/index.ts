import type { CacheType, ChatInputCommandInteraction, Message, StringSelectMenuInteraction } from "discord.js";
import {
	Client,
	Events,
	GatewayIntentBits,
	ModalSubmitInteraction,
} from "discord.js";
import * as dotenv from "dotenv"
dotenv.config();

import { commands } from "./commands/index"
import { PlaceWager, SetWagerAmount } from "./wager";
import { CreatePrediction } from "./prediction";

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
		await ProcessCommand(interaction);
	} else if (interaction.isStringSelectMenu()) {
		await ProcessSelect(interaction);
	} else if (interaction.isModalSubmit()) {
		await ProcessModal(interaction);
	}
});


async function ProcessCommand(interaction: ChatInputCommandInteraction<CacheType>) {
	if (interaction.commandName !== "prediction") {
		interaction.reply({content: "Unknown command", ephemeral: true});
		return;
	}

	const cmdName = interaction.options.getSubcommand();
	const command = commands.get(cmdName);
	if (!command) {
		console.error(`No command matching ${cmdName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
}

async function ProcessSelect(interaction: StringSelectMenuInteraction<CacheType>) {
	if (interaction.customId == "choice") {
		return PlaceWager(interaction);
	}
}

async function ProcessModal(interaction: ModalSubmitInteraction<CacheType>) {
	if (interaction.customId.startsWith("set-wager-")) {
		return await SetWagerAmount(interaction)
	} else if (interaction.customId == "create-prediction") {
		return await CreatePrediction(interaction);
	}
}


client.login(process.env.DISCORD_BOT_TOKEN);

process.on('SIGTERM', () => {
	client.destroy();
})