import { ErrorResponse, RenderArgs, Link } from "htmx-router";
import * as html from '@kitajs/html';

import { prisma } from '../../db';

import { AccountCard } from '../component/account-card';
import { GetGuild, GetMember } from "../shared/discord";

export async function Render(rn: string, {params, shared, addMeta}: RenderArgs) {
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

	if (!data) throw new ErrorResponse(404, "Resource not found", `Unable to load guild ${params.serv}`);

	const guild = await GetGuild(params.serv, shared);
	const banner = guild?.bannerURL();
	const meta = [
		{ property: "og:title", content: guild?.name || "Unknown Guild" },
	];
	if (banner) {
		meta.push({ property: "og:image", content: banner })
	}
	addMeta(meta, true);

	return <div id={rn}>
		<h3>{data.accounts.length} Members</h3>
		<div style={{
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
			gap: "10px"
		}}>
			{await Promise.all(data.accounts.map(async x => {
				const member = await GetMember(x.guildID, x.userID, shared)

				return <Link to={`/server/${x.guildID}/u/${x.userID}`}>
					<AccountCard member={member} account={x} />
				</Link>
			}))}
		</div>
	</div>;
}