import http from "node:http";

const server = http.createServer(async (req, res) => {
	const ctrl = new AbortController()
	const headers = new Headers(req.headers as any);
	const url = new URL(`http://${headers.get('host')}${req.url}`);

	req.once('aborted', () => ctrl.abort())

	const fetchRequest = new Request(url, {
		headers,
		method: req.method,
		// body: req as any,
		body: req.method === "GET" || req.method === "HEAD" ? undefined : req as any,
		signal: ctrl.signal,
		referrer: headers.get("referrer") || undefined,
		// @ts-expect-error
		duplex: 'half',
	});

	let fetchResponse;

	switch (url.pathname) {
		case "/hello":
			fetchResponse = new Response('Hello Route', { status: 200 });
			break;
		case "/form":
			const formData = await fetchRequest.formData();
			console.log(formData.get("cow"))
			fetchResponse = new Response('yup', { status: 200 });
			break;
		default:
			fetchResponse = new Response('Not Found', { status: 404 });
	}

	res.writeHead(fetchResponse.status, Object.fromEntries(fetchResponse.headers));
	const responseBody = await fetchResponse.text();
	res.end(responseBody);
});

server.listen(3000, () => {
	console.log('Server running at http://localhost:3000/');
});
