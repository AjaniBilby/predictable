import { StyleClass } from "htmx-router";

import { shell } from "~/website/routes/$";

export const parameters = {};

const imgTextLine = new StyleClass("image-line", `
.this {
	margin: 30px 0px;

	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
	align-items: stretch;
	justify-content: space-between;
}`).name;

export async function loader() {
	return shell(<div>
		<div style={{
			margin: "10px 0px",
			display: "flex",
			flexWrap: "wrap",
			gap: "10px"
		}}>
			<a href="/guide/getting-started" class="button">Getting Started</a>
			<a href="/command" class="button">Commands</a>
			<a href="/guide"   class="button">Guides</a>
			<a href="/server"  class="button">Server List</a>
		</div>
		<div class={imgTextLine}>
			<div style={{
				backgroundImage: "url(/image/prediction-example.png)",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundSize: "contain",
				minHeight: "400px"
			}}></div>
			<div style={{display: "flex", flexDirection: "column", justifyContent: "space-around"}}>
				<div>
					<p>
						<b>Built to be FREE</b><br/>
						This bot is built to be efficient, so operating cost are next to nothing.
					</p>
					<p>
						So it costs end users nothing to use
					</p>
					<p>
						So no pay walled features
					</p>
				</div>
				<p>
					<b>Built for display</b><br/>
					Create rich predictions with image embeds
				</p>
				<div>
					<p>
						<b>Built for reliability</b><br/>
						The bot and website are both designed with fault tolerance in mind.
					</p>
					<p>All error cases are safely handled so the bot will never go down due to an error.</p>
					<p>And when an error does occur the proper safeties are made to ensure no transaction gets lost.</p>
				</div>

			</div>
		</div>

		<div class={imgTextLine}>
			<div style={{display: "flex", flexDirection: "column", justifyContent: "space-around"}}>
				<p>
					<b>No restrictions</b><br/>
					Put as many options as you want<br/>
					Just make sure each option is on it's own line
				</p>
				<p>
					<b>Expressive</b><br/>
					You can also embed emotes straight into your options and description by typing them
				</p>
				<div>
					<p>
						<b>Break free from commands</b><br/>
						The only slash command you'll ever need is /create to open the creation window<br/>
						Everything else is done though menus and right clicks
					</p>
					<p>
						Want to lock a prediction?<br/>
						Right-click &gt; Apps &gt; Lock
					</p>
					<p>
						Want to payout a prediction?<br/>
						Right-click &gt; Apps &gt; Payout
					</p>
				</div>
			</div>
			<div style={{
				backgroundImage: "url(/image/prediction-create.png)",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundSize: "contain",
				minHeight: "400px"
			}}></div>
		</div>
	</div>);
}