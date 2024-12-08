import { RouteContext } from "htmx-router";
import { shell } from "./$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>version</code></h3>
		<p>Displays the version the bot is currently running on</p>
	</div>, { title: "Version Command - Predictable Bot"});
}