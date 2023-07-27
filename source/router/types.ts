import type http from "node:http";

export type Outlet = () => string;

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


export class RenderArgs {
	req: http.IncomingMessage;
	res: http.ServerResponse;
	params: { [key: string]: string };
	url: URL

	constructor(req: http.IncomingMessage, res: http.ServerResponse, url: URL) {
		this.req = req;
		this.res = res;
		this.url = url;
		this.params = {};
	}
}