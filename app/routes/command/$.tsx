import * as root from "~/routes/$";

export async function shell(inner: JSX.Element, options?: { title?: string }) {
	options ??= {};
	options.title ??= "Commands - Predictable Bot";

	return root.shell(<div style="display: contents;">
		<a href="/command" style="color: inherit; text-decoration: none;"><h1>Commands</h1></a>
		{inner}
	</div>, options);
}