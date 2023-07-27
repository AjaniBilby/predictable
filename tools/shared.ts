import fs from 'node:fs/promises';
import path from 'node:path';

import findProcess from 'find-process';

export const buildDirectory = './build';


// Function to kill every instance of the bot that was running before
export async function signalDestruction() {
	const list = await findProcess('name', 'node', true);
	const files = (await fs.readdir(buildDirectory))
		.map(x => path.join(buildDirectory, x));

	for (const proc of list) {
		if (!proc.name.includes("node")) continue;

		let found = false;
		for (const file of files) {
			if (proc.cmd.includes(file)) {
				found = true;
				break;
			}
		}

		if (found) process.kill(proc.pid);
	}
}