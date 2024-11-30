import { RouteContext } from '~/router/router';
import { shell } from "./$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>permissions</code></h3>
		<p>Shows a list of all users and roles added to the permissions list for this bot</p>
	</div>, { title: "Permissions Command - Predictable Bot"});
}