export function IsAllowedExt(ext: string) {
	// js, jsx, tsx, ts
	if (ext[1] !== "s") return false;
	if (ext[0] !== "j" && ext[0] !== "t" ) return false;

	if (ext.length == 2) return true;
	if (ext.length != 3) return false;
	if (ext[2] !== "x") return false;

	return true;
}


type RouteModule = {
	Render?:     () => string;
	CatchError?: () => string;
}


class RouteLeaf {
	override: boolean[];
	module: RouteModule;

	constructor(module: RouteModule, override: boolean[]) {
		this.override = override;
		this.module   = module;
	}
}


export class RouteTree {
	nested   : Map<string, RouteTree>;

	// Wild card route
	// e.g. $userID
	wild: RouteTree | null;
	wildCard: string;

	// Leaf nodes
	default : RouteLeaf | null; // about.index_
	route   : RouteLeaf | null; // about

	constructor() {
		this.nested   = new Map();
		this.wildCard = "";
		this.wild = null;

		this.default = null;
		this.route   = null;
	}

	assignRoot(module: RouteModule) {
		if (!module.Render)
			throw new Error(`Root route is missing Render()`);
		if (!module.CatchError)
			throw new Error(`Root route is missing CatchError()`);

		this.route = new RouteLeaf(module, []);
	}

	ingest(path: string| string[], module: RouteModule, override: boolean[]) {
		if (!Array.isArray(path)) {
			path = path.split(".");
			console.log(path);

			if (!IsAllowedExt(path[path.length-1]))
				return;

			path = path.slice(0, -1);
		}

		if (path.length === 0) {
			this.route = new RouteLeaf(module, override);
			return;
		}
		if (path.length === 1 && path[0] === "_index") {
			this.default = new RouteLeaf(module, override);
			return;
		}

		if (path[0].endsWith("_")) {
			path[0] = path[0].slice(0, -1);
			override.push(true);
		} else {
			override.push(true);
		}

		if (path[0][0] === "$") {
			const wildCard = path[0].slice(1);

			// Check wildcard isn't being changed
			if (!this.wild) {
				this.wildCard = wildCard;
			} else if (wildCard !== this.wildCard) {
				throw new Error(`Redefinition of wild card ${this.wildCard} to ${wildCard}`);
			}

			this.wild = new RouteTree();

			path.splice(0, 1);
			this.wild.ingest(path, module, override);
			return;
		}

		let next = this.nested.get(path[0]);
		if (!next) {
			next = new RouteTree();
			this.nested.set(path[0], next);
		}

		path.splice(0, 1);
		next.ingest(path, module, override);
	}
}
