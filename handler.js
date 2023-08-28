const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');

const platform = os.platform();
const isUNIX = platform === 'darwin' || platform === 'linux' || platform === 'freebsd' || platform === 'openbsd' || platform === 'sunos' || platform === 'aix';
const target = process.argv[2];

const logStream = fs.createWriteStream('log-all.txt', { flags: 'a' });
let child;

function StartChild() {
	child = spawn('node', [target], {
		stdio: [
			'inherit', // stdin
			'pipe',    // stdout
			'pipe'     // stderr
		]
	})

	child.stdout.pipe(logStream);
	child.stderr.pipe(logStream);

	// Forward signals to the child
	if (isUNIX) {
		process.on('SIGUSR1', function () {
			child.kill('SIGUSR1');
		});
	}

	process.on('SIGTERM', function () {
		child.kill('SIGTERM');
	});

	child.on('close', ChildCloseHandler);
}

function ChildCloseHandler(code) {
	console.log(`Child process exited with code ${code}`);
	logStream.write(`\nExited ${code}\n\n`);

	StartChild();
}

StartChild();