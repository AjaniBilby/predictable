import { exec, spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import { signalDestruction } from "./shared";


const buildDirectory = './build';
const botBuild = `bot_${Date.now().toString(16)}.js`;
const webBuild = `web_${Date.now().toString(16)}.js`;
const botPath = path.join(buildDirectory, botBuild);
const webPath = path.join(buildDirectory, webBuild);


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
		build("source/bot/index.ts", botPath),
		build("source/website/server.ts", webPath)
	]);

	if (res.some(x => x === false))
		process.exit(1);
}


function spawnApps() {
	const botInst = spawn('node', [botPath], {
		detached: true,
		stdio: 'ignore'
	});
	botInst.unref();

	const webInst = spawn('node', [webPath], {
		detached: true,
		stdio: 'ignore'
	});
	webInst.unref();
}


// Function to delete the old build files
async function deleteOldFiles() {
	const files = await fs.readdir(buildDirectory);

	for (const file of files) {
		if (!file.endsWith('.js')) continue;
		if (file === botBuild) continue;
		if (file === webBuild) continue;

		await fs.unlink(path.join(buildDirectory, file));
	}
}

// Main function
async function main() {
	try {
		await buildFiles();

		await signalDestruction();
		spawnApps();

		await deleteOldFiles();

		process.exit(0);
	} catch (err) {
		console.error(err);
	}
}

main();