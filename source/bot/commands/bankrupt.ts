import type { ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from "discord.js";
import { prisma } from "../../db";
import { bot } from "../../logging";


export const name = "bankrupt";

export function bind(subcommand: SlashCommandSubcommandBuilder) {
	return subcommand
		.setName(name)
		.setDescription("Refunds all active wagers, and resets your account balance if you're in debt");
}

export async function execute (scope: ChatInputCommandInteraction<CacheType>) {
	await scope.deferReply({ephemeral: true});

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
	const account = await prisma.account.findFirst({
		where: { userID, guildID },
	});
	if (!account) {
		await scope.editReply({ content: `You don't have an account yet in this guild\nStart betting for your opening balance` });
		return;
	}
	if (account.balance > 1) {
		await scope.editReply({ content: `You can only declare bankrupt if your balance is less than 1\nYou've got to work your way up` });
		return;
	}

	bot("INFO", `User[${userID}] is declaring bankrupt in guild[${guildID}]`);
	const wagerSelection = {
		userID: userID,
		prediction: { status: "OPEN", guildID },
	};
	const [wagers, _] = await prisma.$transaction([
		prisma.wager.findMany({
			where: wagerSelection
		}),
		prisma.wager.deleteMany({
			where: wagerSelection
		})
	]);


	const refunded = wagers.reduce((s, x) => x.amount+s, 0);
	const updated = await prisma.account.update({
		where: { guildID_userID: { userID, guildID } },
		data: {
			balance: { increment: refunded }
		}
	});

	await scope.editReply({ content: `Refunded \$${refunded} from existing wagers` });

	if (updated.balance < 1) {
		await prisma.$transaction([
			prisma.guild.update({
				where: { id: guildID },
				data: { kitty: { decrement: 10 } }
			}),
			prisma.account.update({
				where: { guildID_userID: { userID, guildID } },
				data: { balance: { increment: 10 } }
			})
		]);

		await scope.followUp({ content: "Took $10 from the server's kitty, so your balance is now 10" });
	} else {
		await scope.followUp({ content: `Your balance is ${updated.balance}` });
	}
}