import { prisma } from "../db";
import { fetchWrapper, client } from "./client";

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

	const guild = await prisma.guild.upsert({
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
			balance: guild.start_balance || 100
		},
		update: {}
	});
}


export async function GetAuthorDetails(userID: string, guildID: string) {
	const guild = await fetchWrapper(client.guilds.fetch(guildID));
	if (guild) {
		const member = await fetchWrapper(guild.members.fetch(userID));
		if (member) return {
			name: member.nickname || member.displayName,
			iconURL: member.displayAvatarURL() || member.avatarURL() || undefined
		}
	}

	const author = await fetchWrapper(client.users.fetch(userID));
	if (author) return {
		name: author.username || "Unknown User",
		iconURL: author.displayAvatarURL() || author.avatarURL() || author.defaultAvatarURL
	}

	return {
		name: "Unknown User",
		iconURL: undefined
	}
}