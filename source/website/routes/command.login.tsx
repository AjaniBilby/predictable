import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>login</code></h3>
		<p>Provides a unique link to login into the companion website for the bot</p>
	</div>;
}