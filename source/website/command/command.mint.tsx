import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>mint</code></h3>

		<p>Creates money to give to an account, this value must be a whole number, and can be negative to deduct funds from a person</p>
		<p>This command can only be ran by users who have administrative permissions in the server</p>
	</div>;
}