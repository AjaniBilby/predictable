import { ErrorResponse, RenderArgs, Link } from "htmx-router";
import * as html from '@kitajs/html';

import { prisma } from '../../db';

import { isPayable } from "../../prediction-state";
import { GetGuild } from "../shared/discord";
import { Prediction, PredictionOption, Wager } from "@prisma/client";

export async function Render(rn: string, {params, shared, addMeta}: RenderArgs) {
	const data = await prisma.guild.findFirst({
		where: { id: params.serv },
		include: {
			predictions: {
				include: {
					options: true,
					wagers: true
				},
				orderBy: [
					{ updatedAt: "desc" }
				]
			}
		}
	});

	if (!data) throw new ErrorResponse(404, "Resource not found", `Unable to load guild ${params.serv}`);

	const openWagers = data.predictions
		.filter(x => isPayable(x.status))
		.sort((a, b) => b.wagers.length - a.wagers.length);

	const guild = await GetGuild(params.serv, shared);
	const banner = guild?.bannerURL();
	const meta = [
		{ property: "og:title", content: guild?.name || "Unknown Guild" }
	];
	if (banner) {
		meta.push({ property: "og:image", content: banner })
	}
	addMeta(meta, true);

	return <div id={rn}>

		<h3>Open Predictions</h3>
		<PredictionList server={params.serv} predictions={openWagers}/>

		<h3>Past Predictions</h3>
		<PredictionList server={params.serv} predictions={data.predictions.filter(x => !isPayable(x.status))}/>

	</div>;
}


export function PredictionList(props: {
	server: Prediction['guildID'],
	predictions: Array<Prediction & {wagers: Wager[], options?: PredictionOption[]} >
}) {
	return <div style={{
		display: "grid",
		gridTemplateColumns: "auto 1fr",
		gap: "5px 0px"
	}}>
		{props.predictions.map(pred => <>
			<Link to={`/server/${props.server}/p/${pred.id}`} style={{
				display: "flex",
				borderRadius: "5px 0 0 5px",
				justifyContent: "center",
				backgroundColor: pred.status === "OPEN" ? "var(--color-blue)"
					: pred.status === "CLOSED" ? "var(--color-purple)"
					: "var(--color-orange)",
				fontWeight: "bold",
				overflow: "hidden",
				fontSize: "0.8em"
			}}>
				<div title="Total Bets" style={{
					display: "flex",
					alignItems: "center",
					padding: "3px 10px",
					color: "white",
					fontSize: "1.2em",
				}}>
					${pred.wagers.reduce((x, s) => s.amount + x, 0)}
				</div>
			</Link>
			<Link to={`/server/${props.server}/p/${pred.id}`} style={{
				boxShadow: "inset 0px 0px 5px 0px #0003",
				borderRadius: "0 5px 5px 0",
				padding: "5px 10px",
				fontWeight: "bold",
				overflow: "hidden",
				color: "var(--text-color)",
				fontSize: "0.8em"
			}}>
				{pred.title}
				<hr style={{height: "1px", margin: "3px 0px", borderWidth: "0px", backgroundColor: "var(--text-color)", opacity: "20%"}} />
				<div style={{marginLeft: "10px", fontWeight: "200", fontStyle: "italic", fontSize: "0.8em"}}>
					{ pred.status === "CLOSED"
						? pred.options?.filter(x => x.correct).map(x => <div>{x.text}</div>)
						: <>Bets: {pred.wagers.length}</>
					}
				</div>
			</Link>
		</>)}
	</div>
}