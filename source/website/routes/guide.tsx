import { RenderArgs, Link } from "htmx-router";
import * as elements from '@kitajs/html';


export async function Render(rn: string, {Outlet, setTitle}: RenderArgs) {
	setTitle("Guides - Predictable Bot")

	return <div id={rn}>
		<h1>
			<Link to="/guide" style="color: inherit">Guides</Link>
		</h1>
		<ul>
			<li><Link to="/guide/getting-started">Getting Started</Link></li>
			<li><Link to="/guide/prediction">Running a Prediction</Link></li>
			<li><Link to="/guide/permission">Managing Permissions</Link></li>
			<li><Link to="/guide/refund">Refund a Prediction</Link></li>
			<li><Link to="/guide/general">General Use</Link></li>
		</ul>
		{await Outlet()}
	</div>;
}