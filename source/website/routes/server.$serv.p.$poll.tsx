import * as elements from 'typed-html';

import { ErrorResponse, RenderArgs } from "htmx-router";
import { prisma } from '../../db';

export async function Render({params}: RenderArgs) {
	const prediction = await prisma.prediction.findFirst({
		where: { guildID: params.serv, id: params.poll },
		include: {
			options: {
				orderBy: [ {index: "asc"} ]
			},
			wagers: true,
		}
	});

	if (!prediction) throw new ErrorResponse(404, "Resource not found", `Unable to find prediction ${params.poll}`);

	return <div>
		<h2>{prediction.title}</h2>

		{prediction.options.map(opt => <div>
			{opt.text}
		</div>)}
	</div>;
}