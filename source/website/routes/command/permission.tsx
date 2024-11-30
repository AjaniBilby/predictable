import { RouteContext } from '~/router/router';
import { shell } from "./$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>permission</code></h3>
		<p>Allows a user to add a role or user to the bot's list of authoritative users</p>
	</div>, { title: "Permission Command - Predictable Bot"});
}