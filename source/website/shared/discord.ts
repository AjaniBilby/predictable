
import { ErrorResponse } from 'htmx-router';
import { client, fetchWrapper } from '../../bot/client';
import { Guild, GuildMember, User } from 'discord.js';

export async function GetGuild(guildID: string, state: any): Promise<Guild> {
	if (!state.discord_guild) {
		state.discord_guild = await fetchWrapper(client.guilds.fetch(guildID));
		if (!state.discord_guild)
		throw new ErrorResponse(404, "Resource not found", `Unable to load server details from discord`);
	}

	return state.discord_guild;
}


export async function GetUser(userID: string, state: any): Promise<User> {
	if (!state.discord_user) {
		state.discord_user = await fetchWrapper(client.users.fetch(userID));
		if (!state.discord_user)
		throw new ErrorResponse(404, "Resource not found", `Unable to load user details from discord`);
	}

	return state.discord_user;
}

export async function GetMember(guildID: string, userID: string, state: any): Promise<GuildMember> {
	const guild = await GetGuild(guildID, state);

	if (!state.discord_member) {
		state.discord_member = await fetchWrapper(guild.members.fetch(userID));
		if (!state.discord_member)
		throw new ErrorResponse(404, "Resource not found", `Unable to load member details from discord`);
	}

	return state.discord_member;
}