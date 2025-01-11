import { RouteContext } from "htmx-router";
import { Style } from "htmx-router/css";

import { prisma } from "~/db";
import { shell } from "./$";

export const parameters = {
	poll: String
}

const navButton = new Style("navButton", `
.this {
	background-color: var(--blue);
	font-weight: bold;
	color: white !important;

	border-radius: 5px;
	padding: 6px 8px;
}`).name;

export async function loader({ params }: RouteContext<typeof parameters>) {
	const prediction = await prisma.prediction.findUnique({
		where: { id: params.poll },
		include: { options: true }
	})
	if (!prediction) return null;

	return shell(<form style="margin-top: 10px">
		<div style={{
			display: "grid",
			gridTemplateColumns: "1fr",
			gap: "10px",
		}}>
			<input name="title" value={prediction.title} placeholder="Title"></input>
			<input name="image" value={prediction.image} placeholder="Image URL"></input>
			<input name="description" value={prediction.description} placeholder="Description"></input>
			<textarea style="min-height: 10em" placeholder="One Option per line" safe>
				{prediction.options.map(x => x.text).join("\n")}
			</textarea>
			<div>
				<button class={navButton} name="action" value="update">Save</button>
			</div>
		</div>
	</form>, { prediction });
}