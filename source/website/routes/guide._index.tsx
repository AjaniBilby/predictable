import html from '@kitajs/html';


export async function Render(rn: string) {

	return <div id={rn}>
		<p>
			<i>Pick a guide from the above list</i>
		</p>
	</div>;
}