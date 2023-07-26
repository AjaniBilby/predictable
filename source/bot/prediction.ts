import type { Client } from "discord.js";
import {
	ActionRowBuilder,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { Prediction } from "@prisma/client";
import { prisma } from "../db";

export async function UpdatePrediction(client: Client<true>, predictionID: string) {
	const prediction = await prisma.prediction.findFirst({
		where: {
			id: predictionID
		},
		include: {
			options: {
				orderBy: [
					{ index: "desc" }
				]
			},
			wagers: true
		}
	});

	if (!prediction)
		return false;

	const message = await GetMessage(client, prediction);
	if (!message)
		return false;


	const choice = new StringSelectMenuBuilder()
		.setCustomId('choice')
		.setPlaceholder('Make a selection2!')
		.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel("No Vote")
				.setValue('nil')
		);

	const author = await client.users.fetch(prediction.authorID);

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(prediction.title)
		.setAuthor({ name: author.username, iconURL: author.avatarURL() || "" })
		.setTimestamp();
	if (prediction.image)       embed.setImage(prediction.image);
	if (prediction.description) embed.setDescription(prediction.description);

	const lines = [];
	for (const opt of prediction.options) {
		choice.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel(`${opt.index+1}. ${opt.text}`)
				.setValue(`opt${opt.index}`)
		)

		lines.push(`${opt.index+1}. ${opt.text}`);
	}

	embed.addFields({
		name: "Options",
		value: lines.join("\n")
	})

	await message.edit({
		content: "",
		embeds: [ embed ],
		components: [
			new ActionRowBuilder().addComponents(choice)
		] as any,
	});

	return true;
}



async function GetMessage(client: Client<true>, prediction: Prediction) {
	try {
		// Check valid guild
		const guild = await client.guilds.fetch(prediction.guildID);
		if (!guild)
			return null;

		// Check valid text channel
		const channel = guild.channels.cache.get(prediction.channelID);
		if (!channel)
			return null;
		if (!channel.isTextBased())
			return null;

		// Check valid message
		return await channel.messages.fetch(prediction.id);
	} catch (_) { }

	return null;
}