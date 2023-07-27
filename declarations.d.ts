declare module 'mimetype' {
	export function lookup(filename: string): string | false;
	export function set(extension: string, mimetype: string): void;
	export function del(extension: string): void;
	export function forEach(callback: (extension: string, mimetype: string) => void): void;
}