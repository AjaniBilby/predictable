import type http from "node:http";


export type RenderArgs = {
	request: Request,
	params: { [key: string]: string }
	url: URL
};

export type Outlet = () => Promise<string>;
export type CatchFunction  = (args: RenderArgs, err: unknown) => Promise<Response | string | null>;
export type RenderFunction = (args: RenderArgs) => Promise<Response | string | null>;
export type RouteModule = {
	loader?:  RenderFunction;
	action?:  RenderFunction;
	error?:   CatchFunction;
}

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
	data : string | Buffer | Uint8Array;

	constructor(data: string | Buffer | Uint8Array) {
		this.data = data;
	}
}