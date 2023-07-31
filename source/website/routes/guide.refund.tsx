import { RenderArgs } from "htmx-router";
import * as elements from 'typed-html';


export async function Render(rn: string, {res, setTitle}: RenderArgs) {
	setTitle("Managing Permissions - Predictable Bot");

	return <div id={rn}>
		<h2>Refund Predictions</h2>
		<p>
			The "/prediction auto-refund" command will check for any on-going prediction who's message has been deleted.
			All of these predictions will then be refunded automatically.
		</p>
		<p>
			So if you want to refund an existing prediction, delete the message - then run "/prediction auto-refund"
		</p>
	</div>
}