import * as Discord from "discord.js";
import { Account, Guild } from "@prisma/client";
import { StyleClass } from "htmx-router";


type FullGuild = Guild & {
	accounts: Account[]
}

const vertCard = new StyleClass("vertCard", `
.this {
	display: flex;
	flex-direction: column;
	border-radius: 10px;
	overflow: hidden;
	width: 180px;
	background-color: hsl(var(--yellow));
	color: hsl(var(--yellow-foreground));
}

.this .image {
	background-position: center;
	background-size: cover;
	background-color: #eee;
	height: 100px;
}

.this .body {
	padding: 10px;
	color: #2c292d;
}
`).name;

export function GuildCard (props: {
	discord_guild: Discord.Guild | null,
	guild?: FullGuild
}) {
	const banner = props.discord_guild?.bannerURL();

	return <div class={vertCard}>
		{ banner ?
			<div class="image" style={{
				backgroundImage: `url('${banner}')`,
			}}></div> : ""
		}
		<div class="body">
			<div style={{
				fontWeight: "bold",
				marginBottom: "5px",
			}} safe>
				{props.discord_guild?.name || "Unknown Server"}
			</div>
			{ props.guild ?
				<div style={{ textAlign: "right" }}>
					{props.guild.accounts.length}
					{"$"+props.guild.accounts.reduce((x, s) => s.balance + x, 0)}
				</div> : ""
			}
		</div>
	</div>
}