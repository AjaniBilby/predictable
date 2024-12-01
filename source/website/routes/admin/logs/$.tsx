import * as admin from "~/website/routes/$";

export async function shell(inner: JSX.Element, options?: { title?: string }) {
	options ??= {};
	options.title ??= "Logs - Admin Panel";

	return admin.shell(<div style="display: contents;">
		<h2><a href="/admin/logs" style="color: inherit">Logs</a></h2>
		{inner}
	</div>);
}