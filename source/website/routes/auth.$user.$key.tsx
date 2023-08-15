import * as elements from '@kitajs/html';
import * as cookie from "cookie";

import { ErrorResponse, RenderArgs } from "htmx-router";
import { client, fetchWrapper } from '../../bot/client';
import { prisma } from '../../db';

export async function Render(rn: string, {res, params}: RenderArgs) {
	res.setHeader('Cache-Control', "no-cache");

	const user = await prisma.user.findFirst({
		where: { id: params.user },
		include: {
			accounts: true
		}
	});

	if (!user)
		throw new ErrorResponse(400, "Bad Request", "Unknown user");

	if (user.session !== params.key)
		throw new ErrorResponse(400, "Bad Request", "Bad authentication");

	const settings = {
		maxAge: 60 * 60 * 24 * 7, // 1 week
		httpOnly: true,
		sameSite: true,
		path: "/",
	};
	res.setHeader('Set-Cookie', [
		cookie.serialize('userID', user.id, settings),
		cookie.serialize('key', params.key, settings)
	]);


	let dUser = await fetchWrapper(client.users.fetch(params.user));
	return <div id={rn} style={{
		display: "flex",
		flexDirection: "column",
		alignItems: "center"
	}}>
		<h1 style="text-transform: capitalize;">Welcome {dUser?.username}</h1>

		<div class="image" style={{
			backgroundImage: `url('${dUser?.displayAvatarURL()}')`,
			backgroundPosition: "center",
			backgroundSize: "cover",
			backgroundColor: "#eee",

			borderRadius: "5px",
			aspectRatio: "1",
			width: "130px",
		}}></div>

		<button style="margin: 20px 0px" hx-get={`/user/${params.user}`}>Goto Profile</button>
	</div>;
}