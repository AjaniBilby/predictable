import { shell } from "./$";

export async function loader() {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>version</code></h3>
		<p>Displays the version the bot is currently running on</p>
	</div>, { title: "Version Command - Predictable Bot"});
}