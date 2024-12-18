
import { Guild, GuildMember, User } from "discord.js";

import { client, fetchWrapper } from "~/bot/client";

export async function GetGuild(guildID: string) {
	return await fetchWrapper(client.guilds.fetch(guildID));
}

export async function GetUser(userID: string) {
	return await fetchWrapper(client.users.fetch(userID, {cache: true}));
}

export async function GetMember(guildID: string, userID: string): Promise<GuildMember | null> {
	const guild = await GetGuild(guildID);
	if (!guild) return null;

	return await fetchWrapper(guild.members.fetch(userID));
}


export async function GetGuildOrThrow(guildID: string): Promise<Guild> {
	const out = await GetGuild(guildID);
	if (!out) throw new Response("Unable to load server details from discord", { status: 404, statusText: "Not Found" });

	return out;
}

export async function GetUserOrThrow(guildID: string): Promise<User> {
	const out = await GetUser(guildID);
	if (!out) throw new Response("Unable to load user details from discord", { status: 404, statusText: "Not Found" });

	return out;
}

export async function GetMemberOrThrow(guildID: string, userID: string): Promise<GuildMember> {
	const out = await GetMember(guildID, userID);
	if (!out) throw new Response("Unable to load member details from discord", { status: 404, statusText: "Not Found" });

	return out;
}