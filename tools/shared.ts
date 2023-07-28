import fs from 'node:fs/promises';
import path from 'node:path';

import findProcess from 'find-process';

export const buildDirectory = './build';


// Function to kill every instance of the bot that was running before
export async function signalDestruction() {
	const list = await findProcess('name', 'node', false);
	const files = (await fs.readdir(buildDirectory))
		.map(x => path.join(buildDirectory, x));

	console.log(`Searching for: ${files.join(", ")}`)

	for (const proc of list) {
		let found = false;
		for (const file of files) {
			if (proc.cmd.includes(file)) {
				found = true;
				break;
			}
		}

		if (!found) continue;

		console.log(`Killing ${proc.name} ${proc.cmd}`);
		process.kill(proc.pid, "SIGTERM");
	}
}