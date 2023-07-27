import * as elements from 'typed-html';


import { RenderArgs, Outlet, ErrorResponse } from '../router/index';

export async function Render({}: RenderArgs, outlet: Outlet) {
	return <html>
		<head>
			<title>Predictable Bot</title>
		</head>
		<body>
			<h1>Predictable</h1>
			{await outlet()}
		</body>
	</html>
}


export async function CatchError({res}: RenderArgs, e: ErrorResponse) {
	res.statusCode = e.code;

	return <html>
		<head></head>
		<body>
			<h1>{e.status}</h1>
			<p>{e.data}</p>
		</body>
	</html>
}