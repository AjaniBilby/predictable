import type { CacheType, StringSelectMenuInteraction } from "discord.js";

import * as PlaceWagerSel from "./place-wager";


const options = [
	PlaceWagerSel
];
const patterns = options.map(x => RegExp(x.name));

export async function execute(scope: StringSelectMenuInteraction<CacheType>) {
	const name = scope.customId;

	for (let i=0; i<options.length; i++) {
		if (!patterns[i].test(name)) continue;
		options[i].execute(scope);
	}
}