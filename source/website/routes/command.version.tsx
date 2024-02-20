import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>version</code></h3>
		<p>Displays the version the bot is currently running on</p>
	</div>;
}