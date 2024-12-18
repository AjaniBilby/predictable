import {
	ActivityType,
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
	console.info(`Ready! Logged in as ${c.user.tag}`);
});

process.on('SIGUSR1', () => {
	if (!client.user) return;

	client.user.setPresence({
		activities: [{ name: "Upgrade", type: ActivityType.Streaming }],
		status: 'idle'
	});
})

process.on('SIGTERM', () => {
	client.destroy();
})
process.on('SIGHUP', () => {
	client.destroy();
})


export function fetchWrapper<T>(p: Promise<T>): Promise<T | null> {
	return new Promise((res) => {
		p.then(res).catch(_ => res(null))
	});
}