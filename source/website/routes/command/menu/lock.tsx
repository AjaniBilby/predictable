import { RouteContext } from "~/router";
import { shell } from "../$";

export async function loader({}: RouteContext) {
	return shell(<div style={{ display: "contents" }}>
		<h3>Prediction Lock</h3>
		<p>Right click on the prediction's message and lock it to not allow users to change their predictions</p>
	</div>, { title: "Prediction Lock Menu - Predictable Bot"});
}