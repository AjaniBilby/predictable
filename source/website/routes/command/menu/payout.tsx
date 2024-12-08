import { RouteContext } from "htmx-router";
import { shell } from "../$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>Prediction Payout</h3>
		<p>
			Right click on the prediction's message and payout all of the users who predicted correctly according to the
			<a href="/command/menu/mark">marking</a>
		</p>
	</div>, { title: "Prediction Payout Menu - Predictable Bot"});
}