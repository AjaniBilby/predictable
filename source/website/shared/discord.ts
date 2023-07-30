
import { ErrorResponse } from 'htmx-router';
import { client, fetchWrapper } from '../../bot/client';
import { Guild, GuildMember, User } from 'discord.js';

export async function GetGuild(guildID: string, state: any): Promise<Guild | null> {
	if (!state.discord_guild) {
		state.discord_guild = {};
	}

	if (!state.discord_guild[guildID]) {
		state.discord_guild[guildID] = await fetchWrapper(client.guilds.fetch(guildID));
	}

	return state.discord_guild[guildID] || null;
}


export async function GetUser(userID: string, state: any): Promise<User | null> {
	if (!state.discord_user || state.discord_user.id != userID) {
		state.discord_user = await fetchWrapper(client.users.fetch(userID, {cache: true}));
	}
	return state.discord_user || null;
}


export async function GetMember(
	guildID: string,
	userID: string,
	state: any,
): Promise<GuildMember | null> {
	const guild = await GetGuild(guildID, state);
	if (!guild) return null;

	if (!state.discord_member) {
		state.discord_member = {};
	}
	if (!state.discord_member[guildID]) {
		state.discord_member[guildID] = {};
	}

	if (!state.discord_member[guildID][userID]) {
		state.discord_member[guildID][userID] = await fetchWrapper(guild.members.fetch(userID));
	}

	return state.discord_member[guildID][userID] || null;
}



export async function GetGuildOrThrow(guildID: string, state: any): Promise<Guild> {
	const out = await GetGuild(guildID, state);
	if (!out) throw new ErrorResponse(404, "Resource not found", `Unable to load server details from discord`);

	return out;
}

export async function GetUserOrThrow(guildID: string, state: any): Promise<User> {
	const out = await GetUser(guildID, state);
	if (!out) throw new ErrorResponse(404, "Resource not found", `Unable to load user details from discord`);

	return out;
}

export async function GetMemberOrThrow(guildID: string, userID: string, state: any): Promise<GuildMember> {
	const out = await GetMember(guildID, userID, state);
	if (!out) throw new ErrorResponse(404, "Resource not found", `Unable to load member details from discord`);

	return out;
}