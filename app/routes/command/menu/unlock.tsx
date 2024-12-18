import { shell } from "../$";

export async function loader() {
	return shell(<div style={{ display: "contents" }}>
		<h3>Prediction Unlock</h3>
		<p>Right click on the prediction's message and unlock it to allow users to change their predictions again after locking</p>
	</div>, { title: "Prediction Unlock Menu - Predictable Bot"});
}