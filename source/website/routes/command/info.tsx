import { shell } from "./$";

export async function loader() {
	return shell(<div style={{ display: "contents" }}>
		<h3>/Prediction <code>info</code></h3>
		<p>Tells you the balance, bet amount, and net value of an account</p>
	</div>, { title: "Info Command - Predictable Bot"});
}