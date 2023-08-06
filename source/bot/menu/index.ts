import type { CacheType, ContextMenuCommandInteraction } from "discord.js";

// import * as OddsMenu    from "./odds";
import * as BalanceMenu from "./balance";
import * as LockMenu from "./lock";
import * as PayoutMenu from "./payout";
import * as ProfileMenu from "./unlock";
import * as RefundMenu from "./refund";
import * as ResolveMenu from "./mark";
import * as UnlockMenu from "./unlock";


const options = [
	// OddsMenu,
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