import { RouteContext } from "htmx-router";
import { shell } from "~/website/routes/guide/$";

export async function loader({}: RouteContext) {
	const imgTextLine = {
		margin: "30px 0px",

		display: "grid",
		gridTemplateColumns: "1fr 1fr",
		gap: "10px",
		alignItems: "stretch",
		justifyContent: "space-between",
	};

	return shell(<div style="display: contents;">
		<h2>Running a Prediction</h2>

		<p>
			In this guide we'll simply go through creating a prediction, all the way through to final payouts and how the calculations work
		</p>

		<div style={imgTextLine}>
			<div style={{
				backgroundImage: "url(/image/prediction-create.png)",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundSize: "contain",
				minHeight: "400px"
			}}></div>
			<div style={{display: "flex", flexDirection: "column", justifyContent: "space-around"}}>
				<div>
					<p>
						<b>Create the prediction</b><br/>
						To start the creation process run the "/prediction create" command in discord
					</p>
					<p>
						In this modal window you simply fill in all of the details about the prediction you want
					</p>
					<p>
						Make sure to put each option on it's own line.
						That's the only rule.
						You can have as many as you want and even include emotes
					</p>
				</div>
			</div>
		</div>

		<div style={imgTextLine}>
			<div style={{display: "flex", flexDirection: "column", justifyContent: "space-around"}}>
				<div>
					<p>
						Once a prediction is made you can right-click on it and under the apps section you'll see some commands
					</p>
					<p>
						These commands are how you manage an on-going prediction
					</p>
				</div>
				<p>
					<b>Lock/Unlock</b><br/>
					When a prediction is locked it will no longer allow people to make or change their wagers.
				</p>
				<div>
					<p>
						<b>Mark Answer</b><br/>
						Once you've clicked this a selection option will appear just like the wager placement one.
						However when you fill in this one it will set the correct answer for the prediction.
					</p>
					<p>
						Once an answer is marked nothing happens yet, and it is not displayed anywhere.
						It is simply a step before payout to give you a chance to verify what you've entered before paying out the prediction.
					</p>
				</div>
				<p>
					<b>Payout</b><br/>
					When this is ran it will determine the winners and pay them out accordingly
				</p>
			</div>
			<div style={{
				backgroundImage: "url(/image/prediction-right-click.png)",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundSize: "contain",
				minHeight: "400px"
			}}></div>
		</div>

		<h3>How are payouts calculated?</h3>
		<p>
			When a payout is calculated it sums the total amount of wagers plus the server's kitty.
			Then if anyone has zero dollars it will give each of them $1 taken out of this pool to make sure no one can end up without money.
		</p>
		<p>
			The remaining pool of money is then distributed among the winners based on what percentage of the winners they make up.
		</p>
		<p style="margin-left: 2em;">
			i.e. if someone's wager makes up 10% of the wagers of the winners, they will get 10% of the pool
		</p>
		<p>
			All payouts are made in whole dollars, and any left over money due to rounding is given to a random winner who currently has the least amount of money
		</p>
	</div>, { title: "Running a Prediction - Predictable Bot" })
}