import { Client, Events, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();


export const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
]});

client.once(Events.ClientReady, c => {
	console.log(`Connected to discord as ${c.user.tag}`);
	// client.destroy();
});
// client.token = process.env.DISCORD_BOT_TOKEN || null;
client.login(process.env.DISCORD_BOT_TOKEN);