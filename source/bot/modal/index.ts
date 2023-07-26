import type { CacheType } from "discord.js";
import {
	ModalSubmitInteraction,
} from "discord.js";

import * as SetWagerModal from "./set-wager";


const options = [
	SetWagerModal
];
const patterns = options.map(x => RegExp(x.name));

export async function execute(scope: ModalSubmitInteraction<CacheType>) {
	const name = scope.customId;

	for (let i=0; i<options.length; i++) {
		if (!patterns[i].test(name)) continue;
		options[i].execute(scope);
	}
}