
import { GetMember } from "~/website/shared/discord";
import { RouteContext } from "~/router/router";
import { prisma } from "~/db";
import { shell } from "./$";

export async function loader({ params }: RouteContext) {
	const prediction = await prisma.prediction.findUnique({
		where: { id: params.poll },
		include: { options: true, wagers: true }
	})
	if (!prediction) return null;

	const messageURL = `discord://discord.com/channels/${prediction.guildID}/${prediction.channelID}/${prediction.id}`;
	const answered  = prediction.status === "CLOSED";
	const correctIDs = answered
		? prediction.options.filter(x => x.correct).map(x => x.index)
		: [];

	return shell(<div style="display: contents;">
		<div style={{
			display: "grid",
			gridTemplateColumns: "auto 1fr",
			borderRadius: prediction.image ? "5px 5px 0px 0px" : "5px",
			boxShadow: "0px 0px 5px 0px #0003",
			overflow: "hidden",
			width: "100%",
		}}>
			<div style={{
				display: "flex",
				alignItems: "center",
				padding: "3px 10px",

				backgroundColor: "#78dce8",
				fontWeight: "bold",
				fontSize: "1.2em",
				color: "white",
			}}>
				${prediction.wagers.reduce((s, x) => x.amount + s, 0)}
			</div>
			<div style={{padding: "10px 15px", color: "var(--text-color)"}}>
				<h2 style="margin: 0">
					<a target="_blank" href={messageURL} style="color: inherit;" safe>
						{prediction.title}
					</a>
				</h2>


				<ol style="margin: 0.3em 0 0 0; padding-left: 2em;">
					{prediction.options.map(opt =>
						<li style={opt.correct ? {
							backgroundColor: "var(--color-green)",
							borderRadius: "5px",
							fontWeight: "bold",
							margin: "5px 0px",
							padding: "5px",
						} : ""} safe>{opt.text}</li>
					)}
				</ol>
			</div>
		</div>

		{prediction.image ?
			<div class="image" style={{
				backgroundImage: `url('${prediction.image}')`,
				backgroundPosition: "center",
				backgroundSize: "cover",
				backgroundColor: "#eee",

				borderRadius: "0px 0px 5px 5px",
				aspectRatio: "3 / 2",
			}}></div> : ""
		}

		<h3>Wagers</h3>
		<div style={{
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
			gap: "10px"
		}} safe>
			{await Promise.all(prediction.wagers.map(async w => {
				const member = await GetMember(params.serv, w.userID, {});
				return <a href={`/server/${params.serv}/u/${w.userID}`}>
					<div class="horizontalCard" style={{
						position: "relative",
						backgroundColor:
							correctIDs.includes(w.choice) ? "var(--color-green)" :
							answered ? "var(--color-red)" :
							"var(--color-yellow)",
					}}>
						<div class="image" style={{
							backgroundImage: `url('${member?.displayAvatarURL()}')`,
						}}></div>
						<div class="body" style={{
							boxShadow: "inset 0px 0px 5px 0px #0003",
							flexGrow: "1",
						}}>
							<div style={{
								textTransform: "capitalize",
								marginBottom: "5px",
								fontWeight: "bold",
							}} safe>
								{member?.nickname || member?.displayName || "Unknown"}
							</div>
							<div>${w.amount}</div>
							{ w.payout > 0 ? <div style="font-size: 0.6em; margin: 3px 0px">
								Payout: ${w.payout}
							</div> : "" }
						</div>
						<div style={{
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
						}} title={prediction.options.find(x => x.index === w.choice)?.text || "Unknown"}>{w.choice+1}</div>
					</div>
				</a>
			}))}
		</div>
	</div>, { prediction });
}