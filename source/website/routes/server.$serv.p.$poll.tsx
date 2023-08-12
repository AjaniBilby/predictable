import { ErrorResponse, RenderArgs, StyleCSS, Link, Redirect } from "htmx-router";
import { Prediction, PredictionOption, Wager } from "@prisma/client";
import * as elements from 'typed-html';

import { GetGuildOrThrow, GetMember } from "../shared/discord";
import { prisma } from '../../db';
import { isPayable } from "../../prediction-state";

export type FullPrediction = Prediction & {
	options: PredictionOption[],
	wagers: Wager[]
}


export async function Render(rn: string, {req, url, params, shared, setTitle, addMeta, Outlet}: RenderArgs) {
	const prediction = await prisma.prediction.findFirst({
		where: { guildID: params.serv, id: params.poll },
		include: {
			options: {
				orderBy: [ {index: "asc"} ]
			},
			wagers: {
				orderBy: [
					{payout: "desc"},
					{amount: "desc"}
				]
			},
		}
	});

	if (!prediction) throw new ErrorResponse(404, "Resource not found", `Unable to find prediction ${params.poll}`);

	const guild = await GetGuildOrThrow(params.serv, shared);
	setTitle(`${prediction.title} - ${guild.name}`);

	const meta = [
		{ property: "og:title", content: prediction.title },
		{
			property: "og:description",
			content: prediction.options.map((x, i) => x.text).join(" | ")
		},
		{ property: "og:url", content: `${process.env.WEBSITE_URL}/server/${prediction.guildID}/p/${prediction.id}` },
	];
	if (prediction.image) {
		meta.push({ property: "og:image", content: prediction.image })
	}
	addMeta(meta, true);


	shared.prediction_perms = await CheckPermissions(prediction, params.serv, shared)
	shared.prediction = prediction;

	return <div id={rn}>
		{await Outlet()}
	</div>;
}



async function CheckPermissions(prediction: FullPrediction, guildID: string, shared: any) {
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