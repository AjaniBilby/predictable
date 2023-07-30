import { SignalExisting } from "./shared";

// Main function
async function main() {
	try {
		await SignalExisting("SIGTERM");
	} catch (err) {
		console.error(err);
	}
}

main();