export function IsAllowedExt(ext: string) {
	// js, jsx, tsx, ts
	if (ext[1] !== "s") return false;
	if (ext[0] !== "j" && ext[0] !== "t" ) return false;

	if (ext.length == 2) return true;
	if (ext.length != 3) return false;
	if (ext[2] !== "x") return false;

	return true;
}

// const dirRead = [
// 	"_index.tsx",
// 	"server.tsx",
// 	"server._index.tsx",
// 	"server.$servID.tsx",
// 	"server.$servID._index.tsx",
// 	"server.$servID_.$userID.tsx",
// 	"server.$servID_.$userID._index.tsx",
// 	"server.$servID_.$userID.history.tsx",
// ];
const dirRead = [
	"_index.tsx",
	"_index.tsx",
	"$servID.tsx",
	"$servID._index.tsx",
	"$servID_.$userID.tsx",
	"$servID_.$userID._index.tsx",
	"$servID_.$userID.history.tsx",
];


type RouteModule = {
	Render?: () => string;
}


class RouteLeaf {
	override: boolean[];
	module: RouteModule;

	constructor(module: RouteModule, override: boolean[]) {
		this.override = [];
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

const tree = new RouteTree();
for (const path of dirRead) {
	tree.ingest(path, {}, []);
}

console.log(tree);
