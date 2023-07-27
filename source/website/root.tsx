import * as elements from 'typed-html';


import { RenderArgs, Outlet, ErrorResponse } from '../router/index';

export function Render({}: RenderArgs, outlet: Outlet) {
	return <html>
		<head></head>
		<body>
			<h1>JSX app</h1>
			{outlet()}
		</body>
	</html>
}


export function CatchError({res}: RenderArgs, e: ErrorResponse) {
	res.statusCode = e.code;

	return <html>
		<head></head>
		<body>
			<h1>{e.status}</h1>
			<p>{e.data}</p>
		</body>
	</html>
}