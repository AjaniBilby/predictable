import type http from "node:http";

export class ErrorResponse {
	code: number;
	msg: string;
	body: string;

	constructor(statusCode: number, statusMessage: string, body?: string) {
		this.code = statusCode;
		this.msg  = statusMessage;
		this.body = body || "";
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
	level: number;
	body:   string;

	constructor(levels: number, body: string) {
		this.level = levels;
		this.body   = body;
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

		this.frag = url.pathname.split('/');
	}

	pop(): string {
		return this.frag.splice(0, 1)[0] || "";
	}
}


export type Route = (s: State) => string
export function BoilWrapper(s: State, child: Route): string {
	try {
		return child(s);
	} catch (e) {
		if (e instanceof ErrorResponse || e instanceof Redirect) {
			throw e;
		}

		if (e instanceof Override) {
			if (e.level === 0) return e.body;
		}

		throw new ErrorResponse(500, "Internal Server Error", e?.toString() || "Unknown Error");
	}
}