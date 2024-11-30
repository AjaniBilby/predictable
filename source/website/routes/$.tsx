import { RenderArgs } from 'htmx-router';
import { GetSheet, StyleClass } from '~/router/css';

import { commit, version } from '~/version';

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

export async function shell(inner: JSX.Element, options?: { title?: string }) {
	options ??= {};

	return <html lang="en">
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			<meta charset="UTF-8"></meta>
			<script src="https://unpkg.com/htmx.org@1.9.4"></script>
			<script src="/script/index.js"></script>

			<title safe>{options.title || "Predictable Bot"}</title>

			<link rel="preconnect" href="https://fonts.googleapis.com"></link>
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="crossorigin"></link>
			<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&display=swap" rel="stylesheet"></link>

			<link href={`/_/style-${GetSheet().hash}.css`} rel="stylesheet"></link>

			<link href="/style/main.css" rel="stylesheet"></link>
			<link href="/style/index.css" rel="stylesheet"></link>

			<link rel="manifest" href="/manifest.json"/>
		</head>
		<body style="margin: 0px;">
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
				<div style={{
					display: "flex",
					padding: "10px 20px",
					gap: "20px",
					marginBottom: "10px"
				}}>
					<div style={{
						fontWeight: "bold",
						fontSize: "1.2em",
						flexGrow: 1,
					}}>
						<a href="/" style="color: inherit">Predictable Bot</a>
					</div>

					<div class={themeToggle.name} onclick='theme.toggle()'></div>
				</div>

				<div style="padding: 0px 25px">{inner}</div>

				<div style={{
					display: "flex",
					alignItems: "flex-end",
					flexGrow: "1",
					padding: "30px 25px 10px 25px",
					fontSize: "0.7em",
					color: "#75715E",
				}}>
					<div style={{
						display: "flex",
						justifyContent: "space-between",
						width: "100%"
					}}>
						<div>
							Commit <a href={`https://github.com/AjaniBilby/predictable/commit/${commit}` as 'safe'}>{commit.slice(0,7) as 'safe'}</a><br/>
							Version {version as 'safe'}
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

export async function error({}: RenderArgs, error: unknown) {
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