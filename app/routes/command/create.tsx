import { shell } from "./$";

export async function loader() {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>create</code></h3>
		<p>Creates a new prediction by opening a modal window</p>
	</div>, { title: "Create Command - Predictable Bot"});
}