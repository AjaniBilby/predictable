import { Guild } from "discord.js";

import * as root from "~/routes/$";

export async function shell(inner: JSX.Element, guild: Guild | null, options?: { title?: string }) {
	options ??= {};
	options.title ??= guild?.name || "Unknown Guild";

	// TODO: Meta support
	// addMeta([
	// 	{ property: "og:title", content: `${guild.name} - Predictions` },
	// 	{ property: "og:image", content: banner }
	// ], true);

	const banner = guild?.bannerURL() || "";

	return root.shell(<div style="display: contents;">
		<a style={{ color: "inherit", textDecoration: "none" }} href={`/server/${guild?.id}`}>
			{ banner ?
				<div style={{
					backgroundImage: `url('${banner}')`,
					backgroundPosition: "center",
					backgroundSize: "cover",
					margin: "-10px -50px 0px -50px",
					height: "150px"
				}}></div>
				: ""
			}
			<h1 safe>{guild?.name || "Unknown Guild"}</h1>
		</a>
		{inner}
	</div>);
}