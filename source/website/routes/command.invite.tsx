import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>invite</code></h3>
		<p>Gives you a link to invite this bot to another server</p>
	</div>;
}