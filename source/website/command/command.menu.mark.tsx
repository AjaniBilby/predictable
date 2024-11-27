import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>Prediction Mark</h3>
		<p>Right click on the prediction's message and mark which option(s) are correct</p>
	</div>;
}