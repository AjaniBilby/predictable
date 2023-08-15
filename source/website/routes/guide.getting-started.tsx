import { RenderArgs } from "htmx-router";
import html from '@kitajs/html';


export async function Render(rn: string, {res, setTitle}: RenderArgs) {
	setTitle("Getting Started - Predictable Bot");

	return <div id={rn}>
		<h2>Getting Started</h2>
		<p>
			First of all you need to invite the bot, or else it can't do anything
		</p>
		<p>
			All of the permissions it requests are purely used for the actions of this bot, we're not scraping your server's messages.
		</p>
		<p>
			The <a href="https://github.com/AjaniBilby/predictable" style="font-weight: bold;">source code</a> for this bot is also available if you want to see exactly what the bot does,
			and you can even check which commit it's running on with the "/version" command.
		</p>
		<a style={{
			margin: "12px 15px",
			padding: "8px 12px",
			borderRadius: "8px",

			backgroundColor: "var(--color-blue)",
			fontWeight: "bold",
			color: "white",
		}} href="https://discord.com/api/oauth2/authorize?client_id=1133196823914369035&permissions=412316978240&scope=bot">Invite Bot</a>

		<p>
			Once you've added the bot, by default anyone can create a prediction, to change this you will need to manage the bot's
			<a href="/guide/permission" style="font-weight: bold;">permissions</a>
		</p>

		<p>
			<a href="/guide/prediction" style="margin: 0px 10px; font-weight: bold;">
				Creating your first prediction &gt;
			</a>
		</p>
	</div>
}