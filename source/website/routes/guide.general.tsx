import { RenderArgs } from "htmx-router";
import * as elements from '@kitajs/html';


export async function Render(rn: string, {res, setTitle}: RenderArgs) {
	setTitle("General Use - Predictable Bot");

	return <div id={rn}>
		<h2>Commands</h2>
		<ul>
			<li>
				<b>/prediction balance</b> will tell you your account balance
			</li>
			<li>
				<b>/prediction leaderboard</b> will show the top 10 accounts based on their current balance - with a link to see more
			</li>
			<li>
				<b>/prediction list</b> will show a list of all open predictions in the server
			</li>
			<li>
				<b>/prediction login</b> will show a secret link to login to the bot's website
			</li>
		</ul>
	</div>
}