import * as Discord from "discord.js";
import { Account } from "@prisma/client";

export function AccountCard (props: {
	member: Discord.GuildMember | null,
	account: Account
}) {
	return <div class="horizontalCard">
		<div class="image" style={{
			backgroundImage: `url('${props.member?.displayAvatarURL()}')`,
		}}></div>
		<div class="body">
			<div style={{
				fontWeight: "bold",
				textTransform: "capitalize",
				marginBottom: "5px"
			}} safe>
				{props.member?.nickname || props.member?.displayName || "Unknown"}
			</div>
			<div>
				${props.account.balance}
			</div>
		</div>
	</div>
}