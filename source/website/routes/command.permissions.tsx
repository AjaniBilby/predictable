import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>permissions</code></h3>
		<p>Shows a list of all users and roles added to the permissions list for this bot</p>
	</div>;
}