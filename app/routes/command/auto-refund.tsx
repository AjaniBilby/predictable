import { shell } from "./$";

export async function loader() {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>auto-refund</code></h3>
		<p>Automatically refund any predictions still open who's message has been deleted</p>
	</div>, { title: "Auto-Refund Command - Predictable Bot"});
}