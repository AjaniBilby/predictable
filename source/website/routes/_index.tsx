import { RenderArgs, Link, StyleCSS } from "htmx-router";
import * as elements from 'typed-html';


export async function Render(rn: string, {res, setTitle}: RenderArgs) {
	setTitle("Home - Predictable Bot");
	res.setHeader('Cache-Control', "public, max-age=7200");

	const navBtnStyle = StyleCSS({
		backgroundColor: "var(--color-blue)",
		fontWeight: "bold",
		color: "white",

		borderRadius: "5px",
		padding: "6px 8px"
	});

	const imgTextLine = StyleCSS({
		margin: "30px 0px",

		display: "grid",
		gridTemplateColumns: "1fr 1fr",
		gap: "10px",
		alignItems: "stretch",
		justifyContent: "space-between",
	})

	return <div id={rn}>
		<div style={StyleCSS({
			margin: "10px 0px",
			display: "flex",
			flexWrap: "wrap",
			gap: "10px"
		})}>
			<Link to="/guide/getting-started" class="navButton">Getting Started</Link>
			<Link to="/guide" class="navButton">Guides</Link>
			<Link to="/server" class="navButton">Server List</Link>
		</div>

		<div style={imgTextLine}>
			<div style={StyleCSS({
				backgroundImage: "url(/image/prediction-example.png)",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundSize: "contain",
				minHeight: "400px"
			})}></div>
			<div style={StyleCSS({display: "flex", flexDirection: "column", justifyContent: "space-around"})}>
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

		<div style={imgTextLine}>
			<div style={StyleCSS({display: "flex", flexDirection: "column", justifyContent: "space-around"})}>
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
			<div style={StyleCSS({
				backgroundImage: "url(/image/prediction-create.png)",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundSize: "contain",
				minHeight: "400px"
			})}></div>
		</div>
	</div>;
}