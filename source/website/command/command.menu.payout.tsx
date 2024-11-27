import * as html from '@kitajs/html';
import { Link } from 'htmx-router';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>Prediction Payout</h3>
		<p>
			Right click on the prediction's message and payout all of the users who predicted correctly according to the
			<Link to="/command/menu/mark">marking</Link>
		</p>
	</div>;
}