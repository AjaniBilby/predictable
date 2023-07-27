import type http from "node:http";

export class ErrorResponse {
	code   : number;
	status : string;
	data   : any;

	constructor(statusCode: number, statusMessage: string, data?: any) {
		this.code   = statusCode;
		this.status = statusMessage;
		this.data   = data || "";
	}
}

export class Redirect {
	location: string;

	constructor(location: string) {
		this.location = location;
	}

	run(res: http.ServerResponse) {
		res.statusCode = 302;
		res.setHeader('Location', this.location);
		return res.end();
	}
}

export class Override {
	data : BufferSource;

	constructor(data: BufferSource) {
		this.data = data;
	}
}

export class State {
	req: http.IncomingMessage;
	res: http.ServerResponse;
	frag: string[];
	url: URL

	constructor(req: http.IncomingMessage, res: http.ServerResponse, url: URL) {
		this.req = req;
		this.res = res;
		this.url = url;

		this.frag = url.pathname.slice(1).split('/');
	}

	pop(): string {
		return this.frag.splice(0, 1)[0] || "";
	}
}