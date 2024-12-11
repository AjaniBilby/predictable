import { shell } from "~/website/routes/guide/$";

export async function loader() {
	return shell(<ul>
		<li><a href="/guide/getting-started">Getting Started</a></li>
		<li><a href="/guide/prediction">Running a Prediction</a></li>
		<li><a href="/guide/permission">Managing Permissions</a></li>
		<li><a href="/guide/refund">Refund a Prediction</a></li>
		<li><a href="/guide/general">General Use</a></li>
	</ul>);
}