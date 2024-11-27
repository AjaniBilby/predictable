import * as html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<h3>/Prediction <code>create</code></h3>
		<p>Creates a new prediction by opening a modal window</p>
	</div>;
}