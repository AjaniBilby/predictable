import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>Prediction Unlock</h3>
		<p>Right click on the prediction's message and unlock it to allow users to change their predictions again after locking</p>
	</div>;
}