import { RouteContext } from "~/router";
import { shell } from "./$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>leaderboard</code></h3>
		<p>Shows the server's net value leaderboard</p>
	</div>, { title: "Leaderboard Command - Predictable Bot"});
}