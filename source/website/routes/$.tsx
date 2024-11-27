import * as html from '@kitajs/html';

import { commit, version } from '~/version';

export async function shell(inner: string) {
	const darkTheme = false;

	return <html lang="en">
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			<meta charset="UTF-8"></meta>
			<script src="https://unpkg.com/htmx.org@1.9.4"></script>
			<script src="/script/index.js"></script>

			<title>Predictable Bot</title>

			<link rel="preconnect" href="https://fonts.googleapis.com"></link>
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="crossorigin"></link>
			<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&display=swap" rel="stylesheet"></link>

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

					<div
						hx-get="/api/theme/swap"
						style={{
							backgroundImage: darkTheme ? "url('/fontawesome/sun.svg')" : "url('/fontawesome/moon.svg')",
							backgroundPosition: "center",
							backgroundRepeat: "no-repeat",
							backgroundSize: "contain",
							width: "25px",
							cursor: "pointer",
							userSelect: "none"
						}}
					></div>
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