import type { CacheType, ModalSubmitInteraction } from "discord.js";

import * as CreateModal from "./create";
import * as SetWagerModal from "./set-wager";


const options = [
	CreateModal,
	SetWagerModal
];
const patterns = options.map(x => RegExp(x.name));

export async function execute(scope: ModalSubmitInteraction<CacheType>) {
	const name = scope.customId;

	for (let i=0; i<options.length; i++) {
		if (patterns[i].test(name))
			return await options[i].execute(scope)
	}
}