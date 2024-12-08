import { RouteContext } from "htmx-router";
import { shell } from "~/website/routes/admin/$";

export async function loader({}: RouteContext) {
	return shell(<a href="/admin/logs">View Logs</a>);
}