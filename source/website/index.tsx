import * as elements from 'typed-html';
import * as dotenv from "dotenv";
import http from "node:http";
dotenv.config();


import {
	Outlet,
	ErrorResponse,
	Override,
	Redirect,
	State,
} from './helper';
import * as RootRoute from "./root";



const app = http.createServer((req, res) => {
	const url = new URL(req.url || "/", "http://localhost");

	if (url.pathname.length != 1 && url.pathname.endsWith("/")) {
		const newPath = url.pathname.slice(0, -1) + url.search;
		res.statusCode = 302;
		res.setHeader('Location', newPath);
		return res.end();
	}

	const s = new State(req, res, url);
	try {
		const final = Outlet(s, RootRoute.Render);
		res.end(final);
		return;
	} catch (e) {
		if (e instanceof Redirect)
			return e.run(res);
		if (e instanceof ErrorResponse)
			return CatchBoundary(s, e);

		if (e instanceof Override) {
			res.end(e.body);
		}
	}
});


function CatchBoundary(s: State, e: ErrorResponse) {
	s.res.statusCode = e.code;

	s.res.end(<html>
		<head></head>
		<body>
			<h1>{e.msg}</h1>
			<p>{e.body}</p>
		</body>
	</html>)
}


app.listen(process.env.HTTP_PORT, ()=> {
	console.log(`Listening on ${process.env.HTTP_PORT}`)
});

process.on('SIGTERM', () => {
	app.close();
})