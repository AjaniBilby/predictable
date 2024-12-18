import { GetGuild, GetMember } from "~/helper/discord";
import { RouteContext } from "htmx-router";
import { AccountCard } from "~/component/account-card";
import { prisma } from "~/db";

import { shell } from "./$";

export const parameters = {
	serv: String
}

export async function loader({ params }: RouteContext<typeof parameters>) {
	const data = await prisma.guild.findFirst({
		where: { id: params.serv },
		include: {
			accounts: {
				orderBy: [
					{ balance: "desc" }
				]
			}
		}
	});
	if (!data) return null;

	const guild = await GetGuild(params.serv);
	const banner = guild?.bannerURL();

	// TODO: Meta support
	// const meta = [
	// 	{ property: "og:title", content: guild?.name || "Unknown Guild" },
	// ];
	// if (banner) {
	// 	meta.push({ property: "og:image", content: banner })
	// }
	// addMeta(meta, true);

	const users = await Promise.all(data.accounts.map(async x => {
		const member = await GetMember(x.guildID, x.userID)

		return <a href={`/server/${x.guildID}/u/${x.userID}`} style={{ textDecoration: "none" }}>
			<AccountCard member={member} account={x} />
		</a>
	}));

	return shell(<div style="display: contents;">
		<h3>{data.accounts.length} Members</h3>
		<div style={{
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
			gap: "10px"
		}}>{users as "safe"[]}</div>
	</div>, guild);
}