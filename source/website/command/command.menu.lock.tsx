import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>Prediction Lock</h3>
		<p>Right click on the prediction's message and lock it to not allow users to change their predictions</p>
	</div>;
}