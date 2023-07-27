import * as elements from 'typed-html';
import * as Discord from 'discord.js';
import { StyleCSS } from "htmx-router";
import { Account, Guild } from "@prisma/client";


type FullGuild = Guild & {
	accounts: Account[]
}

export function GuildCard (props: {
	guild: Discord.Guild,
	g?: FullGuild
}) {
	return <div class="vertCard">
		<div class="image" style={StyleCSS({
			backgroundImage: `url('${props.guild.bannerURL()}')`,
		})}></div>
		<div class="body">
			<div style={StyleCSS({
				fontWeight: "bold",
				marginBottom: "5px",
			})}>
				{props.guild.name}
			</div>
			{ props.g &&
				<div style={StyleCSS({ textAlign: "right" })}>
					&#x1F680;{props.g.accounts.length}
					&#x1F680;{props.g.accounts.reduce((x, s) => s.balance + x, 0)}
				</div>
			}
		</div>
	</div>
}