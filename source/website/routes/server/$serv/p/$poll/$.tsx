
import { Prediction, PredictionOption, Wager } from "@prisma/client";
import { prisma } from "~/db";
import { isPayable } from "~/prediction-state";

import * as root from "~/website/routes/server/$serv/$";
import { GetGuild, GetMember } from "~/website/shared/discord";

export type FullPrediction = Prediction & {
	options: PredictionOption[],
	wagers: Wager[]
}


export async function shell(inner: JSX.Element, options: { title?: string, prediction: { id: string, title: string, status: Prediction["status"], guildID: string, image?: string } }) {
	options.title ??= options.prediction.title;

	const guild = await GetGuild(options.prediction.guildID, {});

	// TODO: Meta support
	// const meta = [
	// 	{ property: "og:title", content: prediction.title },
	// 	{
	// 		property: "og:description",
	// 		content: prediction.options.map((x, i) => x.text).join(" | ")
	// 	},
	// 	{ property: "og:url", content: `${process.env.WEBSITE_URL}/server/${prediction.guildID}/p/${prediction.id}` },
	// ];
	// if (prediction.image) {
	// 	meta.push({ property: "og:image", content: prediction.image })
	// }
	// addMeta(meta, true);

	return root.shell(<div style="display: contents;">
		<div style="margin: 10px 0px">
			<div style={{
				display: "inline flex",
				color: "white",
				fontWeight: "bold",
				borderRadius: "5px",
				overflow: "hidden"
			}}>
				<div style={{backgroundColor: "#ab9df2", padding: "3px 10px"}}>
					Status
				</div>
				<div style={{
					backgroundColor: options.prediction.status === "OPEN" ? "#a9dc76" : "#ff6188",
					textTransform: "capitalize",
					padding: "3px 10px",
				}} safe>
					{options.prediction.status.toLowerCase()}
				</div>
			</div>
		</div>
		{inner}
	</div>, guild);
}



export async function CheckPermissions(prediction: FullPrediction, guildID: string, shared: any) {
	if (!isPayable(prediction.status)) return false;

	if (!shared.auth) return false;

	const userID: string | undefined = shared.auth.id;
	if (!userID) return false;
	if (userID === prediction.authorID) return true;

	const member = await GetMember(guildID, shared.auth.id, shared);
	if (!member) return false;

	const roles = member.roles.cache.map(x => x.id);

	const guild = await prisma.guild.findFirst({
		where: {
			id: prediction.guildID
		},
		include: {
			adminUsers: {
				where: { userID }
			},
			adminRoles: {
				where: { roleID: { in: roles } }
			}
		}
	});

	if (!guild) return false;
	if (guild.adminUsers.length > 0) return true;
	if (guild.adminRoles.length > 0) return true;

	return false;
}