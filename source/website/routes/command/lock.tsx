import { RouteContext } from "htmx-router";
import { shell } from "./$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>lock</code></h3>
		<p>Only allow users with permission to create predictions</p>
		<p>This command can only be ran by users who have administrative permissions in the server</p>
	</div>, { title: "Lock Command - Predictable Bot"});
}