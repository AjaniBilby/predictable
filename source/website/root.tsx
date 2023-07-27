import * as elements from 'typed-html';


import { RenderArgs, Outlet, ErrorResponse, StyleCSS } from 'htmx-router';

export async function Render(args: RenderArgs, outlet: Outlet) {
	args.res.setHeader('Cache-Control', "public, 120");

	const inner = await outlet();

	args.addLinks([
		{rel: "stylesheet", href:"/style/main.css"}
	])

	return <html>
		<head>
			<title>Predictable</title>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			{args.renderHeadHTML()}
		</head>
		<body style={StyleCSS({
			display: "grid",
			gridTemplateColumns: "1fr max(700px) 1fr",
			margin: "0px",
		})}>
			<div style={StyleCSS({
				boxShadow: "0px 0px 20px 1px #0002",
				gridColumn: "2",
				padding: "0px 25px"
			})}>
				<h1><a href="/" style="color: inherit;">Predictable Bot</a></h1>
				<a href="/">Home</a>
				{inner}
			</div>
		</body>
	</html>
}


export async function CatchError(args: RenderArgs, e: ErrorResponse) {
	args.res.statusCode = e.code;

	args.addLinks([
		{rel: "stylesheet", href:"/style/main.css"}
	])

	return <html>
		<head>
			<title>{e.status}</title>
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			{args.renderHeadHTML()}
		</head>
		<body style={StyleCSS({
			display: "grid",
			gridTemplateColumns: "1fr max(600px) 1fr"
		})}>
			<div style={StyleCSS({
				gridColumn: "2"
			})}>
				<h1>{e.status}</h1>
				<p>{e.data}</p>
			</div>
		</body>
	</html>
}