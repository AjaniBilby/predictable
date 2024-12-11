import { shell } from "~/website/routes/admin/$";

export const parameters = {};

export async function loader() {
	return shell(<a href="/admin/logs">View Logs</a>);
}