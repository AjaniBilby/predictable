import { StyleClass, GenericContext } from "htmx-router";

import { Dynamic, Scripts } from "~/router";
import { version } from "~/version";
import { GetUser } from "~/helper/discord";

export const parameters = {};

const themeToggle = new StyleClass("theme-toggle", `
.this {
	background-image: url('/fontawesome/moon.svg');
	background-position: center;
	background-repeat: no-repeat;
	background-size: contain;
	width: 25px;
	cursor: pointer;
	user-select: none;
}

[data-theme=dark] .this {
	background-image: url('/fontawesome/sun.svg');
}
`);

const navbar = new StyleClass("navbar", `
.this {
	display: flex;
	padding: 10px 20px;
	gap: 20px;
	margin-bottom: 10px;

	box-shadow: 0px 0px 15px 2px #0002;
}

[data-theme=dark] .this {
	box-shadow: 0px 0px 15px 2px #000a;
	border-bottom: 1px solid #75715E;
}`).name;


async function Profile(props: {}, ctx: GenericContext): Promise<JSX.Element> {
	ctx.headers.set('Cache-Control', "private, max-age=120");
	const userID = ctx.cookie.get('userID');
	if (!userID) return <></>;

	const user = await GetUser(userID);
	if (!user) return <></>;

	const username = user?.username || "";
	const avatar = user?.avatarURL() || "";

	return <a href={`/user/${userID}`} style={{
		display: "flex",
		color: "inherit",
		textTransform: "capitalize",
		textDecoration: "none",
		alignItems: "center",
		gap: "5px",
	}}>
		<div safe>{username}</div>

		<div class="image" style={{
			backgroundImage: `url('${avatar}')`,
			backgroundPosition: "center",
			backgroundSize: "cover",
			backgroundColor: "#eee",

			borderRadius: "100%",
			aspectRatio: "1",
			width: "25px",
		}}></div>
	</a>
}

export async function shell(inner: JSX.Element, options?: { title?: string }) {
	options ??= {};

	return <html lang="en">
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			<meta charset="UTF-8"></meta>
			<script src="https://unpkg.com/htmx.org@2.0.3"></script>

			<title safe>{options.title || "Predictable Bot"}</title>

			<link rel="preconnect" href="https://fonts.googleapis.com"></link>
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="crossorigin"></link>
			<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&display=swap" rel="stylesheet"></link>

			<Scripts />

			<link href="/style/main.css" rel="stylesheet"></link>
			<link href="/style/index.css" rel="stylesheet"></link>

			<link rel="manifest" href="/manifest.json"/>
		</head>
		<body style="margin: 0px;" hx-boost="true">
			<div style={{
				display: "flex",
				flexDirection: "column",

				margin: "0px auto",

				minHeight: "100vh",
				maxWidth: "700px",
				width: "100%",

				overflow: "hidden",
				boxShadow: "0px 0px 20px 1px #0002",
			}}>
				<div class={navbar} id="navbar" hx-preserve="true">
					<div style={{
						fontWeight: "bold",
						fontSize: "1.2em",
						flexGrow: 1,
					}}>
						<a href="/" style="color: inherit; text-decoration: none;">Predictable Bot</a>
					</div>

					<Dynamic params={{}} loader={Profile}>
						<div style={{
							display: "flex",
							alignItems: "center",
							gap: "5px",
							viewTransitionName: "profile",
						}}>
							<div style={{
								borderRadius: "var(--radius)",
								backgroundColor: "#eee",
								height: "1em",
								width: "9ch",
							}}></div>

							<div style={{
								backgroundPosition: "center",
								backgroundSize: "cover",
								backgroundColor: "#eee",

								borderRadius: "100%",
								aspectRatio: "1",
								width: "25px",
							}}></div>
						</div>
					</Dynamic>
					<div class={themeToggle.name} onclick='Router.theme.toggle()'></div>
				</div>

				<div style="padding: 0px 25px">{inner}</div>

				<div style={{
					display: "flex",
					alignItems: "flex-end",
					flexGrow: "1",
					padding: "30px 25px 10px 25px",
					fontSize: "0.7em",
					color: "hsl(var(--muted-foreground))",
				}}>
					<div style={{
						display: "flex",
						justifyContent: "space-between",
						width: "100%"
					}}>
						<div>
							<a href="https://github.com/AjaniBilby/predictable/">Version {version as 'safe'}</a>
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

export async function error(ctx: GenericContext, error: unknown) {
	return shell(<div>
		{await ErrorBody(error) as 'safe'}
	</div>);
}


async function ErrorBody(error: unknown): Promise<JSX.Element> {
	if (error instanceof Response) {
		return <div>
			<h1 style={{ marginTop: 0 }}>{error.status} {error.statusText}</h1>
			<p safe>{await error.text()}</p>
		</div>
	} else if (error instanceof Error) {
		return <div>
			<h1 style={{ marginTop: 0 }}>Error</h1>
			<p>{error.message}</p>
			<p>Stack trace</p>
			<pre>{error.stack}</pre>
		</div>
	} else {
		return <div>
			<h1 style={{ marginTop: 0 }}>Error</h1>
		</div>
	}
}