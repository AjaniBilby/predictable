import { ErrorResponse, RenderArgs, StyleCSS, Link } from "htmx-router";
import * as elements from 'typed-html';

import { prisma } from '../../db';

import { AccountCard } from '../component/account-card';
import { GetGuild } from "../shared/discord";

export async function Render(rn: string, {params, shared, setTitle}: RenderArgs) {
	const prediction = await prisma.prediction.findFirst({
		where: { guildID: params.serv, id: params.poll },
		include: {
			options: {
				orderBy: [ {index: "asc"} ]
			},
			wagers: {
				orderBy: [ {amount: "desc"} ]
			},
		}
	});

	if (!prediction) throw new ErrorResponse(404, "Resource not found", `Unable to find prediction ${params.poll}`);

	const guild = await GetGuild(params.serv, shared);

	setTitle(`${prediction.title} - ${guild.name}`);

	return <div id={rn}>
		{prediction.image ?
			<div class="image" style={StyleCSS({
				backgroundImage: `url('${prediction.image}')`,
				backgroundPosition: "center",
				backgroundSize: "fit",
				backgroundColor: "#eee",

				borderRadius: "5px 5px 0px 0px",
				height: "130px",
			})}></div> : ""
		}

		<h2>{prediction.title}</h2>

		<div>
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
				{ prediction.status === "OPEN" ?
					<div style={StyleCSS({backgroundColor: "#a9dc76", padding: "3px 10px"})}>
						Open
					</div> :
					<div style={StyleCSS({ backgroundColor: "#ff6188", padding: "3px 10px" })}>
						Closed
					</div>
				}
			</div>
		</div>

		<ol>
			{prediction.options.map(opt =>
				<li>{opt.text}</li>
			)}
		</ol>

		<h3>Wagers</h3>
		<div style={StyleCSS({ display: "flex", flexWrap: "wrap", flexDirection: "row", gap: "10px" })}>
			{await Promise.all(prediction.wagers.map(async w => {
				const member = await guild.members.fetch(w.userID);
				return <Link to={`/server/${params.serv}/u/${w.userID}`}>
					<AccountCard member={member} account={{
						balance: w.amount,
						guildID: params.serv,
						userID: w.userID
					}} />
				</Link>
			}))}
		</div>
	</div>;
}