import findProcess from 'find-process';

// Function to kill every instance of the bot that was running before
async function killApps() {
	const list = await findProcess('name', 'node', true);

	for (const proc of list) {
		if (!proc.cmd.includes('./build')) continue;
		process.kill(proc.pid);
	}
}

// Main function
async function main() {
	try {
		await killApps();
	} catch (err) {
		console.error(err);
	}
}

main();