import type { CacheType } from "discord.js";
import {
	ModalSubmitInteraction,
} from "discord.js";
import { prisma } from "../../db";
import { UpdatePrediction } from "../prediction";

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
	await prisma.user.upsert({
		where: {
			id: userID
		},
		create: {
			id: userID
		},
		update: {}
	});

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
	await prisma.guild.upsert({
		where: {
			id: guildID
		},
		create: {
			id: guildID,
			kitty: 0
		},
		update: {}
	});

	// Check account exists
	await prisma.account.upsert({
		where: {
			guildID_userID: {
				userID, guildID
			}
		},
		create: {
			userID, guildID,
			balance: 100
		},
		update: {}
	});

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