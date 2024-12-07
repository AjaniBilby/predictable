import { RouteContext } from "~/router";
import { isPayable } from "~/prediction-state";
import { GetGuild } from "~/website/shared/discord";
import { prisma } from "~/db";

import { shell } from "./$";
import { Prediction, PredictionOption, Wager } from "@prisma/client";

export async function loader({ params }: RouteContext) {
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

	const guild = await GetGuild(params.serv, {});

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
			<div style={{
				display: "flex",
				borderRadius: "5px 0 0 5px",
				justifyContent: "center",
				backgroundColor: pred.status === "OPEN" ? "var(--color-blue)"
					: pred.status === "CLOSED" ? "var(--color-purple)"
					: "var(--color-orange)",
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
				borderRadius: "0 5px 5px 0",
				padding: "5px 10px",
				fontWeight: "bold",
				overflow: "hidden",
				color: "var(--text-color)",
				fontSize: "0.8em"
			}}>
				<div safe>{pred.title}</div>
				<hr style={{height: "1px", margin: "3px 0px", borderWidth: "0px", backgroundColor: "var(--text-color)", opacity: "20%"}} />
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