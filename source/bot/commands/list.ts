import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { prisma } from "../../db";


export const name = "list";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription('Show a list of all open predictions in this server')
		.addBooleanOption(builder =>
			builder.setName("public")
				.setDescription("Show this publicly, or else only you will see it")
		);
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	const isPublic = scope.options.getBoolean("public") || false;
	await scope.deferReply({ephemeral: isPublic});

	const guildID = scope.guildId;
	const userID  = scope.user.id;

	if (!userID) {
		await scope.editReply({ content: `Error getting guild ID` });
		return;
	}
	if (!guildID) {
		await scope.editReply({ content: `Error getting guild ID` });
		return;
	}

	// Check account exists
	const predictions = await prisma.prediction.findMany({
		where: { guildID, status: "OPEN" },
	});

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle("Open Predictions")
		.setDescription(
			predictions.length == 0 ?
				"None" :
				predictions
					.map(pred => `[${pred.title}](https://discord.com/channels/${pred.guildID}/${pred.channelID}/${pred.id})`)
					.join("\n")
		)
		.setTimestamp();

	await scope.editReply({ content: "", embeds: [ embed ] });
}