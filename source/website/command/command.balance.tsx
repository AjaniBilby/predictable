import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>balance</code></h3>
		<p>Check your account balance</p>
	</div>;
}