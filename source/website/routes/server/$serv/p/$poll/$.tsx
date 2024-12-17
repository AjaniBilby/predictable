
import { Prediction, PredictionOption, Wager } from "@prisma/client";

import * as root from "~/website/routes/server/$serv/$";
import { isPayable } from "~/prediction-state";
import { GetGuild } from "~/website/discord";

export type FullPrediction = Prediction & {
	options: PredictionOption[],
	wagers: Wager[]
}


export async function shell(inner: JSX.Element, options: { title?: string, prediction: { id: string, title: string, status: Prediction["status"], guildID: string, image?: string } }) {
	options.title ??= options.prediction.title;

	const guild = await GetGuild(options.prediction.guildID);

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
				borderRadius: "var(--radius)",
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



export async function CheckPermissions(prediction: FullPrediction, guildID: string) {
	if (!isPayable(prediction.status)) return false;
	return false;
}