import type { ButtonInteraction, CacheType } from "discord.js";

import * as RefundBtn from "./refund";


const options = [
	RefundBtn
];
const patterns = options.map(x => RegExp(x.name));

export async function execute(scope: ButtonInteraction<CacheType>) {
	const name = scope.customId;
	console.log(13, name, options.map(x => x.name));

	for (let i=0; i<options.length; i++) {
		if (patterns[i].test(name))
			return await options[i].execute(scope)
	}
}