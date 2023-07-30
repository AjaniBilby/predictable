import fs from 'node:fs/promises';
import path from 'node:path';

import findProcess from 'find-process';

export const buildDirectory = './build';

export async function FindExisting() {
	const list = await findProcess('name', 'node', false);
	const files = (await fs.readdir(buildDirectory))
		.map(x => path.join(buildDirectory, x));

	console.log(`Searching for: ${files.join(", ")}`);

	const processes: number[] = [];

	for (const proc of list) {
		let found = false;
		for (const file of files) {
			if (proc.cmd.includes(file)) {
				found = true;
				break;
			}
		}

		if (!found) continue;

		console.log(`  Found ${proc.name} ${proc.cmd}`);
		processes.push(proc.pid);
	}

	return processes;
}


// Function to kill every instance of the bot that was running before
export function SignalExisting(signal: string, pids: number[]) {
	console.log(`${signal}ing existing...`);

	for (const pid of pids) {
		console.log(`  - ${pid}`);
		process.kill(pid, signal);
	}
}