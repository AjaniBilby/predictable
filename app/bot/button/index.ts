import type { ButtonInteraction, CacheType } from "discord.js";

import * as RefundBtn from "./refund";
import * as MarkBtn from "./mark";


const options = [
	RefundBtn,
	MarkBtn
];
const patterns = options.map(x => RegExp(x.name));

export async function execute(scope: ButtonInteraction<CacheType>) {
	const name = scope.customId;

	for (let i=0; i<options.length; i++) {
		if (patterns[i].test(name))
			return await options[i].execute(scope)
	}
}