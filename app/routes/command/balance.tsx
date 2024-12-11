import { shell } from "./$";

export async function loader() {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>balance</code></h3>
		<p>Check your account balance</p>
	</div>, { title: "Balance Command - Predictable Bot"});
}