import { RouteContext } from "~/router";
import { shell } from "./$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>transfer</code></h3>
		<p>Send fund from your account to another user</p>
	</div>, { title: "Transfer Command - Predictable Bot"});
}