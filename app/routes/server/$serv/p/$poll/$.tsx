
import { Prediction, PredictionOption, Wager } from "@prisma/client";
import { ShellOptions } from "htmx-router/shell";

import * as root from "~/routes/server/$serv/$";
import { isPayable } from "~/prediction-state";
import { GetGuild } from "~/helper/discord";

export type FullPrediction = Prediction & {
	options: PredictionOption[],
	wagers: Wager[]
}


export async function shell(inner: JSX.Element, options: ShellOptions<{ prediction: { status: Prediction["status"], guildID: string } }>) {
	const guild = await GetGuild(options.prediction.guildID);

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
	</div>, { ...options, guild });
}



export async function CheckPermissions(prediction: FullPrediction, guildID: string) {
	if (!isPayable(prediction.status)) return false;
	return false;
}