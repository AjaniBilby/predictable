import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";
import { randomBytes } from "node:crypto";
import { GetAccount } from "../account";
import { prisma } from "../../db";
import { delay } from "../../helper";
import { bot } from "../../logging";


export const name = "login";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription('Login to the website');
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	const msg = await scope.deferReply({ephemeral: true});

	// Check guild exists
	const userID = scope.user.id;
	if (!userID) {
		await scope.editReply({ content: `Error getting user ID` });
		return;
	}

	// Check guild exists
	const guildID = scope.guildId;
	if (!guildID) {
		await scope.editReply({ content: `Error getting guild ID` });
		return;
	}

	// Init account
	await GetAccount(userID, guildID);

	bot("INFO", `Creating login token for User[${userID}]`);
	const session = randomBytes(45).toString('base64')
		.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	await prisma.user.update({
		where: { id: userID },
		data: {
			session
		}
	});

	await scope.editReply({ content:
		`Here is your login url, don't share this with anyone\n`+
		`||${process.env.WEBSITE_URL}/auth/${userID}/${session}||`
	});

	await delay(5000);
	await msg.delete();
}