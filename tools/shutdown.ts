import { signalDestruction } from "./shared";

// Main function
async function main() {
	try {
		await signalDestruction();
	} catch (err) {
		console.error(err);
	}
}

main();