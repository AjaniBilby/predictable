import { Prediction, PredictionOption, Wager } from "@prisma/client";
import { RouteContext } from "htmx-router";

import { isPayable } from "~/prediction-state";
import { GetGuild } from "~/helper/discord";
import { prisma } from "~/db";

import { shell } from "./$";

export const parameters = {
	serv: String
}

export async function loader({ params }: RouteContext<typeof parameters>) {
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
	if (!data) return null;

	const openWagers = data.predictions
		.filter(x => isPayable(x.status))
		.sort((a, b) => b.wagers.length - a.wagers.length);

	const guild = await GetGuild(params.serv);

	// TODO: Meta support
	// const meta = [
	// 	{ property: "og:title", content: guild?.name || "Unknown Guild" }
	// ];
	// if (banner) {
	// 	meta.push({ property: "og:image", content: banner })
	// }
	// addMeta(meta, true);

	return shell(<div style="display: contents;">
		<h3>Open Predictions</h3>
		<PredictionList server={params.serv} predictions={openWagers}/>

		<h3>Past Predictions</h3>
		<PredictionList server={params.serv} predictions={data.predictions.filter(x => !isPayable(x.status))}/>
	</div>, guild);
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
		{props.predictions.map(pred => <a href={`/server/${props.server}/p/${pred.id}`} style={{
			display: "contents",
			textDecoration: "none"
		}}>
			<div class={
				 pred.status === "OPEN" ? "blue"
					: pred.status === "CLOSED" ? "purple"
					: "orange"
			} style={{
				display: "flex",
				borderRadius: "var(--radius) 0 0 var(--radius)",
				justifyContent: "center",
				textDecoration: "none",
				fontWeight: "bold",
				overflow: "hidden",
				fontSize: "0.8em",
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
			</div>
			<div style={{
				boxShadow: "inset 0px 0px 5px 0px #0003",
				borderRadius: "0 var(--radius) var(--radius) 0",
				padding: "var(--radius) 10px",
				fontWeight: "bold",
				overflow: "hidden",
				color: "hsl(var(--foreground))",
				fontSize: "0.8em"
			}}>
				<div safe>{pred.title}</div>
				<hr style={{height: "1px", margin: "3px 0px", borderWidth: "0px", backgroundColor: "hsl(var(--foreground))", opacity: "20%"}} />
				<div style={{marginLeft: "10px", fontWeight: "200", fontStyle: "italic", fontSize: "0.8em"}}>
					{ pred.status === "CLOSED"
						? pred.options?.filter(x => x.correct).map(x => <div safe>{x.text}</div>)
						: <>Bets: {pred.wagers.length}</>
					}
				</div>
			</div>
		</a>)}
	</div>
}