import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>leaderboard</code></h3>
		<p>Shows the server's net value leaderboard</p>
	</div>;
}