import type { CacheType, StringSelectMenuInteraction } from "discord.js";

import * as ChoiceSel  from "~/bot/select/choice";
import * as ResolveSel from "~/bot/select/resolve";

const options = [
	ChoiceSel,
	ResolveSel
];
const patterns = options.map(x => RegExp(x.name));

export async function execute(scope: StringSelectMenuInteraction<CacheType>) {
	const name = scope.customId;

	for (let i=0; i<options.length; i++) {
		if (patterns[i].test(name))
			return await options[i].execute(scope);
	}

	await scope.reply({
		content: `Error executing selection "${name}"`,
		ephemeral: true
	})
}