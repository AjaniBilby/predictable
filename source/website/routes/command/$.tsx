import * as root from "~/website/routes/$";

export async function shell(inner: JSX.Element, options?: { title?: string }) {
	options ??= {};
	options.title ??= "Commands - Predictable Bot";

	return root.shell(<div style="display: contents;">
		<h1><a href="/command" style="color: inherit">Commands</a></h1>
		{inner}
	</div>, options);
}