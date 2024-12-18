import type { CacheType } from "discord.js";
import {
	ModalSubmitInteraction,
} from "discord.js";
import { prisma } from "../../db";
import { UpdatePrediction } from "../prediction";
import { GetAccount } from "../account";
import { bot } from "../../logging";

export const name = "^create-prediction$";

export async function execute(scope: ModalSubmitInteraction<CacheType>) {
	const title        = scope.fields.getTextInputValue('title')?.trim() || "Unknown Title";
	const image        = scope.fields.getTextInputValue('image')?.trim() || "";
	const description  = scope.fields.getTextInputValue('desc')?.trim()  || "";
	const body         = scope.fields.getTextInputValue('body')?.trim()  || "";

	await scope.deferReply();

	// Check guild exists
	const userID = scope.user.id;
	if (!userID) {
		await scope.reply({ content: `Error getting guild ID` });
		return;
	}

	// Check guild exists
	const channelID = scope.channelId;
	const guildID   = scope.guildId;
	if (!guildID) {
		await scope.editReply({ content: `Error getting guild ID` });
		return;
	}
	if (!channelID) {
		await scope.editReply({ content: `Error getting channel ID` });
		return;
	}

	bot("INFO", `User[${scope.user.id}] is creating a poll in guild[${guildID}].channel[${channelID}]`);

	// This ensures the account exists, and all other required entities
	await GetAccount(userID, guildID);

	const options: string[] = body.split("\n").map(x => x.trim());
	const msg = await scope.editReply({ content: "Generating embed..." });

	await prisma.prediction.create({
		data: {
			id: msg.id,
			authorID: userID,
			guildID, channelID,

			title, description, image,
			answer: -1,
			status: "OPEN",

			options: {
				create: options.map((x, index) => ({index, text: x}))
			}
		}
	});

	await UpdatePrediction(scope.client, msg.id);
}