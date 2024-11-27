import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>permission</code></h3>

		<p>Allows a user to add a role or user to the bot's list of authoritative users</p>
	</div>;
}