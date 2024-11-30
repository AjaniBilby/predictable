import * as root from "~/website/routes/$";

export async function shell(inner: JSX.Element, options?: { title?: string }) {
	options ??= {};
	options.title ??= "Guides - Predictable Bot";

	return root.shell(
		<div>
			<a href="/guide" style="color: inherit; text-decoration: none;">
				<h1>Guides</h1>
			</a>

			{inner}
		</div>
	);
}