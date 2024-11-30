import * as html from '@kitajs/html';

import * as root from "~/website/routes/$";

export async function shell(inner: string, options?: { title?: string }) {
	options ??= {};
	options.title ??= "Guides - Predictable Bot";

	return root.shell(
		<div>
			<h1 style="margin-top: 0;">
				<a href="/guide" style="color: inherit">Guides</a>
			</h1>
			<ul>
				<li><a href="/guide/getting-started">Getting Started</a></li>
				<li><a href="/guide/prediction">Running a Prediction</a></li>
				<li><a href="/guide/permission">Managing Permissions</a></li>
				<li><a href="/guide/refund">Refund a Prediction</a></li>
				<li><a href="/guide/general">General Use</a></li>
			</ul>
			{inner}
		</div>
	);
}