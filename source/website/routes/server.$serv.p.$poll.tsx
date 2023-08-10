import { ErrorResponse, RenderArgs, StyleCSS, Link, Redirect } from "htmx-router";
import * as elements from 'typed-html';

import { prisma } from '../../db';

import { GetGuildOrThrow, GetMember } from "../shared/discord";
import isbot from "isbot";

export async function Render(rn: string, {req, url, params, shared, setTitle, addMeta}: RenderArgs) {
	const prediction = await prisma.prediction.findFirst({
		where: { guildID: params.serv, id: params.poll },
		include: {
			options: {
				orderBy: [ {index: "asc"} ]
			},
			wagers: {
				orderBy: [
					{payout: "desc"},
					{amount: "desc"}
				]
			},
		}
	});

	if (!prediction) throw new ErrorResponse(404, "Resource not found", `Unable to find prediction ${params.poll}`);

	const messageURL = `discord://discord.com/channels/${prediction.guildID}/${prediction.channelID}/${prediction.id}`;

	if (url.searchParams.has("redirect") && !isbot(req.headers["user-agent"]))
		throw new Redirect(messageURL);

	const guild = await GetGuildOrThrow(params.serv, shared);
	setTitle(`${prediction.title} - ${guild.name}`);

	const meta = [
		{ property: "og:title", content: prediction.title },
		{
			property: "og:description",
			content: prediction.options.map((x, i) => x.text).join(" | ")
		},
		{ property: "og:url", content: `${process.env.WEBSITE_URL}/server/${prediction.guildID}/p/${prediction.id}` },
	];
	if (prediction.image) {
		meta.push({ property: "og:image", content: prediction.image })
	}
	addMeta(meta, true);

	const answer = prediction.status === "CLOSED" ? prediction.answer : null;

	return <div id={rn}>
		<div style="margin: 10px 0px">
			<div style={StyleCSS({
				display: "inline flex",
				color: "white",
				fontWeight: "bold",
				borderRadius: "5px",
				overflow: "hidden"
			})}>
				<div style={StyleCSS({backgroundColor: "#ab9df2", padding: "3px 10px"})}>
					Status
				</div>
				<div style={StyleCSS({
					backgroundColor: prediction.status === "OPEN" ? "#a9dc76" : "#ff6188",
					textTransform: "capitalize",
					padding: "3px 10px",
				})}>
					{prediction.status.toLowerCase()}
				</div>
			</div>
		</div>

		<div style={StyleCSS({
			display: "grid",
			gridTemplateColumns: "auto 1fr",
			borderRadius: prediction.image ? "5px 5px 0px 0px" : "5px",
			boxShadow: "0px 0px 5px 0px #0003",
			overflow: "hidden",
			width: "100%",
		})}>
			<div style={StyleCSS({
				display: "flex",
				alignItems: "center",
				padding: "3px 10px",

				backgroundColor: "#78dce8",
				fontWeight: "bold",
				fontSize: "1.2em",
				color: "white",
			})}>
				${prediction.wagers.reduce((s, x) => x.amount + s, 0)}
			</div>
			<div style={StyleCSS({padding: "10px 15px", color: "var(--text-color)"})}>
				<h2 style="margin: 0">
					<a target="_blank" href={messageURL} style="color: inherit;">
						{prediction.title}
					</a>
				</h2>


				<ol style="margin: 0.3em 0 0 0; padding-left: 2em;">
					{prediction.options.map(opt =>
						<li style={opt.index === answer ? StyleCSS({
							backgroundColor: "var(--color-green)",
							borderRadius: "5px",
							fontWeight: "bold",
							margin: "5px 0px",
							padding: "5px",
						}) : ""}>{opt.text}</li>
					)}
				</ol>
			</div>
		</div>

		{prediction.image ?
			<div class="image" style={StyleCSS({
				backgroundImage: `url('${prediction.image}')`,
				backgroundPosition: "center",
				backgroundSize: "cover",
				backgroundColor: "#eee",

				borderRadius: "0px 0px 5px 5px",
				aspectRatio: "3 / 2",
			})}></div> : ""
		}

		<h3>Wagers</h3>
		<div style={StyleCSS({
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
			gap: "10px"
		})}>
			{await Promise.all(prediction.wagers.map(async w => {
				const member = await GetMember(params.serv, w.userID, shared);
				return <Link to={`/server/${params.serv}/u/${w.userID}`}>
					<div class="horizontalCard" style={StyleCSS({
						position: "relative",
						backgroundColor:
							answer === w.choice ? "var(--color-green)" :
							answer !== null ? "var(--color-red)" :
							"var(--color-yellow)",
					})}>
						<div class="image" style={StyleCSS({
							backgroundImage: `url('${member?.displayAvatarURL()}')`,
						})}></div>
						<div class="body" style={StyleCSS({
							boxShadow: "inset 0px 0px 5px 0px #0003",
							flexGrow: "1",
						})}>
							<div style={StyleCSS({
								textTransform: "capitalize",
								marginBottom: "5px",
								fontWeight: "bold",
							})}>
								{member?.nickname || member?.displayName || "Unknown"}
							</div>
							<div>
								${w.amount}
							</div>
							{ w.payout > 0 ? <div style="font-size: 0.6em; margin: 3px 0px">
								Payout: ${w.payout}
							</div> : "" }
						</div>
						<div style={StyleCSS({
							position: "absolute",
							right: "0", bottom: "0",
							minWidth: "1em",
							height: "1em",
							padding: "5px",
							boxShadow: "inset 0px 0px 5px 0px #0003",
							backgroundColor: "var(--bg-color)",
							borderRadius: "5px 0px 0px 0px",
							color: "var(--text-color)",
							textAlign: "center",
							fontWeight: "bold",
						})} title={prediction.options.find(x => x.index === w.choice)?.text || "Unknown"}>{w.choice+1}</div>
					</div>
				</Link>
			}))}
		</div>
	</div>;
}