import type { CacheType, ContextMenuCommandInteraction } from "discord.js";
import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
	EmbedBuilder,
} from "discord.js";
import { prisma } from "../../db";
import { fetchWrapper } from "../client";
import { GetAuthorDetails } from "../account";

export const name = "See Odds";

export function bind() {
	return new ContextMenuCommandBuilder()
		.setName(name)
		.setType(ApplicationCommandType.Message)
}

export async function execute(scope: ContextMenuCommandInteraction<CacheType>) {
	const pollID = scope.targetId || "";

	// This has to be false
	// Because if you're looking at a really old message to check the odds
	// When you scroll down to see it, the ephemeral will be gone
	await scope.deferReply({ephemeral: false});

	const prediction = await prisma.prediction.findFirst({
		where: {
			id: pollID
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
		return await scope.editReply("Cannot find prediction associated with message");

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

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`Odds: ${prediction.title}`)
		.setURL(`https://discord.com/channels/${prediction.guildID}/${prediction.channelID}/${prediction.id}`)
		.setAuthor(await GetAuthorDetails(prediction.authorID, prediction.guildID))
		.setTimestamp();

	for (const [i, option] of prediction.options.entries()) {
		const cell = votes[i];

		const offsetPeople = cell.people + 1;

		const pop  = Math.floor(offsetPeople/totalPeople*100).toString().padStart(3, " ");
		const earn = Math.floor((totalAmount - cell.amount) / (cell.people+1)).toString();

		embed.addFields({
			name: option.text,
			value: `:ballot_box: ${pop}%\n:moneybag: \$${earn}`,
			inline: true
		})
	}

	await scope.editReply({
		content: "",
		embeds: [ embed ]
	});
}