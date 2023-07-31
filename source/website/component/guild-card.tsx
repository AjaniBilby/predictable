import * as elements from 'typed-html';
import * as Discord from 'discord.js';
import { StyleCSS } from "htmx-router";
import { Account, Guild } from "@prisma/client";


type FullGuild = Guild & {
	accounts: Account[]
}

export function GuildCard (props: {
	discord_guild: Discord.Guild | null,
	guild?: FullGuild
}) {
	const banner = props.discord_guild?.bannerURL();

	return <div class="vertCard">
		{ banner &&
			<div class="image" style={StyleCSS({
				backgroundImage: `url('${banner}')`,
			})}></div>
		}
		<div class="body">
			<div style={StyleCSS({
				fontWeight: "bold",
				marginBottom: "5px",
			})}>
				{props.discord_guild?.name || "Unknown Server"}
			</div>
			{ props.guild &&
				<div style={StyleCSS({ textAlign: "right" })}>
					{props.guild.accounts.length}
					{"$"+props.guild.accounts.reduce((x, s) => s.balance + x, 0)}
				</div>
			}
		</div>
	</div>
}