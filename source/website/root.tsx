import * as elements from 'typed-html';
import * as cookie from "cookie";

import { RenderArgs, Outlet, ErrorResponse, StyleCSS } from 'htmx-router';
import { web } from '../logging';
import { client, fetchWrapper } from '../bot/client';
import { prisma } from '../db';
import { version } from '../version';

export async function Render(args: RenderArgs, outlet: Outlet) {
	args.res.setHeader('Cache-Control', "public, max-age=120");
	const cookies = cookie.parse(args.req.headers.cookie || "");

	const userID = cookies.userID;
	const user = userID && cookies.key &&
		await prisma.user.findFirst({where: {id: userID, session: cookies.key}});

	const loggedIn = !!user;
	let avatar = "";
	let username = "";
	if (loggedIn) {
		const user = await fetchWrapper(client.users.fetch(userID));
		username = user?.username || "";
		avatar = user?.avatarURL() || "";
		console.log(26, user);

		args.res.setHeader('Cache-Control', "private, max-age=120");
	}


	const inner = await outlet();
	args.addLinks([
		{rel: "stylesheet", href:"/style/main.css"}
	]);

	return <html>
		<head>
			<title>Predictable</title>
			<script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
			<script src="https://unpkg.com/htmx.org@1.9.4"></script>
			<link rel="manifest" href="/manifest.json"/>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			{args.renderHeadHTML()}
		</head>
		<body data-dark={cookies.dark === "true"} style="margin: 0px;">
			<div style={StyleCSS({
				display: "flex",
				flexDirection: "column",

				margin: "0px auto",

				minHeight: "100vh",
				maxWidth: "700px",
				width: "100%",

				overflow: "hidden",
				boxShadow: "0px 0px 20px 1px #0002",
			})}>
				<div style={StyleCSS({
					display: "flex",
					padding: "10px 20px",
					gap: "20px",
					boxShadow: "0px 0px 15px 2px #0002"
				})}>
					<div style={StyleCSS({
						fontWeight: "bold",
						fontSize: "1.2em",
						flexGrow: 1,
					})}>
						<a href="/" style="color: inherit">Predictable Bot</a>
					</div>

					<div
						hx-get="/api/theme/swap"
						style={StyleCSS({
							display: "flex",
							alignItems: "center",
							cursor: "pointer",
							userSelect: "none"
						})}
					>{cookies.dark === "true" ? "Light" : "Dark"}</div>

					{loggedIn ?
						<a href={`/account/${userID}`} style={StyleCSS({
							display: "flex",
							color: "inherit",
							textTransform: "capitalize",
							alignItems: "center",
							gap: "5px"
						})}>
							{username}

							<div class="image" style={StyleCSS({
								backgroundImage: `url('${avatar}')`,
								backgroundPosition: "center",
								backgroundSize: "cover",
								backgroundColor: "#eee",

								borderRadius: "100%",
								aspectRatio: "1",
								width: "25px",
							})}></div>
						</a> : ""
					}
				</div>

				<div style="padding: 0px 25px">{inner}</div>

				<div style={StyleCSS({
					display: "flex",
					alignItems: "flex-end",
					flexGrow: "1",
					padding: "30px 25px 10px 25px",
					fontSize: "0.7em",
					color: "#75715E",
				})}>
					<div>Version {version}</div>
				</div>
			</div>
		</body>
	</html>
}


export async function CatchError(args: RenderArgs, e: ErrorResponse) {
	args.res.statusCode = e.code;

	let darkTheme = (args.req.headers.cookie && args.req.headers.cookie.includes("DARK-THEME=TRUE")) || false;
	args.addLinks([
		{rel: "stylesheet", href:"/style/main.css"}
	]);

	web("ERR", e.data);

	return <html>
		<head>
			<title>Predictable</title>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			{args.renderHeadHTML()}
		</head>
		<body data-dark={darkTheme} style={StyleCSS({
			display: "grid",
			gridTemplateColumns: "1fr max(700px) 1fr",
			margin: "0px"
		})}>
			<div style={StyleCSS({
				boxShadow: "0px 0px 20px 1px #0002",
				gridColumn: "2",
				padding: "0px 25px",
				minHeight: "100vh"
			})}>
				<h1><a href="/" style="color: inherit;">Predictable Bot</a></h1>
				<h1>{e.status}</h1>
				<p>{e.data}</p>
			</div>
		</body>
	</html>
}