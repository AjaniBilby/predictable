import { Guild } from "discord.js";
import { ApplyMetaDescriptorDefaults, ShellOptions } from "htmx-router";

import * as root from "~/routes/$";

export async function shell(inner: JSX.Element, options: ShellOptions<{ guild: Guild | null }>) {
	const guild  = options.guild;
	const banner = guild?.bannerURL() || "";

	ApplyMetaDescriptorDefaults(options, guild ? {
		title: `${guild.name} - Predictions`,
		og: { image: [{ url: guild!.bannerURL() || ""}] }
	} : {});

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
	</div>, options);
}