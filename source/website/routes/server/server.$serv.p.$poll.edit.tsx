import { ErrorResponse, RenderArgs, Link } from "htmx-router";
import * as html from '@kitajs/html';

import type { FullPrediction } from "./server.$serv.p.$poll";

export async function Auth({params, shared}: RenderArgs) {
	if (!shared.prediction_perms) throw new ErrorResponse(
		401,
		"Unauthorised Access",
		"Unauthorised Access"
	)
}

export async function Render(rn: string, {req, params, shared}: RenderArgs) {
	const prediction = shared.prediction as FullPrediction;
	if (!prediction) throw new ErrorResponse(404, "Resource not found", `Unable to find prediction ${params.poll}`);

	return <div id={rn}>
		{ shared.prediction_perms
			? <Link
					to={`/server/${params.serv}/p/${params.poll}/edit`}
					style="margin: 0 0 15px 0; float: right;"
					class="navButton"
				>Edit</Link>
			: ""
		}

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
					backgroundColor: prediction.status === "OPEN" ? "#a9dc76" : "#ff6188",
					textTransform: "capitalize",
					padding: "3px 10px",
				}}>
					{prediction.status.toLowerCase()}
				</div>
			</div>
		</div>

		<form style="margin-top: 10px">
			<div style={{
				display: "grid",
				gridTemplateColumns: "1fr",
				gap: "10px",
			}}>
				<input name="title" value={prediction.title} placeholder="Title"></input>
				<input name="image" value={prediction.image} placeholder="Image URL"></input>
				<input name="description" value={prediction.description} placeholder="Description"></input>
				<textarea style="min-height: 10em" placeholder="One Option per line" readonly="" disabled="">
					{prediction.options.map(x => x.text).join("\n")}
				</textarea>
				<div>
					<button class="navButton" name="action" value="update" disabled="">Save</button>
				</div>
			</div>
		</form>
	</div>;
}