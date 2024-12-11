import { shell } from "../$";

export async function loader() {
	return shell(<div style={{ display: "contents" }}>
		<h3>Prediction Mark</h3>
		<p>Right click on the prediction's message and mark which option(s) are correct</p>
	</div>, { title: "Prediction Mark Menu - Predictable Bot"});
}