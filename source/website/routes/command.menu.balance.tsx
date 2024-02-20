import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>User Balance</h3>
		<p>Right click on the user's profile and check the balance of their account</p>
	</div>;
}