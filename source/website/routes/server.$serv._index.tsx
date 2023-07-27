import * as elements from 'typed-html';

import { ErrorResponse, RenderArgs } from "../../router/index";
import { prisma } from '../../db';

export async function Render({params}: RenderArgs) {
	const data = await prisma.guild.findFirst({
		where: { id: params.serv },
		include: {
			predictions: {
				orderBy: [
					{ updatedAt: "desc" }
				]
			},
		}
	});

	if (!data) throw new ErrorResponse(404, "Resource not found", `Unable to load guild ${params.serv}`);

	return <div>
		Balance: {data.kitty}

		{data.predictions.map(pred => <div>
			{pred.title}
			{pred.status}
		</div>)}
	</div>;
}