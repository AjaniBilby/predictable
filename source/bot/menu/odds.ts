import type { CacheType, ContextMenuCommandInteraction } from "discord.js";
import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
	EmbedBuilder,
} from "discord.js";
import { prisma } from "../../db";

export const name = "See Odds";

export function bind() {
	return new ContextMenuCommandBuilder()
		.setName(name)
		.setType(ApplicationCommandType.Message)
}

export async function execute(scope: ContextMenuCommandInteraction<CacheType>) {
	const pollID = scope.targetId || "";

	await scope.deferReply({ephemeral: true});

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

	const author = await scope.client.users.fetch(prediction.authorID);
	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`Odds: ${prediction.title}`)
		.setAuthor({ name: author.username, iconURL: author.avatarURL() || undefined })
		.setTimestamp();

	for (const [i, option] of prediction.options.entries()) {
		const cell = votes[i];

		const offsetPeople = cell.people + 1;

		const pop  = Math.floor(offsetPeople/totalPeople*100).toString().padStart(3, " ");
		const earn = Math.floor((totalAmount - cell.amount) / (cell.people+1)).toString();

		embed.addFields({
			name: option.text,
			value: `${pop}% earn ${earn}`
		})
	}

	await scope.editReply({
		content: "",
		embeds: [ embed ]
	});
}