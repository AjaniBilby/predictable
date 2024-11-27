import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>list</code></h3>
		<p>Show a list of all open predictions in this server</p>
	</div>;
}