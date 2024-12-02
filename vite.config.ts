import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	ssr: {
		noExternal: ['vite']
	},
	build: {
		target: "esnext",
		// rollupOptions: {
    //   input: {
    //     server: path.resolve(__dirname, './source/website/server.js'),
    //     client: path.resolve(__dirname, './source/website/client.js'),
    //   },
    //   output: {
    //     format: 'esm', // Ensure ESM output for both
    //     entryFileNames: '[name].js', // Output files named server.js and client.js
    //   },
    // }
	},
	plugins: [
		tsconfigPaths()
	],
});
