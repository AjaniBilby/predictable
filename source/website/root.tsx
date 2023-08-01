import { RenderArgs, ErrorResponse, StyleCSS, Link } from 'htmx-router';
import * as elements from 'typed-html';

import { commit, version } from '../version';
import { prisma } from '../db';
import { web } from '../logging';

import { GetCookies } from "./shared/cookie";
import { GetUser } from './shared/discord';

export async function Auth({req, res, shared}: RenderArgs) {
	const cookies = GetCookies(req, shared);

	if (cookies.userID && cookies.key) {
		shared.auth = await prisma.user.findFirst({
			where: {
				id: cookies.userID,
				session: cookies.key
			}
		});
	} else {
		shared.auth = null;
	}

	if (shared.auth) {
		res.setHeader('Cache-Control', "private, max-age=120");
	} else {
		res.setHeader('Cache-Control', "public, max-age=120");
	}

	return;
}

export async function Render(rn: string, {
	req, res, shared,
	setTitle, addLinks, Outlet, renderHeadHTML
}: RenderArgs) {
	setTitle("Predictable Bot");

	const cookies = GetCookies(req, shared);

	const loggedIn = !!shared.auth;
	let avatar = "";
	let username = "";
	if (loggedIn) {
		res.setHeader('Cache-Control', "private, max-age=120");
		const user = await GetUser(shared.auth.id, shared);
		username = user?.username || "";
		avatar = user?.avatarURL() || "";
	}


	const inner = await Outlet();
	addLinks([
		{rel: "stylesheet", href:"/style/main.css"}
	]);


	const darkTheme = cookies.dark === "true";
	return <html lang="en">
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			<meta charset="UTF-8"></meta>
			<script src="https://unpkg.com/htmx.org@1.9.4"></script>
			<link rel="manifest" href="/manifest.json"/>
			{renderHeadHTML()}
		</head>
		<body data-dark={darkTheme} style="margin: 0px;" id={rn}>
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
					boxShadow: darkTheme ? "0px 0px 15px 2px #000a" : "0px 0px 15px 2px #0002",
					borderBottom: darkTheme ? "1px solid #75715E" : "",
					marginBottom: "10px"
				})}>
					<div style={StyleCSS({
						fontWeight: "bold",
						fontSize: "1.2em",
						flexGrow: 1,
					})}>
						<Link to="/" style="color: inherit">Predictable Bot</Link>
					</div>

					<div
						hx-get="/api/theme/swap"
						style={StyleCSS({
							backgroundImage: darkTheme ? "url('/fontawesome/sun.svg')" : "url('/fontawesome/moon.svg')",
							backgroundPosition: "center",
							backgroundRepeat: "no-repeat",
							backgroundSize: "contain",
							width: "25px",
							cursor: "pointer",
							userSelect: "none"
						})}
					></div>

					{loggedIn ?
						<a href={`/user/${shared.auth.id}`} style={StyleCSS({
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
					<div style={StyleCSS({
						display: "flex",
						justifyContent: "space-between",
						width: "100%"
					})}>
						<div>
							Commit <a href={`https://github.com/AjaniBilby/predictable/commit/${commit}`}>{commit.slice(0,7)}</a><br/>
							Version {version}
						</div>
						<div style="text-align: right;">
							<a href="https://ko-fi.com/ajanibilby">Donate</a><br/>
							<a href="https://github.com/AjaniBilby/predictable/issues/new">Report</a> an Issue<br/>
						</div>
					</div>
				</div>
			</div>
		</body>
	</html>
}


export async function CatchError(rn: string, {req, res, shared, title, addLinks, renderHeadHTML}: RenderArgs, e: ErrorResponse) {
	res.statusCode = e.code;

	addLinks([
		{rel: "stylesheet", href:"/style/main.css"}
	]);

	web("ERR", e.data.stack || e.data.toString());


	const cookies = GetCookies(req, shared);
	const darkTheme = cookies.dark === "true";
	return <html lang="en">
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			<meta charset="UTF-8"></meta>
			<title>{title}</title>
			<script src="https://unpkg.com/htmx.org@1.9.4"></script>
			<link rel="manifest" href="/manifest.json"/>
			{renderHeadHTML()}
		</head>
		<body data-dark={darkTheme} style="margin: 0px;" id={rn}>
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
					boxShadow: darkTheme ? "0px 0px 15px 2px #000a" : "0px 0px 15px 2px #0002",
					borderBottom: darkTheme ? "1px solid #75715E" : "",
					marginBottom: "10px"
				})}>
					<div style={StyleCSS({
						fontWeight: "bold",
						fontSize: "1.2em",
						flexGrow: 1,
					})}>
						<Link to="/" style="color: inherit">Predictable Bot</Link>
					</div>

					<div
						hx-get="/api/theme/swap"
						style={StyleCSS({
							backgroundImage: darkTheme ? "url('/fontawesome/sun.svg')" : "url('/fontawesome/moon.svg')",
							backgroundPosition: "center",
							backgroundRepeat: "no-repeat",
							backgroundSize: "contain",
							width: "25px",
							cursor: "pointer",
							userSelect: "none"
						})}
					></div>
				</div>

				<div style="padding: 0px 25px">
					<h1>{e.status}</h1>
					<p>{e.data}</p>
				</div>

				<div style={StyleCSS({
					display: "flex",
					alignItems: "flex-end",
					flexGrow: "1",
					padding: "30px 25px 10px 25px",
					fontSize: "0.7em",
					color: "#75715E",
				})}>
					<div style={StyleCSS({
						display: "flex",
						justifyContent: "space-between",
						width: "100%"
					})}>
						<div>
							Commit <a href={`https://github.com/AjaniBilby/predictable/commit/${commit}`}>{commit.slice(0,7)}</a><br/>
							Version {version}
						</div>
						<div style="text-align: right;">
							<a href="https://ko-fi.com/ajanibilby">Donate</a><br/>
							<a href="https://github.com/AjaniBilby/predictable/issues/new">Report</a> an Issue<br/>
						</div>
					</div>
				</div>
			</div>
		</body>
	</html>
}