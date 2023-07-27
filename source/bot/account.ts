import { prisma } from "../db";

// Get the person's account creating any other required entities along the way
export async function GetAccount(userID: string, guildID: string) {
	await prisma.user.upsert({
		where: {
			id: userID
		},
		create: {
			id: userID
		},
		update: {}
	});

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

	return await prisma.account.upsert({
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
}