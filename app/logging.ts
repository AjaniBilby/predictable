import { createWriteStream } from "node:fs";

const botStream = createWriteStream('./log-bot.txt', { flags: "a" });
const webStream = createWriteStream('./log-web.txt', { flags: "a" });


function encodeDateTime() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');  // JS months start at 0
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function show(mode: Mode, msg: string) {
	switch (mode) {
		case "INFO": return console.info(msg);
		case "WARN": return console.warn(msg);
		case "ERR" : return console.error(msg);
		case "CRIT": return console.error(msg);
	}
}


type Mode = "INFO" | "WARN" | "ERR" | "CRIT";

export function bot(mode: Mode, msg: string) {
	botStream.write(`${encodeDateTime()}  ${mode.padEnd(4, ' ')}: ${msg}\n`);
	show(mode, msg);
}

export function web(mode: Mode, msg: string) {
	webStream.write(`${encodeDateTime()}  ${mode.padEnd(4, ' ')}: ${msg}\n`);
	show(mode, msg);
}