import { RouteContext } from '~/router/router';
import { shell } from "./$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>bankrupt</code></h3>
		<p>Refunds all active wagers, and resets your account balance if you're in debt</p>
	</div>, { title: "Bankrupt Command - Predictable Bot"});
}