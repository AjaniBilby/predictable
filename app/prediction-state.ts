const STATES = [ "OPEN", "LOCKED", "PAYING", "CLOSED", "INVALID" ];



function getStateIndex(state: string) {
	const index = STATES.indexOf(state);
	if (index === -1) throw new Error(`Unknown prediction state: ${state}`);

	return index;
}

const lockable = STATES.indexOf("OPEN");
export function isLockable(state: string) {
	return getStateIndex(state) <= lockable;
}

const voteable = STATES.indexOf("OPEN");
export function isVotable(state: string) {
	return getStateIndex(state) <= voteable;
}

const payable = STATES.indexOf("PAYING");
export function isPayable(state: string) {
	return getStateIndex(state) < payable;
}