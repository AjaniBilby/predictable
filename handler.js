const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');

const platform = os.platform();
const isUNIX = platform === 'darwin' || platform === 'linux' || platform === 'freebsd' || platform === 'openbsd' || platform === 'sunos' || platform === 'aix';
const target = process.argv[2];

const child = spawn('node', [target], {
	stdio: [
		'inherit', // stdin
		'pipe',    // stdout
		'pipe'     // stderr
	]
});

const logStream = fs.createWriteStream('log-all.txt', { flags: 'a' });
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

// Handle the child process closing
child.on('close', (code) => {
	console.log(`Child process exited with code ${code}`);
	logStream.write(`\nExited ${code}`);
	logStream.end();
	process.exit(code);
});