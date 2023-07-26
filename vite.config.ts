import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: './src/index.ts',
			formats: ['es'],
			fileName: 'index',
		},
		minify: false,
		outDir: 'bin',
		rollupOptions: {
			external: [/node:.*/],
		},
		watch: {},
	},
});
