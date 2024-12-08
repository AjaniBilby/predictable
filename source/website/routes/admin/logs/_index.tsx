import { RouteContext } from "htmx-router";
import { shell } from "~/website/routes/admin/logs/$";

export async function loader({}: RouteContext) {
	return shell(<ul>
		<li><a href="/admin/logs/website">Website</a></li>
		<li><a href="/admin/logs/bot">Bot</a></li>
		<li><a href="/admin/logs/all">All</a></li>
	</ul>);
}