import type { CacheType, ContextMenuCommandInteraction } from "discord.js";

import * as BalanceMenu from "~/bot/menu/balance";
import * as LockMenu    from "~/bot/menu/lock";
import * as PayoutMenu  from "~/bot/menu/payout";
import * as ProfileMenu from "~/bot/menu/profile";
import * as RefundMenu  from "~/bot/menu/refund";
import * as ResolveMenu from "~/bot/menu/mark";
import * as UnlockMenu  from "~/bot/menu/unlock";

const options = [
	BalanceMenu,
	LockMenu,
	PayoutMenu,
	ProfileMenu,
	RefundMenu,
	ResolveMenu,
	UnlockMenu,
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