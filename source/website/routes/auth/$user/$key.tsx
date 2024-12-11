import { RouteContext, CookieOptions } from "htmx-router";

import { client, fetchWrapper } from "~/bot/client";
import { prisma } from "~/db";

import { shell } from "~/website/routes/$";

export const parameters = {
	user: String,
	key: String
};

export async function loader({ params, cookie, headers }: RouteContext<typeof parameters>) {
	headers.set("Clear-Site-Data", '"cache", "executionContexts"');
	headers.set("Cache-Control", "no-cache");
	headers.set("Strict-Transport-Security", "max-age=604800"); // 7 days
	headers.set("Upgrade-Insecure-Requests", "1");

	const user = await prisma.user.findFirst({
		where: { id: params.user },
		include: {
			accounts: true
		}
	});

	if (!user) throw new Response("Unknown User", { status: 404, statusText: "Not Found"});

	if (user.session !== params.key) throw new Response("Bad authentication", { status: 400, statusText: "Bad Request"});

	const settings: CookieOptions = {
		maxAge: 60 * 60 * 24 * 7, // 1 week
		httpOnly: true,
		sameSite: "strict",
		path: "/",
	};
	cookie.set('userID', user.id, settings);
	cookie.set('key', user.id, settings);

	let dUser = await fetchWrapper(client.users.fetch(params.user));
	return shell(<div style={{
		display: "flex",
		flexDirection: "column",
		alignItems: "center"
	}}>
		<h1 style="text-transform: capitalize;" safe>Welcome {dUser?.username}</h1>

		<div class="image" style={{
			backgroundImage: `url('${dUser?.displayAvatarURL()}')`,
			backgroundPosition: "center",
			backgroundSize: "cover",
			backgroundColor: "#eee",

			borderRadius: "5px",
			aspectRatio: "1",
			width: "130px",
		}}></div>

		<a href={`/user/${user.id}`} style={{ textDecoration: "none" }}>
			<button style="margin: 20px 0px">Goto Profile</button>
		</a>
	</div>);
}