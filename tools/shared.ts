import findProcess from 'find-process';

export const buildDirectory = './build';


const matcher = /build(\/|\\)(bot|web)_[a-f0-9]+\.js/g ;

// Function to kill every instance of the bot that was running before
export async function signalDestruction() {
	const list = await findProcess('name', 'node', true);

	for (const proc of list) {
		if (!proc.name.includes("node")) continue;

		if (matcher.test(proc.cmd) === false) continue;

		process.kill(proc.pid);
	}
}