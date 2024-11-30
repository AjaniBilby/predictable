import * as html from '@kitajs/html';
import { GetSheet } from '~/router/css';
import { RenderArgs } from "~/router/shared";

export async function loader({ params }: RenderArgs) {
	const path = params["$"] || "";

	if (path.startsWith("style-")) return Sheet(path.slice("style-".length, -".css".length));

	return <div>
		Hello {path}
	</div>;
}

function Sheet(key: string) {
	const build = GetSheet();
	if (key !== build.hash) return null;

	const headers = new Headers();
	headers.set("Content-Type", "text/css");
	headers.set("Cache-Control", "public, max-age=604800");

	return new Response(build.sheet, { headers });
}