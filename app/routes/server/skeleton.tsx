import { prisma } from "~/db";
import { shell } from "~/routes/$";

export async function loader() {
	const guild = await prisma.guild.count({ where: { hide: false }});
	const array = new Array(guild).fill(0);

	return shell(<div>
		<h1>Servers using Predictable</h1>

		<div style={{
			display: 'flex',
			flexDirection: "row",
			alignItems: "flex-end",
			justifyContent: "space-evenly",
			flexWrap: "wrap",
			gap: "10px"
		}}>
			{array.map(x => <div class="skeleton" style={{ width: "180px", height: "70px" }}></div>)}
		</div>

		<p style={{
			textAlign: "center",
			marginTop: "40px",
			fontSize: "0.6em",
			color: "grey",
		}}>
			If your server wishes to be taken off this list you can
		</p>
	</div>, { title: "Server List" });
}