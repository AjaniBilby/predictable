import { AccountCard } from "./website/component/account-card";
import { GuildCard } from "./website/component/guild-card";

/* --------------------------------------
	DO NOT EDIT ANY CODE BELOW THIS LINE
---------------------------------------*/

let atomic = 0;
function NextAtomic() {
	const id = "_"+atomic.toString(32);
	atomic = (atomic + 1) % Number.MAX_SAFE_INTEGER;

	return id;
}
type FirstArg<T> = T extends (arg: infer U, ...args: any[]) => any ? U : never;
const Client = {
	AccountCard: function(props: FirstArg<typeof AccountCard> & { _ssr?: JSX.Element }) {
		const id = NextAtomic();
		const script = `const module = await import("./website/component/account-card?url");\n`
			+ `const component = module.AccountCard;\n`
			+ `const element = document.getElementById("${id}")`
			+ `const root = ReactDOM.createRoot(element);`
			+ ``;

		return
	}
}
export default Client;