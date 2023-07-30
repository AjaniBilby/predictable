import { FindExisting, SignalExisting } from "./shared";

// Main function
async function main() {
	try {
		const pids = await FindExisting();;
		SignalExisting("SIGTERM", pids);
	} catch (err) {
		console.error(err);
	}
}

main();