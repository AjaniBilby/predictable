import { RouteContext } from "~/router/router";
import { shell } from "~/website/routes/guide/$";

export async function loader({}: RouteContext) {
	return shell(<div style="display: contents;">
		<h2>Getting Started</h2>
		<p>
			First of all you need to invite the bot, or else it can't do anything
		</p>
		<p>
			All of the permissions it requests are purely used for the actions of this bot, we're not scraping your server's messages.
		</p>
		<p>
			The <a href="https://github.com/AjaniBilby/predictable" style="font-weight: bold;">source code</a> for this bot is also available if you want to see exactly what the bot does,
			and you can even check which commit it's running on with the <a href="/command/version"><code>/version</code></a> command.
		</p>
		<a class="button primary" style={{
			margin: "12px 15px"
		}} href="https://discord.com/api/oauth2/authorize?client_id=1133196823914369035&permissions=412316978240&scope=bot">Invite Bot</a>

		<p>
			Once you've added the bot, by default anyone can create a prediction, to change this you will need to manage the bot's&nbsp;
			<a href="/guide/permission" style="font-weight: bold;">permissions</a>
		</p>

		<p>
			<a href="/guide/prediction" style="margin: 0px 10px; font-weight: bold;">
				Creating your first prediction &gt;
			</a>
		</p>
	</div>, { title: "Getting Started - Predictable Bot" })
}