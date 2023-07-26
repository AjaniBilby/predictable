import { exec, spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import fsClassic from "node:fs";
import findProcess from 'find-process';
import path from 'path';

const buildDirectory = 'build';
const uniqueFileName = `bot_${Date.now()}.js`;
const filePath = path.join(buildDirectory, uniqueFileName);

// Function to build a new file with a unique name
async function buildFile() {
	return new Promise<string>((resolve, reject) => {
		exec(`npx esbuild source/bot/index.ts --bundle --platform=node --target=node19 --outfile=${filePath}`, (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				reject(error);
			}

			console.log(`stdout: ${stdout}`);
			console.error(`stderr: ${stderr}`);
			resolve(filePath);
		});
	});
}

// Function to start the new Node.js app in detached mode
async function runApp(filePath: string) {
	const out = await fsClassic.createWriteStream('./out.log', {flags: 'a'});

	const child = spawn('node', [filePath], {
		detached: true,
		stdio: ['ignore', out, out]
	});

	child.unref();
}

// Function to kill every instance of the bot that was running before
async function killOldBots() {
	const list = await findProcess('name', 'node', true);

	for (const proc of list) {
		if (!proc.cmd.includes('./build/bot')) continue;
		if (proc.cmd.includes(uniqueFileName)) continue;

		process.kill(proc.pid);
	}
}

// Function to delete the old build files
async function deleteOldFiles() {
	const files = await fs.readdir(buildDirectory);

	for (const file of files) {
		if (!file.endsWith('.js')) continue;
		if (file === uniqueFileName) continue;

		await fs.unlink(path.join(buildDirectory, file));
	}
}

// Main function
async function main() {
	try {
		const filePath = await buildFile();
		runApp(filePath);
		await killOldBots();
		await deleteOldFiles();
	} catch (err) {
		console.error(err);
	}
}

main();