import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>bankrupt</code></h3>
		<p>Refunds all active wagers, and resets your account balance if you're in debt</p>
	</div>;
}