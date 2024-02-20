import * as html from '@kitajs/html';
import { Link } from 'htmx-router';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>Prediction Refund</h3>
		<p>
			Right click on the prediction's message and refund all of the users who voted on it, then it deletes the prediction
		</p>
	</div>;
}