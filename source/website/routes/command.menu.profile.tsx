import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>User Profile</h3>
		<p>Right click on the user's profile and get a link to see the user's profile on the companion site</p>
	</div>;
}