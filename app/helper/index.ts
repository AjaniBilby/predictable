export function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function ChunkArray<T>(array: T[], size: number): T[][] {
	const chunked: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunked.push(array.slice(i, i + size));
	}
	return chunked;
}