import * as elements from 'typed-html';
import * as Discord from 'discord.js';
import { StyleCSS } from "htmx-router";
import { Account } from "@prisma/client";

export function AccountCard (props: {
	member: Discord.GuildMember | null,
	account: Account
}) {
	return <div class="horizontalCard">
		<div class="image" style={StyleCSS({
			backgroundImage: `url('${props.member?.displayAvatarURL()}')`,
		})}></div>
		<div class="body">
			<div style={StyleCSS({
				fontWeight: "bold",
				textTransform: "capitalize",
				marginBottom: "5px"
			})}>
				{props.member?.nickname || props.member?.displayName || "Unknown"}
			</div>
			<div>
				${props.account.balance}
			</div>
		</div>
	</div>
}