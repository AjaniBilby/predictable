import type { CacheType, ContextMenuCommandInteraction } from "discord.js";

import * as PayoutMenu  from "./payout";
import * as ResolveMenu from "./mark";


const options = [
	PayoutMenu,
	ResolveMenu,
];

export async function execute(scope: ContextMenuCommandInteraction<CacheType>) {
	const name = scope.commandName;

	for (const opt of options) {
		if (opt.name !== name) continue;
		return await opt.execute(scope);
	}
}


export function ExportBindings() {
	return options.map(opt => opt.bind().toJSON());
}