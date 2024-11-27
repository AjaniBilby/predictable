import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>info</code></h3>
		<p>Tells you the balance, bet amount, and net value of an account</p>
	</div>;
}