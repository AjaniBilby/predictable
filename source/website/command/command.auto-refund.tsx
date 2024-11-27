import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>auto-refund</code></h3>
		<p>Automatically refund any predictions still open who's message has been deleted</p>
	</div>;
}