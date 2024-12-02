import { RouteModule } from "~/router/shared";

export function IsAllowedExt(ext: string) {
	if (ext[0] !== ".") return false;

	// js, jsx, tsx, ts
	if (ext[2] !== "s") return false;
	if (ext[1] !== "j" && ext[1] !== "t" ) return false;

	if (ext.length == 3) return true;
	if (ext.length != 4) return false;
	if (ext[3] !== "x") return false;

	return true;
}

export class RouteContext {
	request: Request;
	params: { [key: string]: string };
	url: URL;

	render: (res: JSX.Element) => Response;

	constructor(request: RouteContext["request"], url: RouteContext["url"], renderer: RouteContext["render"]) {
		this.request = request;
		this.params = {};
		this.url = url;
		this.render = renderer;
	}
}

export class RouteLeaf {
	module: RouteModule;

	constructor(module: RouteModule) {
		this.module = module;
	}

	async resolve(ctx: RouteContext) {
		const res = await this.renderWrapper(ctx);
		if (res === null) return null;
		if (res instanceof Response) return res;

		return ctx.render(res);
	}

	async error(ctx: RouteContext, e: unknown) {
		if (!this.module.error) return null;

		const res = await this.module.error(ctx, e);
		if (res === null) return null;
		if (res instanceof Response) return res;

		return ctx.render(res);
	}

	private async renderWrapper(ctx: RouteContext) {
		try {
			if (ctx.request.method === "HEAD" || ctx.request.method === "GET") {
				if (this.module.loader) return await this.module.loader(ctx);
				else return null;
			} else {
				if (this.module.action) return await this.module.action(ctx);
				else {
					if (this.module.loader) return null;
					else throw new Response("Method not Allowed", { status: 405, statusText: "Method not Allowed"});
				}
			}
		} catch (e) {
			if (this.module.error) return await this.module.error(ctx, e);
			else throw e;
		}

		return null;
	}
}


export class RouteTree {
	nested   : Map<string, RouteTree>;

	// Leaf nodes
	index : RouteLeaf | null; // about._index

	// Wild card route
	slug: RouteLeaf | null; // $
	wild: RouteTree | null; // e.g. $userID
	wildCard: string;


	constructor() {
		this.nested = new Map();
		this.wildCard = "";
		this.slug = null;
		this.wild = null;

		this.index = null;
	}

	ingest(path: string| string[], module: RouteModule) {
		if (!Array.isArray(path)) path = path.split("/");

		if (path.length === 0 || (path.length == 1 && path[0] === "_index")) {
			this.index = new RouteLeaf(module);
			return;
		}

		if (path[0] === "$") {
			this.slug = new RouteLeaf(module);
			return;
		}

		if (path[0][0] === "$") {
			const wildCard = path[0].slice(1);
			// Check wildcard isn't being changed
			if (!this.wild) {
				this.wildCard = wildCard;
				this.wild = new RouteTree();
			} else if (wildCard !== this.wildCard) {
				throw new Error(`Redefinition of wild card ${this.wildCard} to ${wildCard}`);
			}

			path.splice(0, 1);
			this.wild.ingest(path, module);
			return;
		}

		let next = this.nested.get(path[0]);
		if (!next) {
			next = new RouteTree();
			this.nested.set(path[0], next);
		}

		path.splice(0, 1);
		next.ingest(path, module);
	}

	async resolve(fragments: string[], ctx: RouteContext): Promise<Response | null> {
		let res: Response | null = null;

		if (fragments.length === 0) {
			if (this.index) res = await this.index.resolve(ctx);
		} else {
			const next = this.nested.get(fragments[0]);
			if (next) res = await next.resolve(fragments.slice(1), ctx);
		}

		if (!res && this.slug) {
			ctx.params["$"] = fragments.join("/");
			if (this.slug.resolve) res = await this.slug.resolve(ctx);
			if (!res) res = await this.slug.error(ctx, new Response("Resource Not Found", { status: 404, statusText: "Not Found"}));
		}

		return res;
	}
}