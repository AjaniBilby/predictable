import { shell } from "./$";

export async function loader() {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>list</code></h3>
		<p>Show a list of all open predictions in this server</p>
	</div>, { title: "List Command - Predictable Bot"});
}