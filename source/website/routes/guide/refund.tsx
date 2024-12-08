import { RouteContext } from "htmx-router";
import { shell } from "~/website/routes/guide/$";

export async function loader({}: RouteContext) {
	return shell(<div style="display: contents;">
		<h2>Refund a Predictions</h2>
		<h2>Refund</h2>
		<p>
			If you right click on a prediction message you'll see Apps &gt; Prediction Refund.
			After clicking this option you will get a confirmation button.
			Once that is clicked all wagers will be refunded, the prediction will be deleted from the database - and the message will be updated to have a status of refunded
		</p>
		<h2>Auto Refund</h2>
		<p>
			The "/prediction auto-refund" command will check for any prediction who's message has been deleted but hasn't been paid out.
			All of these predictions will then be refunded automatically.
		</p>
	</div>, { title: "General Use - Predictable Bot" })
}