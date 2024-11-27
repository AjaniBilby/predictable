import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>transfer</code></h3>
		<p>Send fund from your account to another user</p>
	</div>;
}