import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>lock</code></h3>
		<p>Only allow users with permission to create predictions</p>
		<p>This command can only be ran by users who have administrative permissions in the server</p>
	</div>;
}