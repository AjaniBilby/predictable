import { RouteContext } from '~/router/router';
import { shell } from "../$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>Prediction Refund</h3>
		<p>Right click on the prediction's message and refund all of the users who voted on it, then it deletes the prediction</p>
	</div>, { title: "Prediction Refund Menu - Predictable Bot"});
}