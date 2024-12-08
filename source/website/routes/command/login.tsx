import { RouteContext } from "htmx-router";
import { shell } from "./$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>login</code></h3>
		<p>Provides a unique link to login into the companion website for the bot</p>
	</div>, { title: "Login Command - Predictable Bot"});
}