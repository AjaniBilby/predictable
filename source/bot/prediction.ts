import {
	ActionRowBuilder,
	CacheType,
	EmbedBuilder,
	ModalSubmitInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { prisma } from "../db";

export async function CreatePrediction(scope: ModalSubmitInteraction<CacheType>) {
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

	const choice = new StringSelectMenuBuilder()
		.setCustomId('choice')
		.setPlaceholder('Make a selection!')
		.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel("No Vote")
				.setValue('nil')
		);

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(title)
		.setAuthor({ name: scope.user.username, iconURL: scope.user.avatarURL() || "" })
		.setTimestamp();
	if (image)       embed.setImage(image);
	if (description) embed.setDescription(description);

	const options: string[] = body.split("\n").map(x => x.trim());
	for (const [i, opt] of options.entries()) {
		choice.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel(opt)
				.setValue(`opt${i}`)
		)
	}

	embed.addFields({
		name: "Options",
		value: options.map(x => `- ${x}`).join("\n")
	})

	const msg = await scope.editReply({
		content: "",
		embeds: [ embed ],
		components: [
			new ActionRowBuilder().addComponents(choice)
		] as any,
	});

	await prisma.prediction.create({
		data: {
			id: msg.id,
			authorID: userID,
			guildID, channelID,

			title, description,
			answer: -1,
			status: "OPEN",

			options: {
				create: options.map((x, index) => ({index, text: x}))
			}
		}
	});
}