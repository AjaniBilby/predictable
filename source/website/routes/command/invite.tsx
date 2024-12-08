import { RouteContext } from "htmx-router";
import { shell } from "./$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>invite</code></h3>
		<p>Gives you a link to invite this bot to another server</p>
	</div>, { title: "Invite Command - Predictable Bot"});
}