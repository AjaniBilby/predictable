import {
	Client,
	Events,
	GatewayIntentBits
} from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

export const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
] });

client.login(process.env.DISCORD_BOT_TOKEN);

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

process.on('SIGTERM', () => {
	client.destroy();
})
process.on('SIGHUP', () => {
	client.destroy();
})