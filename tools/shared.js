const findProcess = require('find-process');

const matcher = /^node build(\/|\\)(bot|web)_[a-f0-9]+\.js$/ ;
const buildDirectory = './build';

// Function to kill every instance of the bot that was running before
async function signalDestruction() {
	const list = await findProcess('name', 'node', true);
	const targets = list.filter(proc => matcher.test(proc.cmd));

	console.log(`Found:`);
	console.log(list.map(x => "  - "+x.cmd).join("\n"))

	for (const proc of targets) {
		console.log(`Killing ${proc.name} ${proc.cmd}`);
		try {
			process.kill(proc.pid);
		} catch (e) {
			console.error('Failed to kill');
			console.error(e);
		}
	}
}

module.exports = {
	buildDirectory,
	signalDestruction
}