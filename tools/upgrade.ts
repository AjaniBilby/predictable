import { exec, spawn, execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

import { FindExisting, SignalExisting } from "./shared";


const platform = os.platform();
const isUNIX = platform === 'darwin' || platform === 'linux' || platform === 'freebsd' || platform === 'openbsd' || platform === 'sunos' || platform === 'aix';

const buildDirectory = './build';
const botBuild = `unified_predictable_${Date.now().toString(32)}.js`;
const botPath = path.join(buildDirectory, botBuild);


function UpdateCommitID() {
	fs.writeFile('./COMMIT', execSync("git rev-parse HEAD").toString().trim());
}


function build(src: string, dst: string) {
	return new Promise((res, rej) => {
		exec(`npx esbuild ${src} --bundle --platform=node --target=node19 --outfile=${dst}`, (error, stdout, stderr) => {
			if (error) {
				console.error(`Compilation Error: ${stderr}`);
				rej(false);
			}

			console.log(stdout);

			res(true);
		});
	});
}


async function buildFiles() {
	const res = await Promise.all([
		build("source/index.ts", botPath),
	]);

	if (res.some(x => x === false)) process.exit(1);
}


function spawnApps() {
	const botInst = spawn('node', ['handler.js', botPath], {
		detached: true,
		stdio: 'ignore'
	});
	botInst.unref();
}


// Function to delete the old build files
async function deleteOldFiles() {
	const files = await fs.readdir(buildDirectory);

	for (const file of files) {
		if (!file.endsWith('.js')) continue;
		if (file === botBuild) continue;

		await fs.unlink(path.join(buildDirectory, file));
	}
}

// Main function
async function main() {
	try {
		const pids = await FindExisting();

		// Tell the existing instances that an upgrade is coming
		if (isUNIX) {
			SignalExisting("SIGUSR1", pids);
		}

		console.log("Pulling changes");
		console.log(execSync("git pull").toString());
		console.log("Installing npm dependency updates");
		console.log(execSync("npm i").toString());
		console.log("Building dependencies");
		console.log(execSync("npm run build").toString());

		UpdateCommitID();

		console.log("Building new version");
		await buildFiles();

		console.log("Signaling existing instances closure");
		SignalExisting("SIGTERM", pids);
		console.log("Starting new instances");
		spawnApps();

		console.log("Deleting old instance files");
		await deleteOldFiles();

		process.exit(0);
	} catch (err: any) {
		if (err?.stderr) {
			console.error(err.stderr.toString());
		} else {
			console.error(err);
		}
	}
}

main();