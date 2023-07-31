import type { Client } from "discord.js";
import {
	ActionRowBuilder,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { Prediction } from "@prisma/client";
import { prisma } from "../db";
import { GetAuthorDetails } from "./account";

export async function UpdatePrediction(client: Client<true>, predictionID: string) {
	const prediction = await prisma.prediction.findFirst({
		where: {
			id: predictionID
		},
		include: {
			options: {
				orderBy: [
					{ index: "asc" }
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
		.setPlaceholder('Make a wager!')
		.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel("No Vote")
				.setValue('nil')
		);

	const authDetails = await GetAuthorDetails(prediction.authorID, prediction.guildID);
	const pred = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(prediction.title)
		.setURL(`${process.env.WEBSITE_URL}/server/${prediction.guildID}/p/${prediction.id}`)
		.setAuthor(authDetails)
		.setFooter({
			text: `State: ${prediction.status.toLowerCase()}`
		})
		.setTimestamp();
	if (prediction.image)       pred.setImage(prediction.image);
	if (prediction.description) pred.setDescription(prediction.description);

	const odds = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`Betting Odds`)
		.setFooter({text: `Estimates based on wager trends`})
		.setTimestamp();


	// Calculate stats
	let totalPeople = 0;
	let totalAmount = 0;
	const votes = [];
	for (const _ of prediction.options) {
		votes.push({
			people: 0,
			amount: 0
		})
	}
	for (const wager of prediction.wagers) {
		const cell = votes[wager.choice];
		if (!cell) continue;

		cell.amount += wager.amount;
		totalAmount += wager.amount;
		cell.people++;
		totalPeople++;
	}
	totalPeople++;



	const lines = [];
	for (const opt of prediction.options) {
		// Drop down options
		choice.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel(`${opt.index+1}. ${opt.text}`)
				.setValue(`opt${opt.index}`)
		)

		// Embed options list
		const cell = votes[opt.index];
		lines.push(`${opt.index+1}. ${opt.text}\n  ${cell.people} :ballot_box:   ${cell.amount} :moneybag:`);

		// Option odds
		const offsetPeople = cell.people + 1;
		const pop  = Math.floor(offsetPeople/totalPeople*100).toString().padStart(3, " ");
		const earn = Math.floor((totalAmount - cell.amount) / (cell.people+1)).toString();
		odds.addFields({
			name: opt.text,
			value: `:ballot_box: ${pop}%\n:moneybag: \$${earn}`,
			inline: true
		})
	}
	odds.addFields({
		name: "*",
		value: `:ballot_box: *Predicted Chance*\n:moneybag: *Potential Earnings*`,
		inline: false
	})

	pred.addFields({
		name: "Options",
		value: lines.length == 0 ?
			"None" :
			lines.join("\n")
	})

	await message.edit({
		content: "",
		embeds: [ pred, odds ],
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